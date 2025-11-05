import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

import userRoutes from "./routes/user.js";
import freesoundRoutes from "./routes/scraper.js";

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/api", freesoundRoutes);

app.use("/api/user/", userRoutes);

// Serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is listening, running at http://localhost:${PORT}`);
});
