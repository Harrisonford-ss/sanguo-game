// 重新生成12个武将卡牌图 - 无边框全幅风格，与原有24将一致
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO';
const API_URL = 'https://api.n1n.ai/v1/images/generations';
const OUTPUT_DIR = path.join(__dirname, '../images/cardart');

// 风格前后缀 - 与原有武将一致：无边框、全幅、人物顶满画面
const STYLE_SUFFIX = `, Chinese Three Kingdoms game card art, full bleed illustration filling entire canvas edge to edge, character filling 80% of frame, dramatic dynamic pose, rich saturated colors, cinematic lighting with god rays and particle effects, detailed armor and costume, professional game card art quality, NO border NO frame NO text NO watermark, portrait orientation`;

const characters = [
  {
    id: 'jiaxu',
    prompt: `Jia Xu (贾诩) Wei kingdom cunning strategist, middle-aged male with thin face and mysterious smirk, dark navy-blue Confucian robes with gold patterns, holding a black folding fan, standing in composed pose, dark starry night sky background with crescent moon and flowing dark fabric, cold blue-purple atmosphere`
  },
  {
    id: 'zhanghe',
    prompt: `Zhang He (张郃) Wei kingdom elite general, male warrior in gleaming silver-grey battle armor with blue cape flowing in wind, gripping a long spear pointed forward, fierce confident expression, dark blue stormy sky with Wei banners and lightning in background, blue-grey dramatic atmosphere`
  },
  {
    id: 'jiangwei',
    prompt: `Jiang Wei (姜维) Shu kingdom young general, handsome young male in green and silver phoenix-feather armor, silver spear raised in heroic pose, determined bright eyes, green mountain mist swirling around him, Shu army green banners in background, emerald green and silver atmosphere`
  },
  {
    id: 'fazheng',
    prompt: `Fa Zheng (法正) Shu kingdom strategist, male scholar in flowing purple-green robes, holding an open scroll with battle formations, sharp calculating eyes, purple mystical fog swirling around him with glowing runes, dark purple and green atmosphere`
  },
  {
    id: 'sunce',
    prompt: `Sun Ce (孙策) the Little Conqueror Wu kingdom founder, young handsome male in bright crimson-red armor with gold trim, sword held high in triumphant pose, confident grinning expression, crimson red Wu banners and blazing sunset sky behind him, fiery red-gold atmosphere`
  },
  {
    id: 'zhoutai',
    prompt: `Zhou Tai (周泰) Wu kingdom iron bodyguard, rugged scarred male in dark heavy armor with visible battle scars on arms, dual swords crossed defensively, fierce loyal expression, dark red Wu army backdrop with fire and smoke, dark crimson atmosphere`
  },
  {
    id: 'lvbu',
    prompt: `Lu Bu (吕布) supreme warrior of Three Kingdoms, imposing muscular male in ornate red-gold armor with twin pheasant feathers on golden helmet, Sky Piercer halberd raised overhead, red Hare horse rearing behind him, dramatic crimson-gold lightning sky, overwhelmingly powerful aura, red and gold atmosphere`
  },
  {
    id: 'diaochan',
    prompt: `Diao Chan (貂蝉) most beautiful woman of Three Kingdoms, graceful young female in flowing pink-white hanfu with red silk ribbons dancing in wind, elegant dance pose with arms outstretched, enchanting smile, cherry blossoms falling, full moon behind her, pink-purple romantic night atmosphere`
  },
  {
    id: 'yuanshao',
    prompt: `Yuan Shao (袁绍) powerful warlord overlord, noble middle-aged male in lavish golden dragon armor with golden crown, arms crossed domineeringly, golden banners filling the background, commanding ten thousand troops below him, golden yellow imperial atmosphere`
  },
  {
    id: 'dongzhuo',
    prompt: `Dong Zhuo (董卓) tyrannical chancellor, massive intimidating male in dark red-black heavy armor, cruel sinister expression with thick beard, raising heavy sword menacingly, burning Luoyang city in background with dark flames and black smoke, ominous dark red atmosphere`
  },
  {
    id: 'zhangxiu',
    prompt: `Zhang Xiu (张绣) Northern Spear King, young skilled male warrior in orange-brown battle armor, long spear in dynamic thrusting lunge pose, battle-ready intense expression, northern desert battlefield with orange dusty sky and sandstorm behind him, warm orange-brown atmosphere`
  },
  {
    id: 'huatuo',
    prompt: `Hua Tuo (华佗) legendary divine doctor, kind elderly male with white flowing hair and long white beard, white and green robes with herb pouches, one hand holding acupuncture needles raised gently, surrounded by glowing green medicinal herbs and healing light particles, serene green-white luminous atmosphere`
  },
];

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const fullPrompt = prompt + STYLE_SUFFIX;
    const body = JSON.stringify({
      model: 'flux.1-kontext-pro',
      prompt: fullPrompt,
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
        try { fs.unlinkSync(outPath + '.tmp'); } catch(e) {}
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
  console.log(`开始重新生成 ${characters.length} 个武将卡牌图（无边框全幅风格）...\n`);

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
      console.log(`✓ ${char.id}.webp`);
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`✗ ${char.id}: ${e.message}`);
    }
  }

  console.log('\n全部完成！');
}

main();
