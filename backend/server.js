import express from "express";
import userRoutes from "./routes/user";

const port = 5173;

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
