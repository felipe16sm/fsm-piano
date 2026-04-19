import { Router } from "express";
import { db } from "../db";
import type { Music } from "../models";
import { ObjectId } from "mongodb";

const router = Router();
const collection = db.collection<Music>("musics");

router.post("/", async (req, res) => {
  const music: Music = req.body;

  const result = await collection.insertOne(music);

  res.json({
    insertedId: result.insertedId,
  });
});

router.get("/", async (_, res) => {
  const data = await collection.find().toArray();
  res.json(data);
});

router.get("/:id", async (req, res) => {
  const data = await collection.findOne({
    _id: new (require("mongodb").ObjectId)(req.params.id),
  });

  res.json(data);
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const music: Music = req.body;

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: music }
  );

  res.json({
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  });
});


router.delete("/:id", async (req, res) => {
  await collection.deleteOne({
    _id: new (require("mongodb").ObjectId)(req.params.id),
  });

  res.json({ ok: true });
});

export default router;
