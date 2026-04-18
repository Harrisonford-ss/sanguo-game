const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const sharp = require('sharp');

const API_KEY = 'sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO';
const STYLE = ', anime illustration, Chinese Three Kingdoms era, cinematic widescreen composition, dramatic atmospheric lighting, epic scale, highly detailed, professional game concept art quality, NO text NO watermark NO border, landscape orientation 3:2';

const scenes = [
  {
    id: 'hero_banner',
    size: '1536x1024',
    prompt: 'Epic panoramic scene of the Three Kingdoms era, three armies of Wei (blue banners), Shu (green banners) and Wu (red banners) facing each other on a vast battlefield at dusk, thousands of soldiers with spears and flags, golden sunset sky with dramatic clouds, distant mountains, rivers reflecting fire, massive scale war scene' + STYLE
  },
  {
    id: 'chibi2',
    size: '1536x1024',
    prompt: 'Battle of Red Cliffs (赤壁之战), massive naval battle on the Yangtze River, hundreds of warships engulfed in flames, fire spreading across the water, Zhou Yu commanding from a ship, dramatic night scene with flames reflecting on dark water, smoke and embers filling the sky, epic war movie quality' + STYLE
  },
  {
    id: 'guandu2',
    size: '1536x1024',
    prompt: 'Battle of Guandu (官渡之战), Cao Cao\'s Wei army storming Yuan Shao\'s vast northern camp at night, catapults launching fire balls, soldiers charging with torches, dramatic siege warfare scene, chaotic battlefield with burning siege towers and banners falling, golden fire lighting the dark sky' + STYLE
  },
  {
    id: 'longzhong',
    size: '1536x1024',
    prompt: 'Liu Bei visiting Zhuge Liang three times (三顾茅庐), misty mountain village in winter snow, Liu Bei Guan Yu Zhang Fei approaching a humble thatched cottage, pine trees covered in snow, tranquil ethereal atmosphere, warm lantern light glowing from inside the cottage, poetic and serene scene' + STYLE
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
  for (const scene of scenes) {
    console.log(`生成 ${scene.id}...`);
    const json = await apiRequest(scene.prompt, scene.size);
    const item = json.data[0];

    let imgBuf;
    if (item.b64_json) {
      imgBuf = Buffer.from(item.b64_json, 'base64');
    } else {
      execSync(`curl -sL "${item.url}" -o /tmp/${scene.id}_raw.tmp`);
      imgBuf = fs.readFileSync(`/tmp/${scene.id}_raw.tmp`);
    }

    // 场景图保持高宽比，压缩质量
    const outPath = scene.id === 'hero_banner'
      ? `/home/ubuntu/sanguo-game/images/home_banner.webp`
      : `/home/ubuntu/sanguo-game/images/scenes/${scene.id}.webp`;

    const compressed = await sharp(imgBuf)
      .resize(1024, 683, { fit: 'cover' })
      .webp({ quality: 72 })
      .toBuffer();

    fs.writeFileSync(outPath, compressed);
    console.log(`✓ ${scene.id} ${Math.round(compressed.length/1024)}KB → ${outPath}`);
    await new Promise(r => setTimeout(r, 800));
  }
  console.log('\n全部完成！');
}

main().catch(console.error);
