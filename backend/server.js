import express from "express";
import userRoutes from "./routes/user.js";
import cors from "cors";
import dotenv from "dotenv";
import freesoundRoutes from "./routes/scraper.js"

const port = 5173;

const app = express();
app.use(cors());
app.use("/api", freesoundRoutes);
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.get("/", (req, res)=> {
  res.send("API is running");
});

const PORT = process.env.PORT || 5173;

app.get("/api/test", (req, res) => {
  res.send("API route is working");
});

app.use("/api/user/", userRoutes);

app.listen(port, () => {
  console.log(`Server is listening, started at port ${PORT}`);
});
