const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const sharp = require('sharp');

const API_KEY = 'sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO';

const SUFFIX = ', isometric pixel art style, ancient Chinese castle/city icon, detailed miniature building, transparent background or simple flat background, top-down 45 degree angle, vibrant saturated colors, game icon style, NO text NO watermark NO border NO frame, square composition';

const cities = [
  // 4 generic kingdom icons
  {
    id: 'city_wei',
    size: 64,
    prompt: 'Ancient Chinese northern fortress city with tall stone walls and dark blue roof tiles, blue and navy banners flying from towers, Wei kingdom stronghold, imposing military architecture' + SUFFIX,
  },
  {
    id: 'city_shu',
    size: 64,
    prompt: 'Ancient Chinese mountain city with green tiled roofs nestled in cliffs, lush green banners and pine trees surrounding walls, Shu kingdom scenic capital, elegant architecture' + SUFFIX,
  },
  {
    id: 'city_wu',
    size: 64,
    prompt: 'Ancient Chinese riverside harbor city with red roof pagoda towers, crimson red banners, water canal at base with small boats, Wu kingdom coastal fortress' + SUFFIX,
  },
  {
    id: 'city_contested',
    size: 64,
    prompt: 'Ancient Chinese strategic crossroads city with mixed banners of different colors, orange and gold walls, central location fortress with multiple faction flags' + SUFFIX,
  },
  // 5 important cities (larger render)
  {
    id: 'city_changan',
    size: 80,
    prompt: 'Majestic ancient Chinese imperial capital Chang\'an, grand palace complex with multiple layered roofs, massive fortified walls with 4 towers at corners, golden imperial roof tiles, blue Wei banners, the grandest city in ancient China' + SUFFIX,
  },
  {
    id: 'city_chengdu',
    size: 80,
    prompt: 'Ancient Chinese Chengdu city, Shu Han kingdom capital, surrounded by lush rice fields and bamboo forests, elegant multi-story palace on hill, green banners flying, peaceful prosperous atmosphere, misty mountain backdrop' + SUFFIX,
  },
  {
    id: 'city_jianye',
    size: 80,
    prompt: 'Ancient Chinese Jianye city Eastern Wu capital, grand harbor city on the Yangtze River, red-roofed palace on cliffs above the water, crimson Wu banners, naval fleet docked below, dramatic coastal fortress' + SUFFIX,
  },
  {
    id: 'city_chibi',
    size: 80,
    prompt: 'Ancient Chinese Chibi Red Cliffs riverside fortress, dramatic red rocky cliffs above the Yangtze River, fire and smoke effects, battle-scarred stronghold, burning ships visible in water below, epic war atmosphere' + SUFFIX,
  },
  {
    id: 'city_jingzhou',
    size: 80,
    prompt: 'Ancient Chinese Jingzhou contested strategic city, central plains fortress with walls showing damage from multiple battles, mixed faction banners torn and competing, crossroads city with roads going in 4 directions' + SUFFIX,
  },
];

function apiRequest(prompt) {
  return new Promise((resolve, reject) => {
    const b = JSON.stringify({ model: 'flux.1-kontext-pro', prompt, n: 1, size: '512x512' });
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
  const outDir = '/home/ubuntu/sanguo-game/images/cities';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  for (const city of cities) {
    console.log(`生成 ${city.id} (${city.size}px)...`);
    const json = await apiRequest(city.prompt);
    const item = json.data[0];

    let imgBuf;
    if (item.b64_json) {
      imgBuf = Buffer.from(item.b64_json, 'base64');
    } else {
      execSync(`curl -sL "${item.url}" -o /tmp/${city.id}_raw.tmp`);
      imgBuf = fs.readFileSync(`/tmp/${city.id}_raw.tmp`);
    }

    const compressed = await sharp(imgBuf)
      .resize(city.size * 2, city.size * 2, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    const outPath = `${outDir}/${city.id}.webp`;
    fs.writeFileSync(outPath, compressed);
    console.log(`✓ ${city.id}.webp ${Math.round(compressed.length/1024)}KB`);
    await new Promise(r => setTimeout(r, 600));
  }
  console.log('\n全部完成！');
}

main().catch(console.error);
