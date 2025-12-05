import pool from "../db.js";

export async function ensureUser(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE firebase_uid = $1",
      [req.firebaseUid],
    );

    if (result.rows.length === 0) {
      const insert = await pool.query(
        "INSERT INTO users (firebase_uid, email) VALUES ($1, $2) RETURNING *",
        [req.firebaseUid, req.email],
      );
      req.user = insert.rows[0];
    } else {
      req.user = result.rows[0];
    }

    next();
  } catch (err) {
    console.error("ensureUser error:", err);
    res.status(500).json({ error: "Database error" });
  }
}
