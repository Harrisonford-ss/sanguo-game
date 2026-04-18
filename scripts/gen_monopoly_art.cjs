const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const sharp = require('sharp');

const API_KEY = 'sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO';

const images = [
  {
    id: 'monopoly_banner',
    size: '1024x512',
    w: 1024, h: 512,
    quality: 78,
    prompt: 'Ancient Chinese Three Kingdoms era aerial panorama map, bird eye view of kingdoms with cities and roads connecting them, colorful illustrated antique map style, Wei kingdom in north with blue banners, Shu kingdom in west with green banners, Wu kingdom in south-east with red banners, gold coins and dice on the map, decorative border pattern, warm parchment paper tone, vibrant colors, NO text NO watermark NO letters NO writing, anime game art style'
  },
  {
    id: 'monopoly_map_bg',
    size: '768x768',
    w: 768, h: 768,
    quality: 65,
    prompt: 'Aged parchment map texture of ancient China, subtle terrain features, mountains rivers plains drawn in classic Chinese ink painting style, soft warm beige and cream tones with faint golden hue, very subtle and understated, used as background texture, NO text NO watermark NO labels NO writing, top-down view'
  },
];

function apiRequest(prompt, size) {
  return new Promise((resolve, reject) => {
    const b = JSON.stringify({ model: 'flux.1-kontext-pro', prompt, n: 1, size });
    const req = https.request({
      hostname: 'api.n1n.ai', path: '/v1/images/generations', method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) }
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(new Error(Buffer.concat(chunks).toString().substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(b); req.end();
  });
}

async function main() {
  const outDir = '/home/ubuntu/sanguo-game/images';

  for (const img of images) {
    console.log(`生成 ${img.id}...`);
    const json = await apiRequest(img.prompt, img.size);
    const item = json.data[0];

    let imgBuf;
    if (item.b64_json) {
      imgBuf = Buffer.from(item.b64_json, 'base64');
    } else {
      execSync(`curl -sL "${item.url}" -o /tmp/${img.id}_raw.tmp`);
      imgBuf = fs.readFileSync(`/tmp/${img.id}_raw.tmp`);
    }

    const compressed = await sharp(imgBuf)
      .resize(img.w, img.h, { fit: 'cover' })
      .webp({ quality: img.quality })
      .toBuffer();

    const outPath = `${outDir}/${img.id}.webp`;
    fs.writeFileSync(outPath, compressed);
    console.log(`✓ ${img.id}.webp ${Math.round(compressed.length/1024)}KB → ${outPath}`);
    await new Promise(r => setTimeout(r, 800));
  }
  console.log('\n完成！');
}

main().catch(console.error);
