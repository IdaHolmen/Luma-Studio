import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
app.use(express.json());

console.log("Starter server...");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Mangler MONGODB_URI i server/.env");
  process.exit(1);
}

const client = new MongoClient(uri);

app.get("/health", async (req, res) => {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    res.json({ ok: true, message: "MongoDB ping OK" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get("/api/items", async (req, res) => {
  try {
    await client.connect();

    const db = client.db("luma");
    const items = await db.collection("items").find({}).limit(20).toArray();

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});
