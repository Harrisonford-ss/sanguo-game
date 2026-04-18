// 用 N1N API 批量生成12个新武将全身卡牌图
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO';
const API_URL = 'https://api.n1n.ai/v1/images/generations';
const OUTPUT_DIR = path.join(__dirname, '../images/cardart');

const characters = [
  {
    id: 'jiaxu',
    prompt: `Full body anime character art of Jia Xu (贾诩), Chinese Three Kingdoms Wei kingdom "Poison Strategist", middle-aged male scholar with thin cunning face and subtle smirk, wearing dark grey-blue Confucian robes with gold trim, holding a folding fan elegantly, small goatee, standing in a composed mysterious pose, dark blue starry night background with subtle fog, golden ornate card border frame, professional game card illustration, no text`
  },
  {
    id: 'zhanghe',
    prompt: `Full body anime character art of Zhang He (张郃), Chinese Three Kingdoms Wei kingdom general, male warrior in silver-grey battle armor with blue accents and flowing cape, holding a long spear ready for battle, confident fierce expression, black hair in warrior topknot, dynamic battle pose, dark blue Wei army banner background with clouds, golden ornate card border frame, professional game card illustration, no text`
  },
  {
    id: 'jiangwei',
    prompt: `Full body anime character art of Jiang Wei (姜维), Chinese Three Kingdoms Shu kingdom general, young handsome male in green and silver phoenix armor, silver spear in hand, determined heroic expression, black flowing hair, dynamic charging pose, green misty mountain battlefield background, golden ornate card border frame, professional game card illustration, no text`
  },
  {
    id: 'fazheng',
    prompt: `Full body anime character art of Fa Zheng (法正), Chinese Three Kingdoms Shu kingdom strategist, male scholar in purple-green Confucian robes, holding an open scroll with battle plans, sharp calculating eyes with confident smile, black hair with topknot, standing pose with slight lean forward, purple mist swirling background with Shu green accents, golden ornate card border frame, professional game card illustration, no text`
  },
  {
    id: 'sunce',
    prompt: `Full body anime character art of Sun Ce (孙策) the Little Conqueror, Chinese Three Kingdoms Wu kingdom, young energetic handsome male in bright red battle armor with gold trim, sword raised triumphantly, confident grinning victorious expression, black hair flowing in wind, dynamic action pose, crimson red Wu army banner background with golden sun, golden ornate card border frame, professional game card illustration, no text`
  },
  {
    id: 'zhoutai',
    prompt: `Full body anime character art of Zhou Tai (周泰), Chinese Three Kingdoms Wu kingdom bodyguard, rugged scarred male warrior in dark heavy armor showing battle scars on exposed arms, dual swords crossed in defensive pose, fierce loyal determined expression, dark red-brown color scheme, dramatic dark battlefield background with Wu red banner, golden ornate card border frame, professional game card illustration, no text`
  },
  {
    id: 'lvbu',
    prompt: `Full body anime character art of Lu Bu (吕布) the mightiest warrior of Three Kingdoms, imposing tall muscular male in ornate red-gold armor with pheasant feathers on golden helmet, holding the Sky Piercer halberd (方天画戟) with both hands, arrogant fierce powerful expression, black long hair flowing, red Hare horse rearing behind him, dramatic golden-red sky background with lightning, golden ornate card border frame, professional game card illustration, no text`
  },
  {
    id: 'diaochan',
    prompt: `Full body anime character art of Diao Chan (貂蝉), Chinese Three Kingdoms most beautiful woman, graceful young female in flowing pink-red hanfu dress with golden embroidery and long silk sleeves, performing elegant dance pose, charming enchanting smile, elaborate golden hairpin and jade jewelry, long black hair, soft cherry blossom petals falling, pink-purple romantic background with moonlight, golden ornate card border frame, professional game card illustration, no text`
  },
  {
    id: 'yuanshao',
    prompt: `Full body anime character art of Yuan Shao (袁绍), Chinese Three Kingdoms powerful warlord, noble arrogant middle-aged male in lavish golden imperial-style armor with dragon motifs, golden crown on head, long black beard, proud domineering stance with arms crossed, surrounded by golden banners and armored soldiers in background, golden yellow color scheme background, golden ornate card border frame, professional game card illustration, no text`
  },
  {
    id: 'dongzhuo',
    prompt: `Full body anime character art of Dong Zhuo (董卓), Chinese Three Kingdoms tyrannical chancellor, imposing fat intimidating male in dark red-black heavy general armor, cruel sinister expression with thick black beard, large menacing build holding a heavy sword, flames and burning Luoyang city in dark background, dark red ominous glow, golden ornate card border frame, professional game card illustration, no text`
  },
  {
    id: 'zhangxiu',
    prompt: `Full body anime character art of Zhang Xiu (张绣) the Northern Spear King, Chinese Three Kingdoms warlord, young skilled male warrior in orange-brown battle armor with red accents, holding a long spear in dynamic thrusting pose, confident battle-ready expression, black hair with warrior headband, desert northern China battlefield background with orange sky, golden ornate card border frame, professional game card illustration, no text`
  },
  {
    id: 'huatuo',
    prompt: `Full body anime character art of Hua Tuo (华佗), legendary Chinese Three Kingdoms divine doctor, kind elderly male with white hair and long white beard, wearing white and green doctor robes with herbal medicine pouches, holding a medicine bag and acupuncture needles, gentle wise smiling expression, standing in serene medicinal herb garden background with soft green glow, golden ornate card border frame, professional game card illustration, no text`
  },
];

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'flux.1-kontext-pro',
      prompt,
      n: 1,
      size: '768x1024',
    });

    const url = new URL(API_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data && json.data[0]) {
            resolve(json.data[0].url || json.data[0].b64_json);
          } else {
            reject(new Error(`API错误: ${data}`));
          }
        } catch (e) {
          reject(new Error(`解析失败: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function downloadImage(url, outPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : require('http');
    const file = fs.createWriteStream(outPath + '.tmp');
    proto.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(outPath + '.tmp');
        return downloadImage(res.headers.location, outPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        fs.renameSync(outPath + '.tmp', outPath);
        resolve();
      });
    }).on('error', err => {
      try { fs.unlinkSync(outPath + '.tmp'); } catch(e) {}
      reject(err);
    });
  });
}

async function main() {
  console.log(`开始生成 ${characters.length} 个武将卡牌图...\n`);

  for (const char of characters) {
    const outPath = path.join(OUTPUT_DIR, `${char.id}.webp`);
    console.log(`正在生成: ${char.id}...`);

    try {
      const result = await generateImage(char.prompt);

      if (result.startsWith('http')) {
        await downloadImage(result, outPath);
      } else {
        fs.writeFileSync(outPath, Buffer.from(result, 'base64'));
      }

      console.log(`✓ ${char.id}.webp 已保存`);
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`✗ ${char.id} 失败: ${e.message}`);
    }
  }

  console.log('\n全部完成！');
}

main();
