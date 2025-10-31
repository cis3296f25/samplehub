import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const loginUser = async (req, res) => {};

const signupUser = async (req, res) => {
  const { email, password } = req.body;

  try{
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  }
};

export default { signupUser, loginUser };
