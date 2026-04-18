// 为新增12个武将生成与原有风格统一的头像图片
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../images/characters');

// 新增武将配置（与avatars.js中的avatarConfigs对应）
const newChars = [
  { id: 'jiaxu',    char: '贾', color: '#3a7bd5', accent: '#1a1a2e', kingdom: 'wei',  title: '毒士' },
  { id: 'zhanghe',  char: '张', color: '#3a7bd5', accent: '#4a4a5a', kingdom: 'wei',  title: '五子良将' },
  { id: 'jiangwei', char: '姜', color: '#2d8a4e', accent: '#c0c0c0', kingdom: 'shu',  title: '幼麟' },
  { id: 'fazheng',  char: '法', color: '#2d8a4e', accent: '#7b2d8b', kingdom: 'shu',  title: '谋主' },
  { id: 'sunce',    char: '孙', color: '#c0392b', accent: '#e74c3c', kingdom: 'wu',   title: '小霸王' },
  { id: 'zhoutai',  char: '周', color: '#c0392b', accent: '#5d4037', kingdom: 'wu',   title: '护主' },
  { id: 'lvbu',     char: '吕', color: '#e67e22', accent: '#c0392b', kingdom: 'qun',  title: '天下第一' },
  { id: 'diaochan', char: '貂', color: '#c0392b', accent: '#e91e63', kingdom: 'qun',  title: '倾国之色' },
  { id: 'yuanshao', char: '袁', color: '#e67e22', accent: '#f1c40f', kingdom: 'qun',  title: '四世三公' },
  { id: 'dongzhuo', char: '董', color: '#b71c1c', accent: '#7f0000', kingdom: 'qun',  title: '权臣' },
  { id: 'zhangxiu', char: '张', color: '#d35400', accent: '#5d4037', kingdom: 'qun',  title: '北地枪王' },
  { id: 'huatuo',   char: '华', color: '#27ae60', accent: '#1b5e20', kingdom: 'qun',  title: '神医' },
];

// 查一下原有图片的尺寸
const sample = fs.readFileSync(path.join(OUTPUT_DIR, 'caocao.webp'));

async function getSampleSize() {
  const meta = await sharp(sample).metadata();
  return { w: meta.width, h: meta.height };
}

function makeBackground(color, accent, w, h) {
  // 生成渐变背景的SVG
  return `
    <rect width="${w}" height="${h}" rx="12" ry="12" fill="${color}"/>
    <circle cx="${w*0.15}" cy="${h*0.12}" r="${w*0.35}" fill="${accent}" opacity="0.18"/>
    <circle cx="${w*0.85}" cy="${h*0.88}" r="${w*0.3}" fill="white" opacity="0.06"/>
  `;
}

function generateCharSVG(cfg, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const fontSize = Math.round(w * 0.48);

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${cfg.color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${darken(cfg.color)}" stop-opacity="1"/>
      </linearGradient>
      <linearGradient id="char_grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="white" stop-opacity="0.98"/>
        <stop offset="100%" stop-color="white" stop-opacity="0.82"/>
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- 背景 -->
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    ${makeBackground(cfg.color, cfg.accent, w, h)}

    <!-- 边框装饰 -->
    <rect x="3" y="3" width="${w-6}" height="${h-6}" rx="9" ry="9"
          fill="none" stroke="${cfg.accent}" stroke-width="2.5" opacity="0.6"/>
    <rect x="6" y="6" width="${w-12}" height="${h-12}" rx="7" ry="7"
          fill="none" stroke="white" stroke-width="0.8" opacity="0.2"/>

    <!-- 角落纹样 -->
    <path d="M14 8 L8 8 L8 14" fill="none" stroke="${cfg.accent}" stroke-width="2" opacity="0.7"/>
    <path d="M${w-14} 8 L${w-8} 8 L${w-8} 14" fill="none" stroke="${cfg.accent}" stroke-width="2" opacity="0.7"/>
    <path d="M14 ${h-8} L8 ${h-8} L8 ${h-14}" fill="none" stroke="${cfg.accent}" stroke-width="2" opacity="0.7"/>
    <path d="M${w-14} ${h-8} L${w-8} ${h-8} L${w-8} ${h-14}" fill="none" stroke="${cfg.accent}" stroke-width="2" opacity="0.7"/>

    <!-- 主字符 -->
    <text x="${cx}" y="${cy + fontSize*0.35}"
          font-family="'Noto Serif CJK SC', 'Source Han Serif', serif"
          font-size="${fontSize}" font-weight="900"
          text-anchor="middle"
          fill="url(#char_grad)"
          filter="url(#shadow)">${cfg.char}</text>

    <!-- 称号小字 -->
    <text x="${cx}" y="${h - 10}"
          font-family="sans-serif" font-size="${Math.round(w * 0.1)}"
          text-anchor="middle"
          fill="white" opacity="0.65">${cfg.title}</text>
  </svg>`;
}

function darken(hex) {
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.max(0, (num >> 16) - 40);
  const g = Math.max(0, ((num >> 8) & 0xff) - 40);
  const b = Math.max(0, (num & 0xff) - 40);
  return `rgb(${r},${g},${b})`;
}

async function main() {
  const { w, h } = await getSampleSize();
  console.log(`原图尺寸: ${w}x${h}`);

  for (const cfg of newChars) {
    const outPath = path.join(OUTPUT_DIR, `${cfg.id}.webp`);
    if (fs.existsSync(outPath)) {
      console.log(`跳过已存在: ${cfg.id}`);
      continue;
    }
    const svg = generateCharSVG(cfg, w, h);
    await sharp(Buffer.from(svg))
      .webp({ quality: 90 })
      .toFile(outPath);
    console.log(`生成: ${cfg.id}.webp (${cfg.char} - ${cfg.title})`);
  }
  console.log('全部完成！');
}

main().catch(console.error);
