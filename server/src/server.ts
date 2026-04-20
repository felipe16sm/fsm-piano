import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

import musicRoutes from "./routes";

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 30,

  handler: (req: any, res: any) => {
    const retryAfter = Math.ceil(
      (req.rateLimit.resetTime.getTime() - Date.now()) / 1000,
    );

    res.status(429).json({
      error: "Muitas requisições",
      retryAfter,
    });
  },
});

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/musics", limiter, musicRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "../../client/dist");

app.use(express.static(frontendPath));

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(3000, () => {
  console.log("🚀 Server rodando em http://localhost:3000");
});
