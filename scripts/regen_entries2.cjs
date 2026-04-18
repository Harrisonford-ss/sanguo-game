const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const sharp = require('sharp');

const API_KEY = 'sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO';

const entries = [
  {
    id: 'entry_monopoly',
    prompt: 'Ancient Chinese city street board game view, colorful vibrant market district with red lanterns hanging, golden pagodas and wooden shops, miniature toy-like perspective, dice and gold coins scattered on the path, festive lively atmosphere, warm red and gold colors, game UI button background art, vertical composition, NO text NO watermark NO letters NO words, anime illustration style, Three Kingdoms era',
  },
  {
    id: 'entry_cards',
    prompt: 'Ancient Chinese hero portrait collection display, three glowing warrior cards fanned out showing legendary generals in armor, golden magical aura emanating from cards, dramatic light rays, rich deep blue and gold colors, epic fantasy atmosphere, game UI button background art, vertical composition, NO text NO watermark NO letters NO words, anime illustration style, Three Kingdoms era',
  },
];

function apiRequest(prompt) {
  return new Promise((resolve, reject) => {
    const b = JSON.stringify({ model: 'flux.1-kontext-pro', prompt, n: 1, size: '512x768' });
    const req = https.request({
      hostname: 'api.n1n.ai', path: '/v1/images/generations', method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) }
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(new Error(Buffer.concat(chunks).toString().substring(0,200))); }
      });
    });
    req.on('error', reject);
    req.write(b); req.end();
  });
}

async function main() {
  const outDir = '/home/ubuntu/sanguo-game/images/entries';

  for (const entry of entries) {
    console.log(`生成 ${entry.id}...`);
    const json = await apiRequest(entry.prompt);
    const item = json.data[0];

    let imgBuf;
    if (item.b64_json) {
      imgBuf = Buffer.from(item.b64_json, 'base64');
    } else {
      execSync(`curl -sL "${item.url}" -o /tmp/${entry.id}_raw.tmp`);
      imgBuf = fs.readFileSync(`/tmp/${entry.id}_raw.tmp`);
    }

    const compressed = await sharp(imgBuf)
      .resize(256, 384, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer();

    const outPath = `${outDir}/${entry.id}.webp`;
    fs.writeFileSync(outPath, compressed);
    console.log(`✓ ${entry.id}.webp ${Math.round(compressed.length/1024)}KB`);
    await new Promise(r => setTimeout(r, 800));
  }
  console.log('\n完成！');
}

main().catch(console.error);
