import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import freesoundRoutes from "./routes/scraper.js";

dotenv.config();


const app = express();
app.use(cors());
app.use("/api", freesoundRoutes);

app.get("/", (req, res) => {
    res.send(" Freesound api is running!");

});

const PORT = process.env.PORT || 5000;
app.get("/api/test", (req, res) => {
  res.send("API route is working!");
});

app.listen(PORT, ()=> console.log(`Server started to run on port ${PORT}`));