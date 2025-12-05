import pool from "../db.js";
import fetch from "node-fetch";

const downloadFile = async (req, res) => {
  const sampleId = req.params.sampleId;

  try {
    const result = await pool.query(
      `SELECT title, preview_url FROM samples WHERE id = $1`,
      [sampleId],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Sample not found.");
    }

    const sample = result.rows[0];
    const fileUrl = sample.preview_url;
    const fileName = `${sample.title.replace(/[^a-z0-9]/gi, "_")}.mp3`;

    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      return res.status(500).send("Failed to fetch file from source.");
    }

    res.setHeader(
      "Content-Type",
      fileResponse.headers.get("content-type") || "audio/mpeg",
    );
    res.setHeader("Content-Length", fileResponse.headers.get("content-length"));
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    fileResponse.body.pipe(res);
  } catch (error) {
    console.error(`Error in downloadFile for sample ${sampleId}:`, error);
    if (!res.headersSent) {
      res.status(500).send("Error during download.");
    }
  }
};

export { downloadFile };
