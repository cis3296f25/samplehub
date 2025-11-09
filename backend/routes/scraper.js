import dotenv from "dotenv";
import fetch from "node-fetch";
import express from "express";
//DATABASE SETUP
import Pool from "../db.js";
dotenv.config();

const router = express.Router();
const apiKey = process.env.FREESOUND_API_KEY;
const baseUrl = "https://freesound.org/apiv2";

async function fetchSounds(){
    const keywords = ["rain", "ocean", "wind", "fire", "bell", "forest"];
    const randomkeyword = keywords[Math.floor(Math.random() * keywords.length)];

    console.log(`Fetching sounds for keyword: ${randomkeyword}`);


    const searchUrl = `https://freesound.org/apiv2/search/text/?query=${randomkeyword}&fields=id,name,url,previews,license,tags&token=${apiKey}&page_size=5`

    try {
        const response = await fetch(searchUrl);
        const data = await response.json();

        for (const sound of data.results) {
            const existing = await Pool.query("SELECT * FROM samples WHERE source_url LIKE $1", [`%${sound.id}%`]);
            if (existing.rows.length === 0){
                await Pool.query(
                    `INSERT INTO samples (title, source, source_url, preview_url, bpm, key_sig, genre, license)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        sound.name,
                        "FreeSound",
                        sound.url,
                        sound.previews["preview-hq-mp3"],
                        null,
                        null,
                        sound.tags && sound.tags.length > 0 ? sound.tags[0] : null,
                        sound.license
                    ]
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

router.get("/sound/:id", async (req, res) => {
    const {id} = req.params;
    try {
        const existing = await Pool.query("SELECT * FROM samples WHERE source_url LIKE $1", [`%${id}%`]);
        if (existing.rows.length > 0) {
                console.log("Sound found in Database");
                return res.json({
                    ...existing.rows[0],
                    previews: { "preview-hq-mp3": existing.rows[0].preview_url }
        });
}


        const response = await fetch(`${baseUrl}/sounds/${id}/?token=${apiKey}`);
        const data = await response.json();

        await Pool.query(
            `INSERT INTO samples (title, source, source_url, preview_url, bpm, key_sig, genre, license)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                data.name,
                "FreeSound",
                data.url,
                data.previews["preview-hq-mp3"],
                null,
                null,
                data.tags ? data.tags[0] : null,
                data.license
            ]
        );

        console.log("Sound saved to Database");
        res.json(data);

    } catch (err) {
        console.error("Error fetching sound: ", err);
        res.status(500).json({error: "Failed to fetch sound"});
    }
});

export default router;

