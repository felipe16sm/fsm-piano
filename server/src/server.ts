import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./db";
import musicRoutes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/musics", musicRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "../../client/dist");

app.use(express.static(frontendPath));

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

await connectDB();

app.listen(3000, () => {
  console.log("🚀 Server rodando em http://localhost:3000");
});