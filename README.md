# Radtion 4011 — my recipes

A phone-friendly personal cookbook with recipe search, ingredient search, and a shopping checklist. Includes Cream Cheese Chicken, Creamy Cajun Shrimp and Chicken Pasta, Taco Crescent Ring, Adana Kebab, Pork Dumplings, and Taiwanese Three Cup Chicken. No account or API keys required.

## Run

Use Node.js 18 or later. No dependency installation is needed.

```sh
npm start
```

The server listens on port 3000 (override with `PORT`). Open it in your browser to use the app.

## Your data

Recipes live in `public/recipes.js`, tracked in GitHub and published with the website. Every device sees the same shared family collection. Send recipes to the assistant to add or update in that file, then push to `main` to trigger the GitHub Pages deployment. The browser only searches and displays this shared collection; it never reads or writes recipes in localStorage.

Only the shopping checklist is stored locally on each browser. It does not sync across devices. HP is calculated from local time without saving meal logs. Previous browser-saved recipes are left untouched but no longer used.

## Validate

```sh
node --check server.js
node --check public/app.js
npm test
```

The integration tests start an isolated server and verify the app and assets are served successfully.

## Recipe stats and progression

Complexity is estimated from ingredient count, instruction count, and advanced cooking techniques, on a 1–10 scale. Each point grants 10 HP restoration and 25 collection XP. Cream Cheese Chicken is 3/10, shows a decorative +30 HP flavor bonus, and contributes 75 XP. XP is calculated separately for each family member from their assigned recipes on every load: adding recipes increases XP on every device, with a level gained every 200 XP. Level 1 starts with 100 max HP; each level-up adds 5 max HP. Browsing or eating does not award extra XP.

HP drains toward local breakfast (7:30 AM), lunch (12:30 PM), and dinner (6:30 PM), stays at 18 for the following hour, and automatically refills at 8:30 AM, 1:30 PM, and 7:30 PM. There is no meal-logging button. Recipe HP bonuses are decorative. The screen turns yellow below 50% of max HP and red below 30%, returning to green at 50% or higher. These are game stats rather than nutritional measurements.

## Family cookbooks

The front screen lets everyone choose Dan, Demi, Stu, or Zoe. Anyone can view any family cookbook and switch characters at any time. Each member has their own recipe list, XP, level, and maximum HP. Existing recipes stay assigned to Dan and Demi; Stu and Zoe start with empty cookbooks. Shopping items remain one shared checklist in the current browser, so a grocery run can include dishes from several cookbooks.

Assign recipes by setting `ownerId` in `public/recipes.js` to `dan`, `demi`, `stu`, or `zoe`. Recipe ownership is published with the site, never saved as a browser-only change. Recipes without an owner default to Dan for compatibility. Add new recipes and reassign existing ones through the assistant. Character names and artwork are configured in `public/family.js`.

On the first visit, the app opens at `#family`. Later launches restore the last selected character’s stats using the `radtion-last-member` browser preference. The Family button still opens the picker; explicit member links take priority over the remembered selection. Member screens use `#dan/stats`, `#demi/food`, or `#stu/items`, for example. Older `#stats`, `#food`, and `#items` links still open Dan’s cookbook. The iPhone home-screen icon remains the main green cook.

## Food photos

Recipe details include an initially expanded **View food photo** field-photo panel that can be collapsed. The natural-color serving illustrations use a worn paper frame, tape corners, and subtle scanlines. Photos are labeled in the caption as generated illustrations or original recipe photos extracted from supplied PDFs; they are not photos of the family's actual meals. Recipe cards retain their green line icons. A recipe without a `photo` field simply omits the panel. All images are bundled with the site and require no external image service.

## App updates

GitHub Pages stamps the deployed commit into the HTML and `version.json`. The app checks that version on startup, resume, focus, and once a minute while visible, using uncached requests. When a newer deployment is detected, it opens a fresh document URL with the new version while preserving the character/tab hash. Character preferences and shopping items remain in localStorage. Automatic refresh waits while a recipe dialog is open or an input is being edited. The footer's **Check for Updates** button explicitly checks and refreshes immediately if needed. Offline checks leave the current app usable. An existing installation must load this update once before these checks can run. No service worker is used.

Available food categories are Breakfast, Lunch, Dinner, and Dessert. The Snacks category has been removed.

Chinese recipes retain their original characters and use `lang: "zh-Hant"` for Traditional Chinese. Chinese recipe details show Chinese ingredient and preparation headings. Search supports Chinese titles and ingredients as well as optional English aliases. Complexity recognizes equivalent advanced cooking techniques in English and Chinese without double-counting a technique. 橙汁排骨 belongs to Zoe; it uses pork ribs, not chicken, and requires at least 3 hours of marinating.
