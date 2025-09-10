import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.route.js";

const app = express();

app.use(bodyParser.json());
app.use(express.json());

app.use("/api/auth",authRoutes);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });