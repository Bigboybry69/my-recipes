# Radtion 4011 — my recipes

A phone-friendly personal cookbook with recipe search, ingredient search, and a shopping checklist. Includes the family favorite Cream Cheese Chicken dinner recipe. No account or API keys required.

## Run

Use Node.js 18 or later. No dependency installation is needed.

```sh
npm start
```

The server listens on port 3000 (override with `PORT`). Open it in your browser to use the app.

## Your data

Recipes live in `public/recipes.js`, tracked in GitHub and published with the website. Every device sees the same collection. Send recipes to the assistant to add or update in that file, then push to `main` to trigger the GitHub Pages deployment. The browser only searches and displays this shared collection; it never reads or writes recipes in localStorage.

Only the shopping checklist is stored locally on each browser. It does not sync across devices. Previous browser-saved recipes are left untouched but no longer used.

## Validate

```sh
node --check server.js
node --check public/app.js
npm test
```

The integration tests start an isolated server and verify the app and assets are served successfully.
