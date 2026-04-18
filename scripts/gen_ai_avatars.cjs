// 用 N1N API (flux.1-kontext-pro) 批量生成12个新武将Q版头像
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO';
const API_URL = 'https://api.n1n.ai/v1/images/generations';
const OUTPUT_DIR = path.join(__dirname, '../images/characters');

const PREFIX = `Chibi anime style character portrait, cute Q-version (Q版) with big head and small body proportions (2:1 head-to-body ratio), colorful vibrant illustration, thick black outlines, soft cel-shading, clean solid pastel background, game character card art style, high quality digital illustration, centered composition, full character visible. Character: `;

const SUFFIX = ` Style requirements: Japanese chibi/super-deformed proportions, adorable cute expression even for fierce characters, big sparkly expressive eyes, simplified but recognizable costume details, soft rounded shapes, pastel color palette with vivid accents, professional game card illustration quality, white or light gradient background.`;

const characters = [
  {
    id: 'jiaxu',
    desc: 'Jia Xu, Chinese Three Kingdoms Wei kingdom strategist, middle-aged male, thin face with a cunning subtle smirk, wearing dark grey-blue Confucian scholar robes with gold trim, holding a folding fan, small goatee, calm and calculating eyes, dark blue color scheme'
  },
  {
    id: 'zhanghe',
    desc: 'Zhang He, Chinese Three Kingdoms Wei kingdom general, male warrior, wearing silver-grey battle armor with blue accents, holding a spear, confident stern expression, black hair tied up in warrior style, Wei army blue color scheme'
  },
  {
    id: 'jiangwei',
    desc: 'Jiang Wei, Chinese Three Kingdoms Shu kingdom general, young handsome male, wearing green and silver armor with phoenix feather on helmet, holding a silver spear, determined bright eyes, black hair, Shu army green and silver color scheme'
  },
  {
    id: 'fazheng',
    desc: 'Fa Zheng, Chinese Three Kingdoms Shu kingdom strategist, male scholar, wearing purple and green Confucian robes, holding a scroll, sharp intelligent eyes, calm confident expression, black hair with topknot, purple-green color scheme'
  },
  {
    id: 'sunce',
    desc: 'Sun Ce the Little Conqueror, Chinese Three Kingdoms Wu kingdom founder, young energetic male, wearing red battle armor, confident grinning expression, black hair, muscular build, holding a sword raised high, red and gold color scheme'
  },
  {
    id: 'zhoutai',
    desc: 'Zhou Tai, Chinese Three Kingdoms Wu kingdom bodyguard general, rugged male warrior with multiple battle scars on face and arms, wearing dark red-brown heavy armor, fierce determined expression, holding a sword, dark brown and red color scheme'
  },
  {
    id: 'lvbu',
    desc: 'Lu Bu, Chinese Three Kingdoms mightiest warrior, tall muscular male, wearing ornate red-gold armor with pheasant feathers in helmet, holding a Sky Piercer halberd (方天画戟), arrogant fierce expression, black hair, red horse in background, red-gold color scheme'
  },
  {
    id: 'diaochan',
    desc: 'Diao Chan, Chinese Three Kingdoms most beautiful woman, young female, wearing elegant pink-red hanfu dress with flowing sleeves, beautiful charming smile, elaborate hairpin and jewelry, long black hair, graceful dancer pose, pink and gold color scheme'
  },
  {
    id: 'yuanshao',
    desc: 'Yuan Shao, Chinese Three Kingdoms warlord, noble arrogant middle-aged male, wearing lavish golden imperial-style armor, golden crown, long black beard, proud domineering expression, surrounded by golden aura, gold and orange color scheme'
  },
  {
    id: 'dongzhuo',
    desc: 'Dong Zhuo, Chinese Three Kingdoms tyrannical chancellor, fat intimidating male, wearing dark red-black heavy general armor, cruel angry expression, thick black beard, overweight large build, menacing aura, dark red and black color scheme'
  },
  {
    id: 'zhangxiu',
    desc: 'Zhang Xiu the Northern Spear King, Chinese Three Kingdoms warlord, young skilled male warrior, wearing brown-orange battle armor, holding a long spear in dynamic pose, confident expression, black hair, warrior headband, orange and brown color scheme'
  },
  {
    id: 'huatuo',
    desc: 'Hua Tuo, Chinese Three Kingdoms legendary doctor, kind elderly male, white hair and long white beard, wearing white and green doctor robes with medical cross symbol, holding a medicine bag, gentle wise smiling expression, white and green color scheme'
  },
];

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'flux.1-kontext-pro',
      prompt: PREFIX + prompt + SUFFIX,
      n: 1,
      size: '1024x1024',
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
      fs.unlinkSync(outPath + '.tmp');
      reject(err);
    });
  });
}

async function saveBase64(b64, outPath) {
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(outPath, buf);
}

async function main() {
  console.log(`开始生成 ${characters.length} 个武将头像...\n`);

  for (const char of characters) {
    const outPath = path.join(OUTPUT_DIR, `${char.id}.webp`);
    console.log(`正在生成: ${char.id}...`);

    try {
      const result = await generateImage(char.desc);

      if (result.startsWith('http')) {
        // URL形式，下载图片
        await downloadImage(result, outPath);
      } else {
        // base64形式，直接保存
        await saveBase64(result, outPath);
      }

      console.log(`✓ ${char.id}.webp 已保存`);
      // 避免请求过于频繁
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`✗ ${char.id} 失败: ${e.message}`);
    }
  }

  console.log('\n全部完成！');
}

main();
