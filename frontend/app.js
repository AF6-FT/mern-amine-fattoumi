const { BACKENDS, TIMEOUT_MS } = window.APP_CONFIG;
const statusEl = document.getElementById("status");
const listEl = document.getElementById("items");
const form = document.getElementById("item-form");

function setStatus(msg, type = "") {
  statusEl.textContent = msg;
  statusEl.className = type;
}


async function apiRequest(path, options = {}) {
  const res = await fetch(BACKENDS[0] + path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur HTTP ${res.status}`);
  }
  return res.json();
}

function render(items) {
  listEl.replaceChildren();
  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "Aucun élément.";
    listEl.append(li);
    return;
  }
  for (const it of items) {
    const li = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = it.name;
    const p = document.createElement("p");
    p.textContent = it.description || "";
    li.append(title, p);
    listEl.append(li);
  }
}

async function loadItems() {
  try {
    setStatus("Chargement…");
    render(await apiRequest("/api/items"));
    setStatus("");
  } catch (e) {
    setStatus("Impossible de charger : " + e.message, "error");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = form.querySelector("button");
  btn.disabled = true;
  try {
    await apiRequest("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.elements.name.value,
        description: form.elements.description.value,
      }),
    });
    form.reset();
    setStatus("Élément ajouté.", "ok");
    await loadItems();
  } catch (err) {
    setStatus("Échec de l'ajout : " + err.message, "error");
  } finally {
    btn.disabled = false;
  }
});

loadItems();