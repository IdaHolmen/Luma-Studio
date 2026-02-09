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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

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

app.post("/api/messages", async (req, res) => {
  try {
    await client.connect();

    const { fullname, email, message } = req.body || {};

    if (!fullname || !email || !message) {
      return res.status(400).json({ ok: false, error: "Fullt navn, e-post og melding er påkrevd" });
    }

    const fullnameTrim = String(fullname).trim();
    const emailTrim = String(email).trim();
    const messageTrim = String(message).trim();

    if (fullnameTrim.length < 2 || fullnameTrim.length > 100) {
      return res.status(400).json({ ok: false, error: "Fullt navn må være mellom 2 og 100 tegn" });
    }

    if (!isValidEmail(emailTrim) || emailTrim.length > 100) {
      return res.status(400).json({ ok: false, error: "Ugyldig e-postadresse" });
    }

    if (messageTrim.length < 2 || messageTrim.length > 300) {
      return res.status(400).json({ ok: false, error: "Melding må være mellom 2 og 300 tegn" });
    }

    const doc = {
      fullname: fullnameTrim,
      email: emailTrim.toLowerCase(),
      message: messageTrim,
      createdAt: new Date(),
      source: "contact-form",
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"] || "",
    };

    const result = await client.db("luma").collection("messages").insertOne(doc);

    return res.status(201).json({ ok: true, id: result.insertedId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});
