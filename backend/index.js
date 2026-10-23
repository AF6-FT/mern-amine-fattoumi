require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const items = [
  { id: 1, name: "Élément de démonstration", description: "Donnée de test" },
];

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "L'API répond",
    time: new Date().toISOString(),
  });
});

app.get("/api/items", (req, res, next) => {
  try {
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
});

app.post("/api/items", (req, res, next) => {
  try {
    const { name, description = "" } = req.body || {};

    if (typeof name !== "string" || name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Le champ 'name' est obligatoire (2 caractères minimum)" });
    }
    if (name.trim().length > 100) {
      return res
        .status(400)
        .json({ error: "Le champ 'name' ne doit pas dépasser 100 caractères" });
    }
    if (typeof description !== "string" || description.length > 500) {
      return res
        .status(400)
        .json({ error: "Le champ 'description' doit être un texte de 500 caractères maximum" });
    }

    const item = {
      id: items.length ? items[items.length - 1].id + 1 : 1,
      name: name.trim(),
      description: description.trim(),
    };
    items.push(item);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON invalide" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Requête trop volumineuse" });
  }
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`API sur http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Le port ${PORT} est déjà utilisé. Changez PORT dans .env.`);
    } else {
      console.error("Erreur serveur :", err);
    }
    process.exit(1);
  });
}

process.on("unhandledRejection", (reason) => console.error("Promesse rejetée :", reason));
process.on("uncaughtException", (err) => {
  console.error("Exception non gérée :", err);
  process.exit(1);
});

module.exports = app;