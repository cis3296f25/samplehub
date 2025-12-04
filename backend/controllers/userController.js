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

export { uploadSound, getFavorites, addToFavorites, removeFromFavorites };
