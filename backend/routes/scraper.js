import dotenv from "dotenv";
import fetch from "node-fetch";
import express from "express";
//DATABASE SETUP
import Pool from "../db.js";
dotenv.config();

const router = express.Router();
const apiKey = process.env.FREESOUND_API_KEY;
const baseUrl = "https://freesound.org/apiv2";

router.get("/sound/:id", async (req, res) => {
    const {id} = req.params;
    try {
        const existing = await Pool.query("SELECT * FROM samples WHERE source_url LIKE $1", [`%${id}%`]);
        if (existing.rows.length > 0) {
            console.log("Sound found in Database");
            return res.json(existing.rows[0]);
        }

        const response = await fetch(`${baseUrl}/sounds/${id}/?token=${apiKey}`);
        const data = await response.json();

        const result = await Pool.query(
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
        res.json(result.rows[0]);

    } catch (err) {
        console.error("Error fetching sound: ", err);
        res.status(500).json({error: "Failed to fetch sound"});
    }
});

export default router;

