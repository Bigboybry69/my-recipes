# Gather — my recipes

A phone-friendly personal cookbook with recipe search, ingredient search, recipe editing, and a shopping checklist. Includes six starter recipes. No account or API keys required.

## Run

Use Node.js 18 or later. No dependency installation is needed.

```sh
npm start
```

The server listens on port 3000 (override with `PORT`). Open it in your browser to use the app.

## Your data

Recipes and shopping items are stored in localStorage in the current browser and origin. They do not automatically sync across devices. Use **Back up recipes** to download a JSON copy and **Import backup** to merge recipes into another browser. Shopping lists are included in exports for reference; import merges recipes only. Clearing browser data removes local data.

## Validate

```sh
node --check server.js
node --check public/app.js
npm test
```

The integration tests start an isolated server and verify the app and assets are served successfully.
