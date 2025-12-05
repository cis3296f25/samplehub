import pool from "../db.js";

const getRandomVideo = async (req, res) => {
  try {
    const countRes = await pool.query("SELECT COUNT(*) FROM playlist");
    const count = parseInt(countRes.rows[0].count);

    if (count === 0) {
      return res.status(404).json({ error: "No videos found" });
    }

    const randomOffset = Math.floor(Math.random() * count);

    const result = await pool.query(
      "SELECT video_id FROM playlist OFFSET $1 LIMIT 1",
      [randomOffset],
    );

    res.status(200).json({ videoId: result.rows[0].video_id });
  } catch (err) {
    console.error("Error fetching sounds:", err);
    res.status(500).json({ error: "Failed to fetch sounds" });
  }
};
export { getRandomVideo };
