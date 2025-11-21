import dotenv from "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  idleTimeoutMillis: 30000,
  port: 6543,
});

export default pool;
