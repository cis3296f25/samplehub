import fetch from "node-fetch";
import express from "express";
//DATABASE SETUP
import Pool from "../db.js";


const router = express.Router();
const apiKey = process.env.FREESOUND_API_KEY;
const baseUrl = "https://freesound.org/apiv2";

async function fetchSounds() {
  const keywords = ["rain", "ocean", "wind", "fire", "bell", "forest"];
  const randomkeyword = keywords[Math.floor(Math.random() * keywords.length)];

  console.log(`Fetching sounds for keyword: ${randomkeyword}`);

  const searchUrl = `https://freesound.org/apiv2/search/text/?query=${randomkeyword}&fields=id,name,url,previews,license,tags&token=${apiKey}&page_size=5`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();

    for (const sound of data.results) {
      const existing = await Pool.query(
        "SELECT * FROM samples WHERE source_url LIKE $1",
        [`%${sound.id}%`],
      );
      if (existing.rows.length === 0) {
        await Pool.query(
          `INSERT INTO samples 
                 (title, source, source_url, preview_url, genre, file_size, duration, license) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            sound.name,
            "FreeSound",
            sound.url,
            sound.previews["preview-hq-mp3"],
            sound.tags && sound.tags.length > 0 ? sound.tags[0] : null,
            sound.filesize,
            sound.duration,
            sound.license,
          ],
        );
        console.log(`Inserted sound: ${sound.name}`);
      } else {
        console.log(`Sound already exists: ${sound.name}`);
      }
    }
    console.log("Sound fetching and storing completed.");
  } catch (err) {
    console.error("Error fetching sounds: ", err);
  }
}
export { fetchSounds };

// ROUTE TO FETCH SAMPLES FROM DATABASE
router.get("/samples", async (req, res) => {
  try {
    const result = await Pool.query(
      "SELECT * FROM samples ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching samples:", err);
    res.status(500).json({ error: "Failed to fetch samples"});
  }

});

router.get("/sound/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await Pool.query(
      "SELECT * FROM samples WHERE source_url LIKE $1",
      [`%${id}%`],
    );
    if (existing.rows.length > 0) {
      console.log("Sound found in Database");
      return res.json({
        ...existing.rows[0],
        previews: { "preview-hq-mp3": existing.rows[0].preview_url },
      });
    }

    const response = await fetch(`${baseUrl}/sounds/${id}/?token=${apiKey}`);
    const data = await response.json();

    await Pool.query(
      `INSERT INTO samples 
                 (title, source, source_url, preview_url, genre, file_size, duration, license) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        data.name,
        "FreeSound",
        data.url,
        data.previews["preview-hq-mp3"],
        data.tags && data.tags.length > 0 ? data.tags[0] : null,
        data.filesize,
        data.duration,
        data.license,
      ],
    );

    console.log("Sound saved to Database");
    res.json(data);
  } catch (err) {
    console.error("Error fetching sound: ", err);
    res.status(500).json({ error: "Failed to fetch sound" });
  }
});

// ADD TO favorites
router.post("/favorites", async (req, res) => {
  const { userId, sampleId } = req.body;
  try {
    await Pool.query(
      "INSERT INTO favorites (user_id, sample_id) VALUES ($1, $2)",
      [userId, sampleId]
    );
    res.json({ message: "Added to favorites"});
  } catch (err) {
    console.error("Error adding to favorites:", err);
    res.status(500).json({ error: "Failed to add to favorites" });
  }
});

// DELETE FAV
router.delete("/favorites", async (req, res) => {
  const { userId, sampleId } = req.query;

  if (!userId || !sampleId) {
    return res.status(400).json({ error: "Missing userId or sampleId" });
  }

  try {
    await Pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND sample_id = $2",
      [userId, sampleId]
    );

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});






export default router;
