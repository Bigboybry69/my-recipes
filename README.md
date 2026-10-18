# Radtion 4011 — my recipes

A phone-friendly personal cookbook with recipe search, ingredient search, and a shopping checklist. Includes Cream Cheese Chicken, Creamy Cajun Shrimp and Chicken Pasta, Taco Crescent Ring, Adana Kebab, and Pork Dumplings. No account or API keys required.

## Run

Use Node.js 18 or later. No dependency installation is needed.

```sh
npm start
```

The server listens on port 3000 (override with `PORT`). Open it in your browser to use the app.

## Your data

Recipes live in `public/recipes.js`, tracked in GitHub and published with the website. Every device sees the same collection. Send recipes to the assistant to add or update in that file, then push to `main` to trigger the GitHub Pages deployment. The browser only searches and displays this shared collection; it never reads or writes recipes in localStorage.

Only the shopping checklist is stored locally on each browser. It does not sync across devices. HP is calculated from local time without saving meal logs. Previous browser-saved recipes are left untouched but no longer used.

## Validate

```sh
node --check server.js
node --check public/app.js
npm test
```

The integration tests start an isolated server and verify the app and assets are served successfully.

## Recipe stats and progression

Complexity is estimated from ingredient count, instruction count, and advanced cooking techniques, on a 1–10 scale. Each point grants 10 HP restoration and 25 collection XP. Cream Cheese Chicken is 3/10, shows a decorative +30 HP flavor bonus, and contributes 75 XP. XP is calculated from the shared collection on every load: adding recipes increases XP on every device, with a level gained every 200 XP. Level 1 starts with 100 max HP; each level-up adds 5 max HP. Browsing or eating does not award extra XP.

HP drains toward local breakfast (7:30 AM), lunch (12:30 PM), and dinner (6:30 PM), stays at 18 for the following hour, and automatically refills at 8:30 AM, 1:30 PM, and 7:30 PM. There is no meal-logging button. Recipe HP bonuses are decorative. The screen turns yellow below 50% of max HP and red below 30%, returning to green at 50% or higher. These are game stats rather than nutritional measurements.
