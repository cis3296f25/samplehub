import pool from "../db.js";
import { supabase } from "../supabaseClient.js";

const uploadSound = async (req, res) => {
  try {
    const user = req.user;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const { title, source = "user_upload", genre, duration } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Missing title" });
    }

    const ext = file.originalname.split(".").pop();
    const safeTitle = title.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filePath = `user_uploads/${user.id}/${Date.now()}_${safeTitle}.${ext}`;

    const { data, error } = await supabase.storage
      .from("samples")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
      });
    console.log(data);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    const { data: publicUrlData } = supabase.storage
      .from("samples")
      .getPublicUrl(filePath);

    const previewUrl = publicUrlData.publicUrl;
    const fileSize = file.size;

    const result = await pool.query(
      `INSERT INTO samples 
      (title, source, source_url, preview_url, genre, file_size, duration, user_id) 
      VALUES ($1, $2, NULL, $3, $4, $5, $6, $7)
      RETURNING *`,
      [safeTitle, source, previewUrl, genre, fileSize, duration, user.id],
    );

    res.status(201).json({
      message: "Sample uploaded successfully",
      sample: result.rows[0],
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload smaple" });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = req.user;
    const result = await pool.query(
      "SELECT sample_id FROM favorites WHERE user_id = $1",
      [user.id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

const addToFavorites = async (req, res) => {
  const { sampleId } = req.body;
  const user = req.user;

  if (!sampleId) {
    return res.status(400).json({ error: "Missing sampleId" });
  }

  try {
    await pool.query(
      "INSERT INTO favorites (user_id, sample_id) VALUES ($1, $2) ON CONFLICT (user_id, sample_id) DO NOTHING",
      [user.id, sampleId],
    );
    res.json({ message: "Added to favorites" });
  } catch (err) {
    console.error("Error adding to favorites:", err);
    res.status(500).json({ error: "Failed to add to favorites" });
  }
};

const removeFromFavorites = async (req, res) => {
  const { sampleId } = req.query;
  const user = req.user;

  if (!sampleId) {
    return res.status(400).json({ error: "Missing sampleId" });
  }

  try {
    await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND sample_id = $2",
      [user.id, sampleId],
    );

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
};

const addPack = async (req, res) => {
  const { packName } = req.body;
  const user = req.user;

  if (!packName) {
    return res.status(400).json({ error: "missing pack name" });
  }

  try {
    await pool.query(
      "INSERT INTO sample_packs (name, user_id) VALUES ($1, $2)",
      [packName, user.id],
    );

    res.json({ message: "Successfully created pack" });
  } catch (err) {
    console.error("Error creating pack:", err);
    res.status(500).json({ error: "Failed to create pack" });
  }
};

const addSampleToPack = async (req, res) => {
  const { sampleId } = req.body;
  const { packId } = req.params;

  if (!packId) {
    return res.status(400).json({ error: "missing packid" });
  }
  if (!sampleId) {
    return res.status(400).json({ error: "missing sampleid" });
  }

  try {
    await pool.query(
      "INSERT INTO pack_samples (pack_id, sample_id) VALUES ($1, $2) ON CONFLICT (pack_id, sample_id) DO NOTHING",
      [packId, sampleId],
    );

    res.json({ message: "Successfully added sample to pack" });
  } catch (err) {
    console.error("Error adding sample to pack:", err);
    res.status(500).json({ error: "Failed to add sample to pack" });
  }
};

const getPacks = async (req, res) => {
  const user = req.user;

  try {
    const result = await pool.query(
      `SELECT 
         sp.id, 
         sp.name, 
         sp.created_at,
         COUNT(ps.sample_id) as sample_count
       FROM sample_packs sp
       LEFT JOIN pack_samples ps ON sp.id = ps.pack_id
       WHERE sp.user_id = $1 
       GROUP BY sp.id, sp.name, sp.created_at
       ORDER BY sp.created_at DESC`,
      [user.id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching packs:", err);
    res.status(500).json({ error: "Failed to fetch packs" });
  }
};

const getPackSamples = async (req, res) => {
  const { packId } = req.params;
  const user = req.user;

  if (!packId) return res.status(400).json({ error: "Missing packId" });

  try {
    const result = await pool.query(
      `SELECT s.* FROM pack_samples ps
       JOIN samples s ON ps.sample_id = s.id
       JOIN sample_packs p ON ps.pack_id = p.id
       WHERE ps.pack_id = $1 AND p.user_id = $2`,
      [packId, user.id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching pack samples:", err);
    res.status(500).json({ error: "Failed to fetch pack samples" });
  }
};

const removePack = async (req, res) => {
  const { packId } = req.params;
  const user = req.user;

  if (!packId) return res.status(400).json({ error: "Missing packId" });

  try {
    await pool.query("DELETE FROM pack_samples WHERE pack_id = $1", [packId]);

    const result = await pool.query(
      "DELETE FROM sample_packs WHERE id = $1 AND user_id = $2 RETURNING *",
      [packId, user.id],
    );

    if (result.rowCount === 0)
      return res.status(403).json({ error: "Pack not found or unauthorized" });

    res.json({ message: "Pack deleted" });
  } catch (err) {
    console.error("Error deleting pack:", err);
    res.status(500).json({ error: "Failed to delete pack" });
  }
};

const removeSampleFromPack = async (req, res) => {
  const { packId, sampleId } = req.params;

  if (!packId || !sampleId)
    return res.status(400).json({ error: "Missing packId or sampleId" });

  try {
    await pool.query(
      "DELETE FROM pack_samples WHERE pack_id = $1 AND sample_id = $2",
      [packId, sampleId],
    );

    res.json({ message: "Removed sample from pack" });
  } catch (err) {
    console.error("Error removing sample from pack:", err);
    res.status(500).json({ error: "Failed to remove sample from pack" });
  }
};

const createPackAndAddSample = async (req, res) => {
  const { packName, sampleId } = req.body;
  const user = req.user;

  if (!packName) return res.status(400).json({ error: "Missing pack name" });
  if (!sampleId) return res.status(400).json({ error: "Missing sampleId" });

  try {
    const packRes = await pool.query(
      "INSERT INTO sample_packs (name, user_id) VALUES ($1, $2) RETURNING id, name",
      [packName, user.id],
    );

    const packId = packRes.rows[0].id;

    await pool.query(
      "INSERT INTO pack_samples (pack_id, sample_id) VALUES ($1, $2)",
      [packId, sampleId],
    );

    res.json({ message: "Pack created & sample added", pack: packRes.rows[0] });
  } catch (err) {
    console.error("Error creating pack and adding sample:", err);
    res.status(500).json({ error: "Failed to create pack & add sample" });
  }
};
const getFavoritesWithDetails = async (req, res) => {
  try {
    const user = req.user;
    const result = await pool.query(
      `SELECT s.* FROM samples s
       INNER JOIN favorites f ON s.id = f.sample_id
       WHERE f.user_id = $1
       ORDER BY s.created_at DESC`,
      [user.id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching favorites with details:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

export {
  uploadSound,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  addPack,
  addSampleToPack,
  removePack,
  removeSampleFromPack,
  getPacks,
  getPackSamples,
  createPackAndAddSample,
  getFavoritesWithDetails,
};
