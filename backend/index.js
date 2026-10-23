require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS : liste blanche d'origines
const allowed = (process.env.ALLOWED_ORIGINS || "http://localhost:5500")
  .split(",").map((s) => s.trim());
app.use(cors({
  origin: (origin, cb) =>
    !origin || allowed.includes(origin) ? cb(null, true) : cb(new Error("CORS_BLOCKED")),
}));
app.use(express.json());

// Schéma et modèle
const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    clientId: { type: String, unique: true, sparse: true }, // idempotence (partie 8)
  },
  { timestamps: true }
);
const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

// Connexion (réutilisée entre invocations serverless)
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI manquant");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "L'API répond", time: new Date().toISOString() });
});

app.get("/api/items", async (req, res, next) => {
  try {
    await connectDB();
    res.json(await Item.find().sort({ createdAt: -1 }).limit(100));
  } catch (e) { next(e); }
});

app.post("/api/items", async (req, res, next) => {
  try {
    const { name, description = "", clientId } = req.body || {};
    if (typeof name !== "string" || name.trim().length < 2 || name.length > 100) {
      return res.status(400).json({ error: "Le champ 'name' est obligatoire (2 à 100 caractères)" });
    }
    await connectDB();
    try {
      const item = await Item.create({ name, description: String(description), clientId });
      return res.status(201).json(item);
    } catch (e) {
      // Doublon d'un même clientId : on renvoie l'élément existant (idempotence)
      if (e.code === 11000 && clientId) {
        return res.status(200).json(await Item.findOne({ clientId }));
      }
      throw e;
    }
  } catch (e) { next(e); }
});

app.use((req, res) => res.status(404).json({ error: "Route introuvable" }));

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "JSON invalide" });
  if (err.message === "CORS_BLOCKED") return res.status(403).json({ error: "Origine non autorisée" });
  if (err.name === "ValidationError") return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));
}
module.exports = app;