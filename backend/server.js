import express from "express";
import userRoutes from "./routes/user.js";

const port = 3000;

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/api/user/", userRoutes);

app.listen(port, () => {
  console.log("Server is listening");
});
