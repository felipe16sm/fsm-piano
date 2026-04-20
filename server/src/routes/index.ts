import { Router } from "express";
import { sqLiteDB } from "../db";
import type { Music } from "../models";
import { cacheMiddleware, invalidateCache } from "./cache";

const router = Router();

const CACHE_TIME = 10000;

router.post("/", (req, res) => {
  const music: Music = req.body;

  const stmt = sqLiteDB.prepare(`
    INSERT INTO musics (name, sequence)
    VALUES (?, ?)
  `);

  const result = stmt.run(music.name, JSON.stringify(music.sequence));

  res.json({
    insertedId: result.lastInsertRowid,
  });
});

router.get("/", cacheMiddleware(CACHE_TIME), (_, res) => {
  const stmt = sqLiteDB.prepare(`SELECT * FROM musics`);
  const rows = stmt.all();

  const data = rows.map((row: any) => ({
    _id: row.id,
    name: row.name,
    sequence: JSON.parse(row.sequence),
  }));

  res.json(data);
});

router.get("/:id", cacheMiddleware(CACHE_TIME), (req, res) => {
  const stmt = sqLiteDB.prepare(`SELECT * FROM musics WHERE id = ?`);
  const row: any = stmt.get(req.params.id);

  if (!row) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json({
    _id: row.id,
    name: row.name,
    sequence: JSON.parse(row.sequence),
  });
});

router.put("/:id", (req, res) => {
  const music: Music = req.body;

  const stmt = sqLiteDB.prepare(`
    UPDATE musics
    SET name = ?, sequence = ?
    WHERE id = ?
  `);

  const result = stmt.run(
    music.name,
    JSON.stringify(music.sequence),
    req.params.id,
  );

  invalidateCache("/api/musics");

  res.json({
    changes: result.changes,
  });
});

router.delete("/:id", (req, res) => {
  const stmt = sqLiteDB.prepare(`DELETE FROM musics WHERE id = ?`);
  const result = stmt.run(req.params.id);

  invalidateCache("/api/musics");

  res.json({
    deleted: result.changes,
  });
});

export default router;
