import express from "express";
import pool from "./src/db.js";

const app = express();
app.use(express.json());

const port = 5173;

app.get("/", (req, res) => {
  res.send("Argh!");
});

app.post("/api/users", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *",
      [email, password],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log("Server is listening");
});
