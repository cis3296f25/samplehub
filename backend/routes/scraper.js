import fetch from "node-fetch";
import express from "express";
import pool from "../db.js";

const router = express.Router();
const apiKey = process.env.FREESOUND_API_KEY;
const BASE_URL = "https://freesound.org/apiv2";

async function insertSample(sound) {
  if (sound.duration && sound.duration > 120) {
    console.log("Skipped (too long):", sound.name);
    return false;
  }
  const exists = await pool.query(
    "SELECT 1 FROM samples WHERE source_url LIKE $1 LIMIT 1",
    [`%${sound.id}%`],
  );
  if (exists.rows.length > 0) return false;

  const cleanTitle = sound.name.replace(
    /\.(wav|wave|aiff|aif|aifc|ogg|mp3|flac)$/i,
    "",
  );
  const durationInSeconds = sound.duration ? Math.round(sound.duration) : null;

  await pool.query(
    `INSERT INTO samples 
      (title, source, source_url, preview_url, genre, file_size, duration, license) 
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      cleanTitle,
      "FreeSound",
      sound.url,
      sound.previews?.["preview-hq-mp3"] ?? null,
      sound.tags?.[0] ?? null,
      sound.filesize ?? null,
      durationInSeconds,
      sound.license ?? null,
    ],
  );
  console.log("Inserted:", sound.name);
  return true;
}

export async function fetch100Samples() {
  let totalInserted = 0;
  let page = 1;
  console.log("Fetching 100 Freesound samples...");

  while (totalInserted < 100) {
    const url = `${BASE_URL}/search/text/?query=&fields=id,name,url,previews,license,tags,filesize,duration&token=${apiKey}&page_size=30&page=${page}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log("No more results — stopping.");
      break;
    }

    for (const sound of data.results) {
      if (totalInserted >= 100) break;
      const inserted = await insertSample(sound);
      if (inserted) totalInserted++;
    }

    console.log(`Progress: ${totalInserted}/100`);
    page++;
  }

  console.log("\nInserted", totalInserted, "samples.");
}

async function fetchSounds() {
  const keywords = ["rain", "ocean", "wind", "fire", "bell", "forest"];
  const randomkeyword = keywords[Math.floor(Math.random() * keywords.length)];

  console.log(`Fetching sounds for keyword: ${randomkeyword}`);

  const searchUrl = `https://freesound.org/apiv2/search/text/?query=${randomkeyword}&fields=id,name,url,previews,license,tags&token=${apiKey}&page_size=5`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();

    for (const sound of data.results) {
      const existing = await pool.query(
        "SELECT * FROM samples WHERE source_url LIKE $1",
        [`%${sound.id}%`],
      );
      if (existing.rows.length === 0) {
        await pool.query(
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
    const result = await pool.query(
      "SELECT * FROM samples ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching samples:", err);
    res.status(500).json({ error: "Failed to fetch samples" });
  }
});

router.post("/fetch-100-samples", async (req, res) => {
  try {
    const count = await fetch100Samples();
    res.json({ success: true, inserted: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
