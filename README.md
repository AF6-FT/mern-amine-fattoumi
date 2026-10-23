# mern-amine-fattoumi

## Objectif
Application MERN (Express, MongoDB Atlas, Mongoose, HTML/CSS/JS) avec deux backends (Vercel + Cloudflare) et bascule automatique.

## Installation
```bash
git clone https://github.com/AF6-FT/mern-amine-fattoumi.git
cd mern-amine-fattoumi/backend
npm install
cp .env.example .env   # puis renseigner les vraies valeurs
npm run amine
```
Frontend : `npx serve frontend -l 5500`

## Scripts (backend)
- `npm start` : `node index.js`
- `npm run amine` : `nodemon index.js`

## Variables requises
`PORT`, `MONGODB_URI`, `ALLOWED_ORIGINS` (voir `backend/.env.example`).

## Routes API
| Méthode | Route | Description |
|---|---|---|
| GET | /api/health | État de l'API |
| GET | /api/items | Liste des éléments |
| POST | /api/items | Crée un élément `{name, description, clientId}` |

## MongoDB Atlas
- Cluster de test, base `mernexam`, collection `items`.
- Utilisateur dédié `Amine` avec le rôle `readWrite` sur `mernexam` uniquement.
- Network Access : `0.0.0.0/0` pour l'examen seulement (à retirer après l'évaluation).

## URLs de déploiement
- GitHub : https://github.com/AF6-FT/mern-amine-fattoumi
- Frontend Vercel : https://mern-amine-fattoumi-frontend.vercel.app
- Backend Vercel : https://mern-amine-fattoumi-api.vercel.app
- Backend Cloudflare : _à compléter_