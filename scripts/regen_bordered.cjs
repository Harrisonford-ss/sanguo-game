const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const sharp = require('sharp');

const API_KEY = 'sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO';
const STYLE = ', Chinese Three Kingdoms game card art, full bleed illustration filling entire canvas edge to edge, character filling 80% of frame, dramatic dynamic pose, rich saturated colors, cinematic lighting with god rays, detailed costume, NO border NO frame NO text NO watermark, portrait orientation';

const chars = [
  {
    id: 'sunquan',
    prompt: 'Sun Quan (孙权) Wu kingdom emperor, authoritative young male in magnificent red-gold imperial dragon robes with jade ornaments, tiger pelt draped over shoulder, commanding pose with one hand raised majestically, intense bright eyes, black hair with golden crown, crimson red and gold Wu banners filling background, dramatic red sunset sky' + STYLE
  },
  {
    id: 'lusu',
    prompt: 'Lu Su (鲁肃) Wu kingdom diplomat strategist, kind dignified middle-aged male in elegant red ceremonial robes with gold embroidery, holding a scroll, warm sincere smile, black topknot, standing on a bridge over water with Wu fleet in background, warm red-gold atmosphere' + STYLE
  },
  {
    id: 'lvmeng',
    prompt: 'Lu Meng (吕蒙) Wu kingdom general, determined young-to-middle-aged male in red-gold battle armor with book in one hand and sword in other (representing his transformation from warrior to scholar-general), focused confident expression, white feather in helmet, dark red Wu army camp background with torches' + STYLE
  },
  {
    id: 'xunyu',
    prompt: 'Xun Yu (荀彧) Wei kingdom chief advisor Wang Zuo talent, elegant refined male scholar in dark blue Confucian robes with gold patterns, holding a bamboo scroll, calm wise serene expression, long black hair flowing, plum blossom petals falling in background, moonlit blue atmosphere' + STYLE
  },
];

function apiRequest(prompt) {
  return new Promise((resolve, reject) => {
    const b = JSON.stringify({ model: 'flux.1-kontext-pro', prompt, n: 1, size: '768x1024' });
    const req = https.request({
      hostname: 'api.n1n.ai', path: '/v1/images/generations', method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) }
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(b); req.end();
  });
}

async function main() {
  for (const char of chars) {
    console.log(`生成 ${char.id}...`);
    const json = await apiRequest(char.prompt);
    const item = json.data[0];
    const outPath = `/home/ubuntu/sanguo-game/images/cardart/${char.id}.webp`;

    let imgBuf;
    if (item.b64_json) {
      imgBuf = Buffer.from(item.b64_json, 'base64');
    } else {
      execSync(`curl -sL "${item.url}" -o /tmp/${char.id}_raw.tmp`);
      imgBuf = fs.readFileSync(`/tmp/${char.id}_raw.tmp`);
    }

    const compressed = await sharp(imgBuf).resize(512, 683, { fit: 'cover' }).webp({ quality: 60 }).toBuffer();
    fs.writeFileSync(outPath, compressed);
    console.log(`✓ ${char.id}.webp ${Math.round(compressed.length/1024)}KB`);
    await new Promise(r => setTimeout(r, 800));
  }
  console.log('\n全部完成！');
}

main().catch(console.error);
