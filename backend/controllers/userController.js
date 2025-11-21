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

export { uploadSound };
