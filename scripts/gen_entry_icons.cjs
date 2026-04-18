const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const sharp = require('sharp');

const API_KEY = 'sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO';

const entries = [
  {
    id: 'entry_map',
    prompt: 'Ancient Chinese battlefield panorama, two armies clashing with spears and swords, red and blue battle flags, dramatic golden sunset, dust clouds rising, epic war scene, game UI button background art, vertical composition, rich colors, NO text NO watermark, anime illustration style, Three Kingdoms era',
    desc: '关卡'
  },
  {
    id: 'entry_quiz',
    prompt: 'Ancient Chinese scholar studying bamboo scrolls by candlelight, calligraphy brushes and ink, glowing lantern, wisdom and knowledge theme, warm golden atmosphere, game UI button background art, vertical composition, NO text NO watermark, anime illustration style, Three Kingdoms era',
    desc: '答题'
  },
  {
    id: 'entry_gacha',
    prompt: 'Magical summoning portal swirling with golden energy and light particles, ancient Chinese mystical runes floating, legendary warriors emerging from golden light vortex, dramatic magical atmosphere, game UI button background art, vertical composition, NO text NO watermark, anime illustration style',
    desc: '抽卡'
  },
  {
    id: 'entry_cards',
    prompt: 'Collection of glowing warrior cards arranged in a fan, each card showing a heroic Three Kingdoms general portrait, golden magical light emanating, ancient Chinese decorative motifs, rich vibrant colors, game UI button background art, vertical composition, NO text NO watermark, anime illustration style',
    desc: '图鉴'
  },
  {
    id: 'entry_dungeon',
    prompt: 'Dark mysterious ancient Chinese dungeon corridor, stone walls with torch fire flickering, treasure chests and monster shadows lurking, fog and mystical atmosphere, roguelike adventure theme, game UI button background art, vertical composition, NO text NO watermark, anime illustration style',
    desc: '探险'
  },
  {
    id: 'entry_monopoly',
    prompt: 'Aerial view of ancient Chinese city board game with colorful districts, miniature buildings and roads, gold coins and dice scattered, vibrant and playful atmosphere, game UI button background art, vertical composition, NO text NO watermark, anime illustration style',
    desc: '大富翁'
  },
  {
    id: 'entry_rank',
    prompt: 'Majestic tournament arena in ancient China, two warriors dueling on elevated platform, cheering crowd below, golden trophies and banners, dramatic lighting, competitive battle atmosphere, game UI button background art, vertical composition, NO text NO watermark, anime illustration style',
    desc: '擂台'
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
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  for (const entry of entries) {
    console.log(`生成 ${entry.id} (${entry.desc})...`);
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
      .webp({ quality: 72 })
      .toBuffer();

    const outPath = `${outDir}/${entry.id}.webp`;
    fs.writeFileSync(outPath, compressed);
    console.log(`✓ ${entry.id}.webp ${Math.round(compressed.length/1024)}KB`);
    await new Promise(r => setTimeout(r, 800));
  }
  console.log('\n全部完成！');
}

main().catch(console.error);
