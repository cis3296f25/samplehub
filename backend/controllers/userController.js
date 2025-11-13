import bcrypt from "bcrypt";
import pool from "../db.js";
import jwt from "jsonwebtoken";
import validator from "validator";

const signupUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const passwordOptions = {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    };

    if (!validator.isStrongPassword(password, passwordOptions)) {
      return res.status(400).json({ error: "Password is not strong enough" });
    }

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, hashPassword],
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.status(201).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.log("Signup error:", err);
    res.status(500).json({ error: "Signup error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.status(200).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.log("Login error:", err);
    res.status(500).json({ error: "Login error" });
  }
};

const uploadSound = async (req, res) => {
  try {
    const {
      title,
      source = "user_upload",
      source_url = null,
      preview_url,
      genre,
      file_size,
      duration,
      license,
    } = req.body;

    if (!title || !preview_url) {
      return res.status(400).json({ error: "Missing title or file URL" });
    }

    const result = await pool.query(
      `INSERT INTO samples 
      (title, source, source_url, preview_url, genre, file_size, duration, license) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        title,
        source,
        source_url,
        preview_url,
        genre,
        file_size,
        duration,
        license,
      ],
    );

    res.staus(201).json({
      message: "Sample uploaded successfully",
      sample: result.rows[0],
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload smaple" });
  }
};

export { signupUser, loginUser, uploadSound };
