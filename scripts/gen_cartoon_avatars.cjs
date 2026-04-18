// 用avatars.js的Q版卡通SVG生成新武将的webp图片
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../images/characters');

const newChars = ['jiaxu','zhanghe','jiangwei','fazheng','sunce','zhoutai','lvbu','diaochan','yuanshao','dongzhuo','zhangxiu','huatuo'];

// 直接内联avatars.js的逻辑，避免ES module问题
const avatarConfigs = {
  jiaxu:    { skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'scholar',  eyes: 'narrow',    mouth: 'subtle',   accessory: 'fan',         color: '#4a90d9', accent: '#2c3e50' },
  zhanghe:  { skin: '#f0c8a0', hair: '#2c2c2c', hairStyle: 'warrior',  eyes: 'bright',    mouth: 'firm',     accessory: 'helmet',      color: '#4a90d9', accent: '#7f8c8d' },
  jiangwei: { skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'heroic',   eyes: 'bright',    mouth: 'smile',    accessory: 'silverHelmet',color: '#4caf50', accent: '#bdc3c7' },
  fazheng:  { skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'neat',     eyes: 'calm',      mouth: 'subtle',   accessory: 'scroll',      color: '#4caf50', accent: '#8e44ad' },
  sunce:    { skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'heroic',   eyes: 'fierce',    mouth: 'grin',     accessory: 'none',        color: '#ef5350', accent: '#e74c3c' },
  zhoutai:  { skin: '#d4956b', hair: '#2c2c2c', hairStyle: 'warrior',  eyes: 'determined',mouth: 'stern',    accessory: 'none',        color: '#ef5350', accent: '#795548' },
  lvbu:     { skin: '#f0c8a0', hair: '#2c2c2c', hairStyle: 'spiky',    eyes: 'fierce',    mouth: 'smirk',    accessory: 'helmet',      color: '#ff9800', accent: '#e74c3c' },
  diaochan: { skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'flowing',  eyes: 'kind',      mouth: 'charming', accessory: 'none',        color: '#e91e63', accent: '#f48fb1' },
  yuanshao: { skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'royal',    eyes: 'sharp',     mouth: 'stern',    accessory: 'crown',       color: '#ff9800', accent: '#ffd700' },
  dongzhuo: { skin: '#e8b88a', hair: '#2c2c2c', hairStyle: 'bald',     eyes: 'round',     mouth: 'open',     accessory: 'none',        color: '#b71c1c', accent: '#7f0000' },
  zhangxiu: { skin: '#f0c8a0', hair: '#2c2c2c', hairStyle: 'warrior',  eyes: 'bright',    mouth: 'firm',     accessory: 'helmet',      color: '#ff9800', accent: '#795548' },
  huatuo:   { skin: '#fce4c0', hair: '#aaaaaa', hairStyle: 'elder',    eyes: 'wise',      mouth: 'gentle',   accessory: 'scroll',      color: '#27ae60', accent: '#4caf50' },
};

function lighten(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * percent / 100));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * percent / 100));
  return `rgb(${r},${g},${b})`;
}

function renderHair(config, cx, cy, r) {
  const hairY = cy - r * 0.15;
  const hairR = r * 0.6;
  switch (config.hairStyle) {
    case 'crown': case 'royal':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR}" ry="${hairR * 0.7}" fill="${config.hair}"/>
              <path d="M${cx-r*.35} ${cy-r*.45} Q${cx} ${cy-r*.85} ${cx+r*.35} ${cy-r*.45}" fill="${config.hair}"/>`;
    case 'scholar': case 'topknot':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR*.9}" ry="${hairR*.65}" fill="${config.hair}"/>
              <ellipse cx="${cx}" cy="${cy-r*.6}" rx="${r*.12}" ry="${r*.18}" fill="${config.hair}"/>`;
    case 'warrior': case 'heroic':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR}" ry="${hairR*.7}" fill="${config.hair}"/>
              <path d="M${cx-r*.4} ${cy-r*.3} L${cx-r*.5} ${cy-r*.55} L${cx-r*.2} ${cy-r*.45}
                       L${cx} ${cy-r*.7} L${cx+r*.2} ${cy-r*.45} L${cx+r*.5} ${cy-r*.55}
                       L${cx+r*.4} ${cy-r*.3}" fill="${config.hair}"/>`;
    case 'wild': case 'spiky':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR}" ry="${hairR*.7}" fill="${config.hair}"/>
              ${[...Array(5)].map((_,i)=>{
                const a=(-140+i*35)*Math.PI/180;
                return `<line x1="${cx+Math.cos(a)*hairR*.6}" y1="${hairY+Math.sin(a)*hairR*.5}" x2="${cx+Math.cos(a)*hairR*1.3}" y2="${hairY+Math.sin(a)*hairR*1.1}" stroke="${config.hair}" stroke-width="3" stroke-linecap="round"/>`;
              }).join('')}`;
    case 'long': case 'flowing':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR}" ry="${hairR*.7}" fill="${config.hair}"/>
              <path d="M${cx-r*.5} ${cy-r*.1} Q${cx-r*.6} ${cy+r*.3} ${cx-r*.45} ${cy+r*.5}" stroke="${config.hair}" fill="none" stroke-width="4" stroke-linecap="round"/>
              <path d="M${cx+r*.5} ${cy-r*.1} Q${cx+r*.6} ${cy+r*.3} ${cx+r*.45} ${cy+r*.5}" stroke="${config.hair}" fill="none" stroke-width="4" stroke-linecap="round"/>`;
    case 'bald':
      return `<ellipse cx="${cx}" cy="${hairY+r*.05}" rx="${hairR*.85}" ry="${hairR*.5}" fill="${lighten(config.skin,10)}"/>`;
    case 'elder':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR*.9}" ry="${hairR*.65}" fill="${config.hair}"/>`;
    case 'neat': case 'elegant':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR*.95}" ry="${hairR*.65}" fill="${config.hair}"/>
              <path d="M${cx-r*.4} ${cy-r*.35} Q${cx} ${cy-r*.65} ${cx+r*.4} ${cy-r*.35}" fill="${config.hair}"/>`;
    default:
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR}" ry="${hairR*.7}" fill="${config.hair}"/>`;
  }
}

function renderEyes(config, cx, cy, r) {
  const eyeY = cy * 1.0, sp = r*.22, es = r*.07;
  switch (config.eyes) {
    case 'sharp': case 'narrow':
      return `<ellipse cx="${cx-sp}" cy="${eyeY}" rx="${es*1.4}" ry="${es*.6}" fill="#2c2c2c"/>
              <ellipse cx="${cx+sp}" cy="${eyeY}" rx="${es*1.4}" ry="${es*.6}" fill="#2c2c2c"/>`;
    case 'fierce':
      return `<ellipse cx="${cx-sp}" cy="${eyeY}" rx="${es*1.2}" ry="${es}" fill="#2c2c2c"/>
              <ellipse cx="${cx+sp}" cy="${eyeY}" rx="${es*1.2}" ry="${es}" fill="#2c2c2c"/>
              <line x1="${cx-sp-es*1.5}" y1="${eyeY-es*1.2}" x2="${cx-sp+es}" y2="${eyeY-es*.5}" stroke="#2c2c2c" stroke-width="1.5"/>
              <line x1="${cx+sp+es*1.5}" y1="${eyeY-es*1.2}" x2="${cx+sp-es}" y2="${eyeY-es*.5}" stroke="#2c2c2c" stroke-width="1.5"/>`;
    case 'round':
      return `<circle cx="${cx-sp}" cy="${eyeY}" r="${es*1.3}" fill="#2c2c2c"/>
              <circle cx="${cx+sp}" cy="${eyeY}" r="${es*1.3}" fill="#2c2c2c"/>
              <circle cx="${cx-sp+1}" cy="${eyeY-1}" r="${es*.5}" fill="white"/>
              <circle cx="${cx+sp+1}" cy="${eyeY-1}" r="${es*.5}" fill="white"/>`;
    case 'wise': case 'calm':
      return `<path d="M${cx-sp-es} ${eyeY} Q${cx-sp} ${eyeY-es*1.2} ${cx-sp+es} ${eyeY}" stroke="#2c2c2c" fill="none" stroke-width="1.8"/>
              <path d="M${cx+sp-es} ${eyeY} Q${cx+sp} ${eyeY-es*1.2} ${cx+sp+es} ${eyeY}" stroke="#2c2c2c" fill="none" stroke-width="1.8"/>`;
    case 'kind': case 'gentle':
      return `<circle cx="${cx-sp}" cy="${eyeY}" r="${es*1.1}" fill="#2c2c2c"/>
              <circle cx="${cx+sp}" cy="${eyeY}" r="${es*1.1}" fill="#2c2c2c"/>
              <circle cx="${cx-sp+.8}" cy="${eyeY-.8}" r="${es*.45}" fill="white"/>
              <circle cx="${cx+sp+.8}" cy="${eyeY-.8}" r="${es*.45}" fill="white"/>`;
    default:
      return `<circle cx="${cx-sp}" cy="${eyeY}" r="${es*1.2}" fill="#2c2c2c"/>
              <circle cx="${cx+sp}" cy="${eyeY}" r="${es*1.2}" fill="#2c2c2c"/>
              <circle cx="${cx-sp+1}" cy="${eyeY-1}" r="${es*.5}" fill="white"/>
              <circle cx="${cx+sp+1}" cy="${eyeY-1}" r="${es*.5}" fill="white"/>`;
  }
}

function renderMouth(config, cx, cy, r) {
  const my = cy + r*.2;
  switch (config.mouth) {
    case 'smile': case 'charming':
      return `<path d="M${cx-r*.12} ${my} Q${cx} ${my+r*.1} ${cx+r*.12} ${my}" stroke="#c0392b" fill="none" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'grin':
      return `<path d="M${cx-r*.15} ${my} Q${cx} ${my+r*.15} ${cx+r*.15} ${my}" stroke="#c0392b" fill="#fff" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'stern': case 'firm':
      return `<line x1="${cx-r*.1}" y1="${my}" x2="${cx+r*.1}" y2="${my}" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'open':
      return `<ellipse cx="${cx}" cy="${my+r*.03}" rx="${r*.1}" ry="${r*.08}" fill="#c0392b"/>`;
    case 'smirk':
      return `<path d="M${cx-r*.08} ${my} Q${cx+r*.05} ${my+r*.08} ${cx+r*.14} ${my-r*.02}" stroke="#c0392b" fill="none" stroke-width="1.5" stroke-linecap="round"/>`;
    default:
      return `<path d="M${cx-r*.08} ${my} Q${cx} ${my+r*.06} ${cx+r*.08} ${my}" stroke="#c0392b" fill="none" stroke-width="1.2" stroke-linecap="round"/>`;
  }
}

function renderAccessory(config, cx, cy, r) {
  switch (config.accessory) {
    case 'crown':
      return `<path d="M${cx-r*.25} ${cy-r*.5} L${cx-r*.18} ${cy-r*.7} L${cx-r*.05} ${cy-r*.55}
                       L${cx} ${cy-r*.78} L${cx+r*.05} ${cy-r*.55} L${cx+r*.18} ${cy-r*.7}
                       L${cx+r*.25} ${cy-r*.5} Z" fill="${config.accent}" stroke="#b8860b" stroke-width=".8"/>
              <circle cx="${cx}" cy="${cy-r*.73}" r="${r*.03}" fill="#e74c3c"/>`;
    case 'fan':
      return `<line x1="${cx+r*.3}" y1="${cy+r*.15}" x2="${cx+r*.5}" y2="${cy-r*.1}" stroke="#8B4513" stroke-width="1.5"/>
              <path d="M${cx+r*.4} ${cy-r*.1} Q${cx+r*.55} ${cy-r*.3} ${cx+r*.65} ${cy-r*.15}" fill="#f5f0e8" stroke="#ccc" stroke-width=".5"/>`;
    case 'helmet': case 'silverHelmet':
      return `<path d="M${cx-r*.38} ${cy-r*.25} Q${cx} ${cy-r*.8} ${cx+r*.38} ${cy-r*.25}"
                    fill="${config.accessory==='silverHelmet'?'#bdc3c7':'#7f8c8d'}" stroke="#555" stroke-width="1"/>
              <circle cx="${cx}" cy="${cy-r*.65}" r="${r*.05}" fill="${config.accent}"/>`;
    case 'scroll': case 'book':
      return `<rect x="${cx+r*.28}" y="${cy+r*.05}" width="${r*.2}" height="${r*.28}" rx="2" fill="#f5f0e8" stroke="#ccc" stroke-width=".8"/>
              <line x1="${cx+r*.32}" y1="${cy+r*.12}" x2="${cx+r*.44}" y2="${cy+r*.12}" stroke="#ccc" stroke-width=".5"/>
              <line x1="${cx+r*.32}" y1="${cy+r*.18}" x2="${cx+r*.44}" y2="${cy+r*.18}" stroke="#ccc" stroke-width=".5"/>`;
    default: return '';
  }
}

function renderAvatar(charId, size) {
  const c = avatarConfigs[charId];
  if (!c) return null;
  const r = size/2, cx = r, cy = r;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="skin-${charId}" cx="40%" cy="35%">
        <stop offset="0%" stop-color="${lighten(c.skin,20)}"/>
        <stop offset="100%" stop-color="${c.skin}"/>
      </radialGradient>
      <radialGradient id="bg-${charId}" cx="30%" cy="30%">
        <stop offset="0%" stop-color="${lighten(c.color,30)}"/>
        <stop offset="100%" stop-color="${c.color}"/>
      </radialGradient>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${r-1}" fill="url(#bg-${charId})" stroke="${c.accent}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy*1.05}" r="${r*.58}" fill="url(#skin-${charId})"/>
    ${renderHair(c,cx,cy,r)}
    ${renderEyes(c,cx,cy,r)}
    ${renderMouth(c,cx,cy,r)}
    ${renderAccessory(c,cx,cy,r)}
  </svg>`;
}

async function main() {
  for (const id of newChars) {
    const outPath = path.join(OUTPUT_DIR, `${id}.webp`);
    const svg = renderAvatar(id, 256);
    if (!svg) { console.log(`跳过: ${id} (无配置)`); continue; }
    await sharp(Buffer.from(svg)).webp({ quality: 92 }).toFile(outPath);
    console.log(`生成卡通头像: ${id}.webp`);
  }
  console.log('全部完成！');
}

main().catch(console.error);
