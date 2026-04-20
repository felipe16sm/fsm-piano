import { Database } from "bun:sqlite";

export const sqLiteDB = new Database("database.db");

sqLiteDB.run(`
  CREATE TABLE IF NOT EXISTS musics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sequence TEXT NOT NULL
  )
`);