import fs from 'fs';
import https from 'https';
import sharp from 'sharp';

// Sketch-bust figure icons to match the existing Figures-page style (header-mlk.png):
// soft sepia pencil-and-ink portrait, dignified three-quarter bust, faint relevant
// landmark behind, cream background + circular vignette. gpt-image-1 outputs 1024x1024;
// we upscale to 1254x1254 to match the other header-*.png files exactly.
const ENV_PATH = 'C:/Users/Naor/Desktop/Startups/Historical Hot Takes/legends-library/.env';
const OUT_DIR = 'C:/Users/Naor/Desktop/Startups/Historical Hot Takes/legends-web/public/images/figures';
const TARGET = 1254;

const env = fs.readFileSync(ENV_PATH, 'utf8');
const apiKey = env.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, '');
if (!apiKey) { console.error('No OPENAI_API_KEY found in', ENV_PATH); process.exit(1); }

const STYLE = `Premium archival portrait in a soft sepia pencil-and-ink sketch style — fine graphite shading with delicate cross-hatching, the look of a refined 19th-century encyclopaedia engraving rendered as a drawing. Sepia and warm cream monochrome only, no full color. Dignified three-quarter bust portrait. Museum-quality archival illustration. No text, no words, no labels, no logos.`;

const IMAGES = [
  {
    file: 'header-franklin.png',
    prompt: `Benjamin Franklin, American Founding Father, printer, inventor and statesman (1706–1790). ${STYLE} Franklin in an 18th-century coat, with his characteristic high balding forehead, long hair to the shoulders and small oval spectacles, calm wise expression. Behind him, very faintly sketched in pale sepia, a printing press and a kite-and-key suggesting his experiments, fading into a plain cream ivory background with a soft circular vignette at the edges.`,
  },
  {
    file: 'header-roosevelt.png',
    prompt: `Theodore Roosevelt, 26th President of the United States (1858–1919). ${STYLE} Roosevelt in a period suit, with his characteristic bushy mustache and pince-nez spectacles, vigorous determined expression. Behind him, very faintly sketched in pale sepia, rugged mountains and a national-park landscape suggesting his conservationism, fading into a plain cream ivory background with a soft circular vignette at the edges.`,
  },
];

function generate(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: 'gpt-image-1', prompt, n: 1, size: '1024x1024', quality: 'medium' });
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) { reject(new Error(json.error.message)); return; }
          const b64 = json.data?.[0]?.b64_json;
          if (b64) { resolve(Buffer.from(b64, 'base64')); return; }
          reject(new Error('No b64_json: ' + data.slice(0, 300)));
        } catch (e) { reject(new Error(e.message + ' | raw: ' + data.slice(0, 300))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

let ok = 0, fail = 0;
for (const img of IMAGES) {
  console.log(`Generating sketch bust: ${img.file} ...`);
  try {
    const raw = await generate(img.prompt);
    const resized = await sharp(raw).resize(TARGET, TARGET, { fit: 'cover' }).png().toBuffer();
    fs.writeFileSync(`${OUT_DIR}/${img.file}`, resized);
    console.log(`  saved ${img.file} (${TARGET}x${TARGET})`);
    ok++;
  } catch (err) {
    console.error(`  FAILED ${img.file} — ${err.message}`);
    fail++;
  }
}
console.log(`\nDone. ${ok} ok, ${fail} failed.`);
