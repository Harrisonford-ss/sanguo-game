// 三国志探险 - Q版SVG武将头像系统

// 每个武将有独特的头像配置：发型、脸型、配件、表情
const avatarConfigs = {
  // ===== 魏国 =====
  caocao: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'crown',
    eyes: 'sharp', mouth: 'smirk', accessory: 'crown',
    color: '#4a90d9', accent: '#ffd700'
  },
  simayi: {
    skin: '#fce4c0', hair: '#3a3a3a', hairStyle: 'scholar',
    eyes: 'narrow', mouth: 'subtle', accessory: 'hat',
    color: '#4a90d9', accent: '#8e44ad'
  },
  guojia: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'messy',
    eyes: 'bright', mouth: 'smile', accessory: 'fan',
    color: '#4a90d9', accent: '#3498db'
  },
  xunyu: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'neat',
    eyes: 'calm', mouth: 'gentle', accessory: 'scroll',
    color: '#4a90d9', accent: '#27ae60'
  },
  zhangliao: {
    skin: '#f0c8a0', hair: '#2c2c2c', hairStyle: 'warrior',
    eyes: 'fierce', mouth: 'stern', accessory: 'helmet',
    color: '#4a90d9', accent: '#e67e22'
  },
  xuchu: {
    skin: '#e8b88a', hair: '#2c2c2c', hairStyle: 'bald',
    eyes: 'round', mouth: 'grin', accessory: 'none',
    color: '#4a90d9', accent: '#d35400'
  },
  xiahoudun: {
    skin: '#f0c8a0', hair: '#2c2c2c', hairStyle: 'warrior',
    eyes: 'eyepatch', mouth: 'stern', accessory: 'eyepatch',
    color: '#4a90d9', accent: '#c0392b'
  },
  dianwei: {
    skin: '#e8b88a', hair: '#2c2c2c', hairStyle: 'spiky',
    eyes: 'fierce', mouth: 'open', accessory: 'axes',
    color: '#4a90d9', accent: '#7f8c8d'
  },

  // ===== 蜀国 =====
  liubei: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'royal',
    eyes: 'kind', mouth: 'smile', accessory: 'crown',
    color: '#4caf50', accent: '#ffd700'
  },
  zhugeliang: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'topknot',
    eyes: 'wise', mouth: 'serene', accessory: 'featherFan',
    color: '#4caf50', accent: '#ffffff'
  },
  guanyu: {
    skin: '#d4756b', hair: '#2c2c2c', hairStyle: 'long',
    eyes: 'phoenix', mouth: 'stern', accessory: 'greenHat',
    color: '#4caf50', accent: '#27ae60'
  },
  zhangfei: {
    skin: '#d4956b', hair: '#2c2c2c', hairStyle: 'wild',
    eyes: 'round', mouth: 'shout', accessory: 'beard',
    color: '#4caf50', accent: '#2c3e50'
  },
  zhaoyun: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'heroic',
    eyes: 'bright', mouth: 'smile', accessory: 'silverArmor',
    color: '#4caf50', accent: '#bdc3c7'
  },
  huangzhong: {
    skin: '#e8c8a0', hair: '#aaaaaa', hairStyle: 'elder',
    eyes: 'determined', mouth: 'firm', accessory: 'bow',
    color: '#4caf50', accent: '#f39c12'
  },
  machao: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'flowing',
    eyes: 'handsome', mouth: 'smile', accessory: 'silverHelmet',
    color: '#4caf50', accent: '#ecf0f1'
  },
  weiyan: {
    skin: '#d4956b', hair: '#2c2c2c', hairStyle: 'warrior',
    eyes: 'fierce', mouth: 'sneer', accessory: 'horns',
    color: '#4caf50', accent: '#8e44ad'
  },

  // ===== 吴国 =====
  sunquan: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'royal',
    eyes: 'bright', mouth: 'smile', accessory: 'crown',
    color: '#ef5350', accent: '#ffd700'
  },
  zhouyu: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'elegant',
    eyes: 'handsome', mouth: 'charming', accessory: 'musicNote',
    color: '#ef5350', accent: '#e74c3c'
  },
  luxun: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'scholar',
    eyes: 'calm', mouth: 'gentle', accessory: 'book',
    color: '#ef5350', accent: '#2980b9'
  },
  lusu: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'neat',
    eyes: 'kind', mouth: 'smile', accessory: 'scroll',
    color: '#ef5350', accent: '#27ae60'
  },
  ganning: {
    skin: '#e8b88a', hair: '#2c2c2c', hairStyle: 'bandana',
    eyes: 'fierce', mouth: 'grin', accessory: 'bell',
    color: '#ef5350', accent: '#f1c40f'
  },
  taishici: {
    skin: '#f0c8a0', hair: '#2c2c2c', hairStyle: 'warrior',
    eyes: 'determined', mouth: 'firm', accessory: 'bow',
    color: '#ef5350', accent: '#e67e22'
  },
  lvmeng: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'changing',
    eyes: 'bright', mouth: 'smile', accessory: 'book',
    color: '#ef5350', accent: '#3498db'
  },
  huanggai: {
    skin: '#e8b88a', hair: '#888888', hairStyle: 'elder',
    eyes: 'determined', mouth: 'firm', accessory: 'torch',
    color: '#ef5350', accent: '#e74c3c'
  },

  // ===== 追加武将 =====
  jiaxu: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'scholar',
    eyes: 'narrow', mouth: 'subtle', accessory: 'fan',
    color: '#4a90d9', accent: '#2c3e50'
  },
  zhanghe: {
    skin: '#f0c8a0', hair: '#2c2c2c', hairStyle: 'warrior',
    eyes: 'bright', mouth: 'firm', accessory: 'helmet',
    color: '#4a90d9', accent: '#7f8c8d'
  },
  jiangwei: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'heroic',
    eyes: 'bright', mouth: 'smile', accessory: 'silverHelmet',
    color: '#4caf50', accent: '#bdc3c7'
  },
  fazheng: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'neat',
    eyes: 'calm', mouth: 'subtle', accessory: 'scroll',
    color: '#4caf50', accent: '#8e44ad'
  },
  sunce: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'heroic',
    eyes: 'fierce', mouth: 'grin', accessory: 'none',
    color: '#ef5350', accent: '#e74c3c'
  },
  zhoutai: {
    skin: '#d4956b', hair: '#2c2c2c', hairStyle: 'warrior',
    eyes: 'determined', mouth: 'stern', accessory: 'none',
    color: '#ef5350', accent: '#795548'
  },
  lvbu: {
    skin: '#f0c8a0', hair: '#2c2c2c', hairStyle: 'spiky',
    eyes: 'fierce', mouth: 'smirk', accessory: 'helmet',
    color: '#ff9800', accent: '#e74c3c'
  },
  diaochan: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'flowing',
    eyes: 'kind', mouth: 'charming', accessory: 'none',
    color: '#ff9800', accent: '#e91e63'
  },
  yuanshao: {
    skin: '#fce4c0', hair: '#2c2c2c', hairStyle: 'royal',
    eyes: 'sharp', mouth: 'stern', accessory: 'crown',
    color: '#ff9800', accent: '#ffd700'
  },
  dongzhuo: {
    skin: '#e8b88a', hair: '#2c2c2c', hairStyle: 'bald',
    eyes: 'round', mouth: 'open', accessory: 'none',
    color: '#ff9800', accent: '#b71c1c'
  },
  zhangxiu: {
    skin: '#f0c8a0', hair: '#2c2c2c', hairStyle: 'warrior',
    eyes: 'bright', mouth: 'firm', accessory: 'helmet',
    color: '#ff9800', accent: '#795548'
  },
  huatuo: {
    skin: '#fce4c0', hair: '#aaaaaa', hairStyle: 'elder',
    eyes: 'wise', mouth: 'gentle', accessory: 'scroll',
    color: '#ff9800', accent: '#4caf50'
  }
};

/**
 * 生成Q版SVG头像
 * @param {string} charId - 武将ID
 * @param {number} size - 头像尺寸（直径）
 * @returns {string} SVG HTML 字符串
 */
export function renderAvatar(charId, size = 60) {
  const config = avatarConfigs[charId];
  if (!config) return '';

  const r = size / 2;
  const cx = r;
  const cy = r;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="skin-${charId}" cx="40%" cy="35%">
        <stop offset="0%" stop-color="${lighten(config.skin, 20)}"/>
        <stop offset="100%" stop-color="${config.skin}"/>
      </radialGradient>
      <radialGradient id="bg-${charId}" cx="30%" cy="30%">
        <stop offset="0%" stop-color="${lighten(config.color, 30)}"/>
        <stop offset="100%" stop-color="${config.color}"/>
      </radialGradient>
    </defs>
    <!-- 背景圆 -->
    <circle cx="${cx}" cy="${cy}" r="${r-1}" fill="url(#bg-${charId})" stroke="${config.accent}" stroke-width="2"/>
    <!-- 脸 -->
    <circle cx="${cx}" cy="${cy * 1.05}" r="${r * 0.58}" fill="url(#skin-${charId})"/>
    <!-- 头发 -->
    ${renderHair(config, cx, cy, r)}
    <!-- 眼睛 -->
    ${renderEyes(config, cx, cy, r)}
    <!-- 嘴巴 -->
    ${renderMouth(config, cx, cy, r)}
    <!-- 配件 -->
    ${renderAccessory(config, cx, cy, r)}
  </svg>`;
}

function renderHair(config, cx, cy, r) {
  const hairY = cy - r * 0.15;
  const hairR = r * 0.6;

  switch (config.hairStyle) {
    case 'crown':
    case 'royal':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR}" ry="${hairR * 0.7}" fill="${config.hair}"/>
              <path d="M${cx - r*0.35} ${cy - r*0.45} Q${cx} ${cy - r*0.85} ${cx + r*0.35} ${cy - r*0.45}"
                    fill="${config.hair}" stroke="none"/>`;
    case 'scholar':
    case 'topknot':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR * 0.9}" ry="${hairR * 0.65}" fill="${config.hair}"/>
              <ellipse cx="${cx}" cy="${cy - r*0.6}" rx="${r*0.12}" ry="${r*0.18}" fill="${config.hair}"/>`;
    case 'warrior':
    case 'heroic':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR}" ry="${hairR * 0.7}" fill="${config.hair}"/>
              <path d="M${cx - r*0.4} ${cy - r*0.3} L${cx - r*0.5} ${cy - r*0.55} L${cx - r*0.2} ${cy - r*0.45}
                       L${cx} ${cy - r*0.7} L${cx + r*0.2} ${cy - r*0.45} L${cx + r*0.5} ${cy - r*0.55}
                       L${cx + r*0.4} ${cy - r*0.3}" fill="${config.hair}"/>`;
    case 'wild':
    case 'spiky':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR}" ry="${hairR * 0.7}" fill="${config.hair}"/>
              ${[...Array(5)].map((_, i) => {
                const angle = -140 + i * 35;
                const rad = angle * Math.PI / 180;
                const sx = cx + Math.cos(rad) * hairR * 0.6;
                const sy = hairY + Math.sin(rad) * hairR * 0.5;
                const ex = cx + Math.cos(rad) * hairR * 1.3;
                const ey = hairY + Math.sin(rad) * hairR * 1.1;
                return `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${config.hair}" stroke-width="3" stroke-linecap="round"/>`;
              }).join('')}`;
    case 'long':
    case 'flowing':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR}" ry="${hairR * 0.7}" fill="${config.hair}"/>
              <path d="M${cx - r*0.5} ${cy - r*0.1} Q${cx - r*0.6} ${cy + r*0.3} ${cx - r*0.45} ${cy + r*0.5}"
                    stroke="${config.hair}" fill="none" stroke-width="4" stroke-linecap="round"/>
              <path d="M${cx + r*0.5} ${cy - r*0.1} Q${cx + r*0.6} ${cy + r*0.3} ${cx + r*0.45} ${cy + r*0.5}"
                    stroke="${config.hair}" fill="none" stroke-width="4" stroke-linecap="round"/>`;
    case 'bald':
      return `<ellipse cx="${cx}" cy="${hairY + r*0.05}" rx="${hairR * 0.85}" ry="${hairR * 0.5}" fill="${lighten(config.skin, 10)}"/>`;
    case 'elder':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR * 0.9}" ry="${hairR * 0.65}" fill="${config.hair}"/>`;
    case 'messy':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR}" ry="${hairR * 0.7}" fill="${config.hair}"/>
              <path d="M${cx - r*0.3} ${cy - r*0.55} Q${cx - r*0.1} ${cy - r*0.75} ${cx + r*0.15} ${cy - r*0.6}"
                    stroke="${config.hair}" fill="none" stroke-width="3"/>`;
    case 'neat':
    case 'elegant':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR * 0.95}" ry="${hairR * 0.65}" fill="${config.hair}"/>
              <path d="M${cx - r*0.4} ${cy - r*0.35} Q${cx} ${cy - r*0.65} ${cx + r*0.4} ${cy - r*0.35}"
                    fill="${config.hair}"/>`;
    case 'bandana':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR * 0.9}" ry="${hairR * 0.6}" fill="${config.hair}"/>
              <rect x="${cx - r*0.5}" y="${cy - r*0.4}" width="${r}" height="${r*0.14}" rx="2" fill="${config.accent}"/>`;
    case 'changing':
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR * 0.9}" ry="${hairR * 0.65}" fill="${config.hair}"/>
              <rect x="${cx - r*0.15}" y="${cy - r*0.7}" width="${r*0.3}" height="${r*0.2}" rx="3" fill="${config.accent}" opacity="0.7"/>`;
    default:
      return `<ellipse cx="${cx}" cy="${hairY}" rx="${hairR}" ry="${hairR * 0.7}" fill="${config.hair}"/>`;
  }
}

function renderEyes(config, cx, cy, r) {
  const eyeY = cy * 1.0;
  const eyeSpacing = r * 0.22;
  const eyeSize = r * 0.07;

  switch (config.eyes) {
    case 'sharp':
    case 'narrow':
      return `<ellipse cx="${cx - eyeSpacing}" cy="${eyeY}" rx="${eyeSize * 1.4}" ry="${eyeSize * 0.6}" fill="#2c2c2c"/>
              <ellipse cx="${cx + eyeSpacing}" cy="${eyeY}" rx="${eyeSize * 1.4}" ry="${eyeSize * 0.6}" fill="#2c2c2c"/>`;
    case 'fierce':
      return `<ellipse cx="${cx - eyeSpacing}" cy="${eyeY}" rx="${eyeSize * 1.2}" ry="${eyeSize}" fill="#2c2c2c"/>
              <ellipse cx="${cx + eyeSpacing}" cy="${eyeY}" rx="${eyeSize * 1.2}" ry="${eyeSize}" fill="#2c2c2c"/>
              <line x1="${cx - eyeSpacing - eyeSize*1.5}" y1="${eyeY - eyeSize*1.2}" x2="${cx - eyeSpacing + eyeSize}" y2="${eyeY - eyeSize*0.5}" stroke="#2c2c2c" stroke-width="1.5"/>
              <line x1="${cx + eyeSpacing + eyeSize*1.5}" y1="${eyeY - eyeSize*1.2}" x2="${cx + eyeSpacing - eyeSize}" y2="${eyeY - eyeSize*0.5}" stroke="#2c2c2c" stroke-width="1.5"/>`;
    case 'round':
      return `<circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="${eyeSize * 1.3}" fill="#2c2c2c"/>
              <circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="${eyeSize * 1.3}" fill="#2c2c2c"/>
              <circle cx="${cx - eyeSpacing + 1}" cy="${eyeY - 1}" r="${eyeSize * 0.5}" fill="white"/>
              <circle cx="${cx + eyeSpacing + 1}" cy="${eyeY - 1}" r="${eyeSize * 0.5}" fill="white"/>`;
    case 'phoenix':
      return `<path d="M${cx - eyeSpacing - eyeSize*1.5} ${eyeY} Q${cx - eyeSpacing} ${eyeY - eyeSize*1.5} ${cx - eyeSpacing + eyeSize*1.5} ${eyeY}" stroke="#2c2c2c" fill="none" stroke-width="2"/>
              <path d="M${cx + eyeSpacing - eyeSize*1.5} ${eyeY} Q${cx + eyeSpacing} ${eyeY - eyeSize*1.5} ${cx + eyeSpacing + eyeSize*1.5} ${eyeY}" stroke="#2c2c2c" fill="none" stroke-width="2"/>
              <circle cx="${cx - eyeSpacing}" cy="${eyeY - eyeSize*0.3}" r="${eyeSize * 0.8}" fill="#2c2c2c"/>
              <circle cx="${cx + eyeSpacing}" cy="${eyeY - eyeSize*0.3}" r="${eyeSize * 0.8}" fill="#2c2c2c"/>`;
    case 'eyepatch':
      return `<circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="${eyeSize * 1.2}" fill="#2c2c2c"/>
              <circle cx="${cx + eyeSpacing + 1}" cy="${eyeY - 1}" r="${eyeSize * 0.4}" fill="white"/>
              <ellipse cx="${cx - eyeSpacing}" cy="${eyeY}" rx="${eyeSize * 2}" ry="${eyeSize * 1.8}" fill="#444"/>
              <line x1="${cx - eyeSpacing - eyeSize*2}" y1="${eyeY}" x2="${cx - r*0.5}" y2="${cy - r*0.35}" stroke="#444" stroke-width="1.5"/>`;
    case 'wise':
    case 'calm':
      return `<path d="M${cx - eyeSpacing - eyeSize} ${eyeY} Q${cx - eyeSpacing} ${eyeY - eyeSize*1.2} ${cx - eyeSpacing + eyeSize} ${eyeY}" stroke="#2c2c2c" fill="none" stroke-width="1.8"/>
              <path d="M${cx + eyeSpacing - eyeSize} ${eyeY} Q${cx + eyeSpacing} ${eyeY - eyeSize*1.2} ${cx + eyeSpacing + eyeSize} ${eyeY}" stroke="#2c2c2c" fill="none" stroke-width="1.8"/>`;
    case 'kind':
    case 'gentle':
      return `<circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="${eyeSize * 1.1}" fill="#2c2c2c"/>
              <circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="${eyeSize * 1.1}" fill="#2c2c2c"/>
              <circle cx="${cx - eyeSpacing + 0.8}" cy="${eyeY - 0.8}" r="${eyeSize * 0.45}" fill="white"/>
              <circle cx="${cx + eyeSpacing + 0.8}" cy="${eyeY - 0.8}" r="${eyeSize * 0.45}" fill="white"/>`;
    case 'bright':
    case 'handsome':
    case 'determined':
    default:
      return `<circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="${eyeSize * 1.2}" fill="#2c2c2c"/>
              <circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="${eyeSize * 1.2}" fill="#2c2c2c"/>
              <circle cx="${cx - eyeSpacing + 1}" cy="${eyeY - 1}" r="${eyeSize * 0.5}" fill="white"/>
              <circle cx="${cx + eyeSpacing + 1}" cy="${eyeY - 1}" r="${eyeSize * 0.5}" fill="white"/>`;
  }
}

function renderMouth(config, cx, cy, r) {
  const mouthY = cy + r * 0.2;

  switch (config.mouth) {
    case 'smile':
    case 'charming':
      return `<path d="M${cx - r*0.12} ${mouthY} Q${cx} ${mouthY + r*0.1} ${cx + r*0.12} ${mouthY}"
                    stroke="#c0392b" fill="none" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'grin':
      return `<path d="M${cx - r*0.15} ${mouthY} Q${cx} ${mouthY + r*0.15} ${cx + r*0.15} ${mouthY}"
                    stroke="#c0392b" fill="#fff" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'stern':
    case 'firm':
      return `<line x1="${cx - r*0.1}" y1="${mouthY}" x2="${cx + r*0.1}" y2="${mouthY}"
                    stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'shout':
    case 'open':
      return `<ellipse cx="${cx}" cy="${mouthY + r*0.03}" rx="${r*0.1}" ry="${r*0.08}" fill="#c0392b"/>`;
    case 'smirk':
      return `<path d="M${cx - r*0.08} ${mouthY} Q${cx + r*0.05} ${mouthY + r*0.08} ${cx + r*0.14} ${mouthY - r*0.02}"
                    stroke="#c0392b" fill="none" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'sneer':
      return `<path d="M${cx - r*0.1} ${mouthY + r*0.02} Q${cx} ${mouthY - r*0.05} ${cx + r*0.12} ${mouthY}"
                    stroke="#c0392b" fill="none" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'serene':
    case 'subtle':
    case 'gentle':
    default:
      return `<path d="M${cx - r*0.08} ${mouthY} Q${cx} ${mouthY + r*0.06} ${cx + r*0.08} ${mouthY}"
                    stroke="#c0392b" fill="none" stroke-width="1.2" stroke-linecap="round"/>`;
  }
}

function renderAccessory(config, cx, cy, r) {
  switch (config.accessory) {
    case 'crown':
      return `<path d="M${cx - r*0.25} ${cy - r*0.5} L${cx - r*0.18} ${cy - r*0.7} L${cx - r*0.05} ${cy - r*0.55}
                       L${cx} ${cy - r*0.78} L${cx + r*0.05} ${cy - r*0.55} L${cx + r*0.18} ${cy - r*0.7}
                       L${cx + r*0.25} ${cy - r*0.5} Z" fill="${config.accent}" stroke="#b8860b" stroke-width="0.8"/>
              <circle cx="${cx}" cy="${cy - r*0.73}" r="${r*0.03}" fill="#e74c3c"/>`;
    case 'featherFan':
      return `<line x1="${cx + r*0.35}" y1="${cy + r*0.1}" x2="${cx + r*0.55}" y2="${cy - r*0.2}" stroke="#8B4513" stroke-width="1.5"/>
              <ellipse cx="${cx + r*0.58}" cy="${cy - r*0.3}" rx="${r*0.12}" ry="${r*0.2}" fill="white" stroke="#ccc" stroke-width="0.5" transform="rotate(-15 ${cx + r*0.58} ${cy - r*0.3})"/>`;
    case 'greenHat':
      return `<ellipse cx="${cx}" cy="${cy - r*0.5}" rx="${r*0.35}" ry="${r*0.12}" fill="#27ae60"/>
              <rect x="${cx - r*0.22}" y="${cy - r*0.7}" width="${r*0.44}" height="${r*0.22}" rx="3" fill="#27ae60"/>`;
    case 'helmet':
    case 'silverHelmet':
      return `<path d="M${cx - r*0.38} ${cy - r*0.25} Q${cx} ${cy - r*0.8} ${cx + r*0.38} ${cy - r*0.25}"
                    fill="${config.accessory === 'silverHelmet' ? '#bdc3c7' : '#7f8c8d'}" stroke="#555" stroke-width="1"/>
              <circle cx="${cx}" cy="${cy - r*0.65}" r="${r*0.05}" fill="${config.accent}"/>`;
    case 'silverArmor':
      return `<path d="M${cx - r*0.3} ${cy + r*0.35} L${cx - r*0.35} ${cy + r*0.5} L${cx + r*0.35} ${cy + r*0.5} L${cx + r*0.3} ${cy + r*0.35}"
                    fill="#bdc3c7" stroke="#95a5a6" stroke-width="1"/>`;
    case 'hat':
      return `<path d="M${cx - r*0.35} ${cy - r*0.38} Q${cx} ${cy - r*0.85} ${cx + r*0.35} ${cy - r*0.38}"
                    fill="#2c2c2c" stroke="#555" stroke-width="0.8"/>`;
    case 'fan':
      return `<line x1="${cx + r*0.3}" y1="${cy + r*0.15}" x2="${cx + r*0.5}" y2="${cy - r*0.1}" stroke="#8B4513" stroke-width="1.5"/>
              <path d="M${cx + r*0.4} ${cy - r*0.1} Q${cx + r*0.55} ${cy - r*0.3} ${cx + r*0.65} ${cy - r*0.15}" fill="#f5f0e8" stroke="#ccc" stroke-width="0.5"/>`;
    case 'bow':
      return `<path d="M${cx + r*0.3} ${cy - r*0.3} Q${cx + r*0.65} ${cy} ${cx + r*0.3} ${cy + r*0.3}"
                    fill="none" stroke="#8B4513" stroke-width="2"/>
              <line x1="${cx + r*0.3}" y1="${cy - r*0.3}" x2="${cx + r*0.3}" y2="${cy + r*0.3}" stroke="#aaa" stroke-width="0.8"/>`;
    case 'beard':
      return `<path d="M${cx - r*0.2} ${cy + r*0.15} Q${cx - r*0.25} ${cy + r*0.45} ${cx - r*0.1} ${cy + r*0.5}
                       Q${cx} ${cy + r*0.55} ${cx + r*0.1} ${cy + r*0.5} Q${cx + r*0.25} ${cy + r*0.45} ${cx + r*0.2} ${cy + r*0.15}"
                    fill="#2c2c2c" opacity="0.8"/>`;
    case 'horns':
      return `<path d="M${cx - r*0.3} ${cy - r*0.5} L${cx - r*0.4} ${cy - r*0.8} L${cx - r*0.15} ${cy - r*0.45}" fill="#8e44ad"/>
              <path d="M${cx + r*0.3} ${cy - r*0.5} L${cx + r*0.4} ${cy - r*0.8} L${cx + r*0.15} ${cy - r*0.45}" fill="#8e44ad"/>`;
    case 'axes':
      return `<line x1="${cx - r*0.45}" y1="${cy - r*0.15}" x2="${cx - r*0.45}" y2="${cy + r*0.35}" stroke="#666" stroke-width="2"/>
              <circle cx="${cx - r*0.45}" cy="${cy - r*0.15}" r="${r*0.08}" fill="#999"/>`;
    case 'musicNote':
      return `<text x="${cx + r*0.4}" y="${cy - r*0.2}" font-size="${r*0.3}" fill="${config.accent}" opacity="0.8">♪</text>`;
    case 'book':
    case 'scroll':
      return `<rect x="${cx + r*0.28}" y="${cy + r*0.05}" width="${r*0.2}" height="${r*0.28}" rx="2" fill="#f5f0e8" stroke="#ccc" stroke-width="0.8"/>
              <line x1="${cx + r*0.32}" y1="${cy + r*0.12}" x2="${cx + r*0.44}" y2="${cy + r*0.12}" stroke="#ccc" stroke-width="0.5"/>
              <line x1="${cx + r*0.32}" y1="${cy + r*0.18}" x2="${cx + r*0.44}" y2="${cy + r*0.18}" stroke="#ccc" stroke-width="0.5"/>`;
    case 'bell':
      return `<circle cx="${cx + r*0.42}" cy="${cy - r*0.1}" r="${r*0.08}" fill="${config.accent}" stroke="#b8860b" stroke-width="0.8"/>`;
    case 'torch':
      return `<line x1="${cx + r*0.4}" y1="${cy + r*0.2}" x2="${cx + r*0.4}" y2="${cy - r*0.1}" stroke="#8B4513" stroke-width="2"/>
              <ellipse cx="${cx + r*0.4}" cy="${cy - r*0.18}" rx="${r*0.06}" ry="${r*0.1}" fill="#e74c3c"/>
              <ellipse cx="${cx + r*0.4}" cy="${cy - r*0.22}" rx="${r*0.04}" ry="${r*0.06}" fill="#f1c40f"/>`;
    case 'eyepatch':
      return '';  // handled in eyes
    default:
      return '';
  }
}

// 颜色辅助
function lighten(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * percent / 100));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * percent / 100));
  return `rgb(${r},${g},${b})`;
}

/**
 * 生成头像HTML - 优先使用AI生成的图片，SVG作为fallback
 * @param {string} charId
 * @param {number} size
 * @returns {string}
 */
export function avatarHTML(charId, size = 60) {
  const imgPath = `images/characters/${charId}.webp`;
  // 使用真实图片，onerror时回退到SVG
  return `<div class="avatar-img" style="width:${size}px;height:${size}px">
    <img src="${imgPath}" alt="${charId}" width="${size}" height="${size}"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
         style="width:100%;height:100%;object-fit:cover;border-radius:50%">
    <div class="avatar-svg-fallback" style="display:none;width:${size}px;height:${size}px">${renderAvatar(charId, size)}</div>
  </div>`;
}
