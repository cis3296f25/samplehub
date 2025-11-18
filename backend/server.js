import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/user.js";
import searchRoutes from "./routes/search.js";
import freesoundRoutes from "./routes/scraper.js";
import { fetchSounds } from "./routes/scraper.js";

dotenv.config();

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
app.use("/search", searchRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening, running at http://localhost:${PORT}`);
});
