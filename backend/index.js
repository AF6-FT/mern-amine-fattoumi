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
  res.json({ status: "ok", message: "L'API répond", time: new Date().toISOString() });
});

app.get("/api/items", (req, res) => res.json(items));

app.post("/api/items", (req, res) => {
  const { name, description = "" } = req.body || {};
  if (typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "Le champ 'name' est obligatoire (2 caractères min.)" });
  }
  const item = { id: items.length + 1, name: name.trim(), description: String(description).trim() };
  items.push(item);
  res.status(201).json(item);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));
}
module.exports = app;