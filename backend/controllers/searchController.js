import pool from "../db.js";

const getNewestFirst = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*
      FROM samples s
      ORDER BY s.created_at DESC
      LIMIT 50;
      `,
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.err("Error fetching sounds:", err);
    res.status(500).json({ error: "Failed to fetch sounds" });
  }
};
export { getNewestFirst };
