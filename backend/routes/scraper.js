import dotenv from "dotenv";
import fetch from "node-fetch";
import express from "express";

dotenv.config();

const router = express.Router();
const apiKey = process.env.FREESOUND_API_KEY;
const baseUrl = "https://freesound.org/apiv2"


router.get("/sound/:id", async (req, res) => {
    const {id} = req.params;
    try {
        const response = await fetch(`${baseUrl}/sounds/${id}/?token=${apiKey}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Error fetching sound: ", err);
        res.status(500).json({error: "Failed to fetch sound"});
    }
});

export default router;