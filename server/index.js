import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://127.0.0.1:5502", "http://localhost:5502"],
  })
);
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "..")));

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

app.get("/api/products", async (req, res) => {
  try {
    await client.connect();

    const products = await client.db("luma").collection("products").find({}).toArray();

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});
