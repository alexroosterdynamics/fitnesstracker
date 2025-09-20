import { MongoClient } from "mongodb";
import { MONGODB_URI, MONGODB_DB, MONGODB_COLLECTION } from "./connection";

let cached = global._mongo;
if (!cached) cached = global._mongo = { client: null, db: null, col: null };

export async function getCol() {
  if (!MONGODB_URI) throw new Error("No Mongo URI configured.");

  if (cached.col) return cached.col;

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db(MONGODB_DB);
  const col = db.collection(MONGODB_COLLECTION);

  cached.client = client;
  cached.db = db;
  cached.col = col;

  // Ensure the two base docs exist so upserts always work on empty collections
  await col.updateOne(
    { _id: "status" },
    { $setOnInsert: { status: {} } },
    { upsert: true }
  );
  await col.updateOne(
    { _id: "weights" },
    { $setOnInsert: { weights: {} } },
    { upsert: true }
  );

  return col;
}
