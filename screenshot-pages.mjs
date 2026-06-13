import { chromium } from "playwright";
import { mkdirSync } from "fs";

const OUT = "C:/Users/Naor/Desktop/Startups/Historical Hot Takes/Website Pics/v2";
mkdirSync(OUT, { recursive: true });

const pages = [
  { name: "01-home",          path: "/" },
  { name: "02-figures",       path: "/figures" },
  { name: "03-how-it-works",  path: "/how-it-works" },
  { name: "04-about",         path: "/about" },
  { name: "05-pricing",       path: "/pricing" },
  { name: "06-disclaimer",    path: "/disclaimer" },
  { name: "07-terms",         path: "/terms" },
  { name: "08-privacy",       path: "/privacy" },
  { name: "09-login",         path: "/login" },
  { name: "10-signup",        path: "/signup" },
  { name: "11-hot-questions", path: "/questions" },
  { name: "12-sources",       path: "/sources" },
  { name: "13-debates",       path: "/debates" },
  { name: "14-council",       path: "/council" },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

for (const { name, path } of pages) {
  await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: `${OUT}/${name}.png`,
    fullPage: true,
  });
  console.log(`✓ ${name}`);
}

await browser.close();
console.log("Done.");
