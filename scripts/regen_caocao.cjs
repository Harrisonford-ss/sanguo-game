const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const sharp = require('sharp');

const API_KEY = 'sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO';
const prompt = 'Cao Cao (曹操) Wei kingdom founder supreme warlord, commanding middle-aged male in ornate dark navy-gold dragon armor, golden crown with jewels, sharp calculating eyes with confident smirk, long black beard, one hand holding a sword the other raised commanding troops, dramatic dark blue starry night background with golden banners and swirling clouds, Chinese Three Kingdoms game card art, full bleed illustration filling entire canvas edge to edge, character filling 80% of frame, dramatic dynamic pose, rich saturated colors, cinematic lighting, NO border NO frame NO text NO watermark, portrait orientation';

function request(body) {
  return new Promise((resolve, reject) => {
    const b = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.n1n.ai', path: '/v1/images/generations', method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) }
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString();
        try { resolve(JSON.parse(data)); } catch(e) { reject(new Error(data.substring(0,200))); }
      });
    });
    req.on('error', reject);
    req.write(b); req.end();
  });
}

async function main() {
  console.log('生成曹操卡牌图...');
  const json = await request({ model: 'flux.1-kontext-pro', prompt, n: 1, size: '768x1024' });

  let imgBuf;
  if (json.data[0].b64_json) {
    imgBuf = Buffer.from(json.data[0].b64_json, 'base64');
  } else if (json.data[0].url) {
    const url = json.data[0].url;
    console.log('下载中:', url);
    execSync(`curl -sL "${url}" -o /tmp/caocao_raw.webp`);
    imgBuf = fs.readFileSync('/tmp/caocao_raw.webp');
  }

  const compressed = await sharp(imgBuf).resize(512, 683, { fit: 'cover' }).webp({ quality: 60 }).toBuffer();
  fs.writeFileSync('/home/ubuntu/sanguo-game/images/cardart/caocao.webp', compressed);
  console.log('✓ caocao.webp ' + Math.round(compressed.length / 1024) + 'KB');
}

main().catch(console.error);
