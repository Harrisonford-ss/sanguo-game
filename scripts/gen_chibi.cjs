// 生成Q版chibi风格人物插画
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const OUTPUT_DIR = path.join(__dirname, '../images/characters');

// 每个角色的独特配置
const chars = {
  jiaxu: {
    name: '贾诩', title: '毒士',
    bgColor: '#e8eaf6', accentColor: '#3949ab',
    skinColor: '#fad7a0', hairColor: '#1a1a1a',
    robeColor: '#37474f', robeDark: '#263238', robeAccent: '#546e7a',
    beltColor: '#795548',
    prop: 'fan', // 羽扇
    propColor: '#f5f0e8',
    expression: 'smirk',
    beard: false,
    hat: 'scholar', // 文士冠
    hatColor: '#1a1a1a',
  },
  zhanghe: {
    name: '张郃', title: '五子良将',
    bgColor: '#e8eaf6', accentColor: '#3949ab',
    skinColor: '#e8c49a', hairColor: '#1a1a1a',
    robeColor: '#546e7a', robeDark: '#37474f', robeAccent: '#7f8c8d',
    beltColor: '#8d6e63',
    prop: 'spear',
    propColor: '#90a4ae',
    expression: 'stern',
    beard: false,
    hat: 'helmet',
    hatColor: '#78909c',
  },
  jiangwei: {
    name: '姜维', title: '幼麟',
    bgColor: '#e8f5e9', accentColor: '#2e7d32',
    skinColor: '#fad7a0', hairColor: '#1a1a1a',
    robeColor: '#388e3c', robeDark: '#1b5e20', robeAccent: '#bdc3c7',
    beltColor: '#795548',
    prop: 'sword',
    propColor: '#bdc3c7',
    expression: 'confident',
    beard: false,
    hat: 'silverHelmet',
    hatColor: '#bdc3c7',
  },
  fazheng: {
    name: '法正', title: '谋主',
    bgColor: '#f3e5f5', accentColor: '#6a1b9a',
    skinColor: '#fad7a0', hairColor: '#1a1a1a',
    robeColor: '#4a148c', robeDark: '#311b92', robeAccent: '#7e57c2',
    beltColor: '#795548',
    prop: 'scroll',
    propColor: '#f5f0e8',
    expression: 'calm',
    beard: false,
    hat: 'topknot',
    hatColor: '#1a1a1a',
  },
  sunce: {
    name: '孙策', title: '小霸王',
    bgColor: '#fce4ec', accentColor: '#c62828',
    skinColor: '#fad7a0', hairColor: '#1a1a1a',
    robeColor: '#c62828', robeDark: '#b71c1c', robeAccent: '#ef9a9a',
    beltColor: '#8d6e63',
    prop: 'sword',
    propColor: '#e0e0e0',
    expression: 'grin',
    beard: false,
    hat: 'warrior',
    hatColor: '#1a1a1a',
  },
  zhoutai: {
    name: '周泰', title: '护主铁卫',
    bgColor: '#fce4ec', accentColor: '#880e4f',
    skinColor: '#d4956b', hairColor: '#1a1a1a',
    robeColor: '#4e342e', robeDark: '#3e2723', robeAccent: '#8d6e63',
    beltColor: '#5d4037',
    prop: 'sword',
    propColor: '#9e9e9e',
    expression: 'fierce',
    beard: false,
    scars: true,
    hat: 'headband',
    hatColor: '#880e4f',
  },
  lvbu: {
    name: '吕布', title: '天下第一',
    bgColor: '#fff3e0', accentColor: '#e65100',
    skinColor: '#e8c49a', hairColor: '#1a1a1a',
    robeColor: '#bf360c', robeDark: '#870000', robeAccent: '#ff8f00',
    beltColor: '#6d4c41',
    prop: 'halberd',
    propColor: '#ffd54f',
    expression: 'fierce',
    beard: false,
    hat: 'pheasantHelmet',
    hatColor: '#e65100',
  },
  diaochan: {
    name: '貂蝉', title: '倾国之色',
    bgColor: '#fce4ec', accentColor: '#ad1457',
    skinColor: '#fce4c0', hairColor: '#1a1a1a',
    robeColor: '#c2185b', robeDark: '#880e4f', robeAccent: '#f48fb1',
    beltColor: '#ad1457',
    prop: 'none',
    expression: 'charming',
    beard: false,
    hat: 'hairpin',
    hatColor: '#ffd700',
    female: true,
  },
  yuanshao: {
    name: '袁绍', title: '四世三公',
    bgColor: '#fff8e1', accentColor: '#f57f17',
    skinColor: '#fad7a0', hairColor: '#1a1a1a',
    robeColor: '#f57f17', robeDark: '#e65100', robeAccent: '#ffd54f',
    beltColor: '#8d6e63',
    prop: 'scepter',
    propColor: '#ffd700',
    expression: 'arrogant',
    beard: true,
    hat: 'crown',
    hatColor: '#ffd700',
  },
  dongzhuo: {
    name: '董卓', title: '汉室毒瘤',
    bgColor: '#ffebee', accentColor: '#b71c1c',
    skinColor: '#d4a574', hairColor: '#2c2c2c',
    robeColor: '#7f0000', robeDark: '#4a0000', robeAccent: '#b71c1c',
    beltColor: '#4e342e',
    prop: 'sword',
    propColor: '#78909c',
    expression: 'angry',
    beard: true,
    fat: true,
    hat: 'general',
    hatColor: '#7f0000',
  },
  zhangxiu: {
    name: '张绣', title: '北地枪王',
    bgColor: '#fff3e0', accentColor: '#bf360c',
    skinColor: '#e8c49a', hairColor: '#1a1a1a',
    robeColor: '#bf360c', robeDark: '#870000', robeAccent: '#ff8a65',
    beltColor: '#6d4c41',
    prop: 'spear',
    propColor: '#9e9e9e',
    expression: 'confident',
    beard: false,
    hat: 'warrior',
    hatColor: '#5d4037',
  },
  huatuo: {
    name: '华佗', title: '神医',
    bgColor: '#e8f5e9', accentColor: '#1b5e20',
    skinColor: '#fad7a0', hairColor: '#aaaaaa',
    robeColor: '#ffffff', robeDark: '#e0e0e0', robeAccent: '#4caf50',
    beltColor: '#8bc34a',
    prop: 'medicBag',
    propColor: '#8bc34a',
    expression: 'gentle',
    beard: true,
    beardColor: '#aaaaaa',
    hat: 'doctor',
    hatColor: '#e0e0e0',
  },
};

function chibiSVG(id, cfg) {
  const W = 256, H = 256;
  const cx = W / 2;

  // 头部参数
  const headR = 55;
  const headCx = cx;
  const headCy = 95;

  // 身体参数
  const bodyW = cfg.fat ? 72 : 58;
  const bodyH = cfg.fat ? 68 : 60;
  const bodyTop = headCy + headR - 8;
  const bodyX = cx - bodyW / 2;

  // 腿部
  const legW = 18;
  const legH = 32;
  const legY = bodyTop + bodyH - 4;

  // 发型
  function hair() {
    const hc = cfg.hairColor;
    const hy = headCy - headR * 0.1;
    const hr = headR * 0.98;
    let base = `<ellipse cx="${headCx}" cy="${hy}" rx="${hr}" ry="${hr * 0.78}" fill="${hc}"/>`;
    switch (cfg.hat) {
      case 'scholar': case 'topknot':
        return base + `<ellipse cx="${headCx}" cy="${headCy - headR * 0.65}" rx="9" ry="13" fill="${hc}"/>`;
      case 'warrior': case 'headband':
        return base + `
          <path d="M${headCx-hr*.7} ${headCy-headR*.4} L${headCx-hr*.85} ${headCy-headR*.75} L${headCx-hr*.4} ${headCy-headR*.6} L${headCx} ${headCy-headR*.95} L${headCx+hr*.4} ${headCy-headR*.6} L${headCx+hr*.85} ${headCy-headR*.75} L${headCx+hr*.7} ${headCy-headR*.4}" fill="${hc}"/>`;
      case 'pheasantHelmet':
        return base + `<path d="M${headCx-5} ${headCy-headR*.9} Q${headCx} ${headCy-headR*1.5} ${headCx+5} ${headCy-headR*.9}" fill="${hc}" stroke="${hc}" stroke-width="2"/>`;
      default:
        return base;
    }
  }

  // 帽子/头饰
  function hat() {
    const hc = cfg.hatColor;
    switch (cfg.hat) {
      case 'crown':
        return `<path d="M${headCx-28} ${headCy-headR*.55} L${headCx-22} ${headCy-headR*.9} L${headCx-8} ${headCy-headR*.65} L${headCx} ${headCy-headR*1.05} L${headCx+8} ${headCy-headR*.65} L${headCx+22} ${headCy-headR*.9} L${headCx+28} ${headCy-headR*.55} Z" fill="${hc}" stroke="#b8860b" stroke-width="1.5"/>
                <circle cx="${headCx}" cy="${headCy-headR*1.0}" r="5" fill="#e74c3c"/>
                <circle cx="${headCx-18}" cy="${headCy-headR*.85}" r="3" fill="#4fc3f7"/>
                <circle cx="${headCx+18}" cy="${headCy-headR*.85}" r="3" fill="#4fc3f7"/>`;
      case 'helmet': case 'silverHelmet':
        return `<path d="M${headCx-headR*.75} ${headCy-headR*.3} Q${headCx-headR*.8} ${headCy-headR*1.05} ${headCx} ${headCy-headR*1.1} Q${headCx+headR*.8} ${headCy-headR*1.05} ${headCx+headR*.75} ${headCy-headR*.3}" fill="${hc}" stroke="#555" stroke-width="1.5"/>
                <line x1="${headCx-headR*.35}" y1="${headCy-headR*.3}" x2="${headCx+headR*.35}" y2="${headCy-headR*.3}" stroke="${cfg.robeAccent}" stroke-width="2"/>
                <circle cx="${headCx}" cy="${headCy-headR*.95}" r="5" fill="${cfg.robeAccent}"/>`;
      case 'pheasantHelmet':
        return `<path d="M${headCx-headR*.75} ${headCy-headR*.3} Q${headCx} ${headCy-headR*1.1} ${headCx+headR*.75} ${headCy-headR*.3}" fill="${hc}" stroke="#b8860b" stroke-width="1.5"/>
                <path d="M${headCx-3} ${headCy-headR*.9} Q${headCx-8} ${headCy-headR*1.6} ${headCx-15} ${headCy-headR*2.0}" stroke="#27ae60" fill="none" stroke-width="4" stroke-linecap="round"/>
                <path d="M${headCx+3} ${headCy-headR*.9} Q${headCx+8} ${headCy-headR*1.6} ${headCx+12} ${headCy-headR*1.9}" stroke="#27ae60" fill="none" stroke-width="3" stroke-linecap="round"/>`;
      case 'headband':
        return `<rect x="${headCx-headR*.8}" y="${headCy-headR*.42}" width="${headR*1.6}" height="10" rx="4" fill="${hc}" opacity="0.9"/>`;
      case 'scholar':
        return `<path d="M${headCx-headR*.7} ${headCy-headR*.45} Q${headCx} ${headCy-headR*.95} ${headCx+headR*.7} ${headCy-headR*.45}" fill="${hc}"/>
                <ellipse cx="${headCx}" cy="${headCy-headR*.8}" rx="22" ry="8" fill="${hc}"/>`;
      case 'topknot':
        return `<ellipse cx="${headCx}" cy="${headCy-headR*.9}" rx="8" ry="12" fill="${cfg.hairColor}"/>
                <ellipse cx="${headCx}" cy="${headCy-headR*.9}" rx="6" ry="8" fill="${hc}"/>`;
      case 'warrior':
        return `<path d="M${headCx-headR*.6} ${headCy-headR*.5} Q${headCx} ${headCy-headR*.95} ${headCx+headR*.6} ${headCy-headR*.5}" fill="${hc}" stroke="#5d4037" stroke-width="1"/>`;
      case 'general':
        return `<path d="M${headCx-headR*.8} ${headCy-headR*.3} Q${headCx} ${headCy-headR*1.05} ${headCx+headR*.8} ${headCy-headR*.3}" fill="${hc}"/>
                <rect x="${headCx-headR*.8}" y="${headCy-headR*.33}" width="${headR*1.6}" height="8" rx="3" fill="${cfg.robeDark}"/>`;
      case 'hairpin':
        return `<line x1="${headCx-12}" y1="${headCy-headR*.7}" x2="${headCx+18}" y2="${headCy-headR*.85}" stroke="${hc}" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="${headCx+18}" cy="${headCy-headR*.85}" r="4" fill="${hc}"/>`;
      case 'doctor':
        return `<rect x="${headCx-20}" y="${headCy-headR*.9}" width="40" height="24" rx="4" fill="${hc}" stroke="#bbb" stroke-width="1"/>
                <line x1="${headCx}" y1="${headCy-headR*.88}" x2="${headCx}" y2="${headCy-headR*.45}" stroke="#4caf50" stroke-width="2"/>
                <line x1="${headCx-8}" y1="${headCy-headR*.68}" x2="${headCx+8}" y2="${headCy-headR*.68}" stroke="#4caf50" stroke-width="2"/>`;
      default: return '';
    }
  }

  // 面部
  function face() {
    const fy = headCy;
    const es = 5; // eye size
    const lx = headCx - 16, rx = headCx + 16;
    const eyeY = fy - 2;

    let eyes = '';
    switch (cfg.expression) {
      case 'fierce': case 'angry':
        eyes = `<ellipse cx="${lx}" cy="${eyeY}" rx="${es*1.1}" ry="${es*.85}" fill="#1a1a1a"/>
                <ellipse cx="${rx}" cy="${eyeY}" rx="${es*1.1}" ry="${es*.85}" fill="#1a1a1a"/>
                <circle cx="${lx+1.5}" cy="${eyeY-1}" r="2" fill="white"/>
                <circle cx="${rx+1.5}" cy="${eyeY-1}" r="2" fill="white"/>
                <line x1="${lx-8}" y1="${eyeY-7}" x2="${lx+5}" y2="${eyeY-3}" stroke="#1a1a1a" stroke-width="2"/>
                <line x1="${rx+8}" y1="${eyeY-7}" x2="${rx-5}" y2="${eyeY-3}" stroke="#1a1a1a" stroke-width="2"/>`;
        break;
      case 'grin': case 'confident': case 'arrogant':
        eyes = `<ellipse cx="${lx}" cy="${eyeY}" rx="${es}" ry="${es*.9}" fill="#1a1a1a"/>
                <ellipse cx="${rx}" cy="${eyeY}" rx="${es}" ry="${es*.9}" fill="#1a1a1a"/>
                <circle cx="${lx+1.5}" cy="${eyeY-1.5}" r="2" fill="white"/>
                <circle cx="${rx+1.5}" cy="${eyeY-1.5}" r="2" fill="white"/>`;
        break;
      case 'charming': case 'gentle': case 'calm':
        eyes = `<path d="M${lx-es} ${eyeY} Q${lx} ${eyeY-es*1.3} ${lx+es} ${eyeY}" stroke="#1a1a1a" fill="none" stroke-width="1.5"/>
                <circle cx="${lx}" cy="${eyeY-1}" r="${es*.7}" fill="#1a1a1a"/>
                <path d="M${rx-es} ${eyeY} Q${rx} ${eyeY-es*1.3} ${rx+es} ${eyeY}" stroke="#1a1a1a" fill="none" stroke-width="1.5"/>
                <circle cx="${rx}" cy="${eyeY-1}" r="${es*.7}" fill="#1a1a1a"/>
                <circle cx="${lx+1.5}" cy="${eyeY-2}" r="1.5" fill="white"/>
                <circle cx="${rx+1.5}" cy="${eyeY-2}" r="1.5" fill="white"/>`;
        break;
      default:
        eyes = `<ellipse cx="${lx}" cy="${eyeY}" rx="${es}" ry="${es*.9}" fill="#1a1a1a"/>
                <ellipse cx="${rx}" cy="${eyeY}" rx="${es}" ry="${es*.9}" fill="#1a1a1a"/>
                <circle cx="${lx+1.5}" cy="${eyeY-1.5}" r="2" fill="white"/>
                <circle cx="${rx+1.5}" cy="${eyeY-1.5}" r="2" fill="white"/>`;
    }

    // 眉毛
    let brows = '';
    if (cfg.expression === 'fierce' || cfg.expression === 'angry') {
      brows = `<line x1="${lx-7}" y1="${eyeY-9}" x2="${lx+5}" y2="${eyeY-5}" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
               <line x1="${rx-5}" y1="${eyeY-5}" x2="${rx+7}" y2="${eyeY-9}" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>`;
    } else {
      brows = `<path d="M${lx-7} ${eyeY-8} Q${lx} ${eyeY-11} ${lx+7} ${eyeY-8}" stroke="#1a1a1a" fill="none" stroke-width="2" stroke-linecap="round"/>
               <path d="M${rx-7} ${eyeY-8} Q${rx} ${eyeY-11} ${rx+7} ${eyeY-8}" stroke="#1a1a1a" fill="none" stroke-width="2" stroke-linecap="round"/>`;
    }

    // 嘴
    const mouthY = fy + 14;
    let mouth = '';
    switch (cfg.expression) {
      case 'grin':
        mouth = `<path d="M${headCx-9} ${mouthY} Q${headCx} ${mouthY+7} ${headCx+9} ${mouthY}" stroke="#c0392b" fill="none" stroke-width="2" stroke-linecap="round"/>`;
        break;
      case 'charming':
        mouth = `<path d="M${headCx-7} ${mouthY} Q${headCx} ${mouthY+5} ${headCx+7} ${mouthY}" stroke="#e91e63" fill="none" stroke-width="1.8" stroke-linecap="round"/>`;
        break;
      case 'angry':
        mouth = `<path d="M${headCx-7} ${mouthY+3} Q${headCx} ${mouthY-2} ${headCx+7} ${mouthY+3}" stroke="#c0392b" fill="none" stroke-width="2" stroke-linecap="round"/>`;
        break;
      case 'smirk':
        mouth = `<path d="M${headCx-5} ${mouthY} Q${headCx+4} ${mouthY+4} ${headCx+9} ${mouthY-2}" stroke="#c0392b" fill="none" stroke-width="2" stroke-linecap="round"/>`;
        break;
      default:
        mouth = `<path d="M${headCx-6} ${mouthY} Q${headCx} ${mouthY+4} ${headCx+6} ${mouthY}" stroke="#c0392b" fill="none" stroke-width="1.8" stroke-linecap="round"/>`;
    }

    // 鼻子
    const nose = `<path d="M${headCx-3} ${fy+6} Q${headCx} ${fy+9} ${headCx+3} ${fy+6}" stroke="#c8956b" fill="none" stroke-width="1.2"/>`;

    // 腮红
    const blush = `<ellipse cx="${lx-6}" cy="${fy+10}" rx="9" ry="5" fill="#ffb3ba" opacity="0.45"/>
                   <ellipse cx="${rx+6}" cy="${fy+10}" rx="9" ry="5" fill="#ffb3ba" opacity="0.45"/>`;

    // 胡须
    let beard = '';
    if (cfg.beard) {
      const bc = cfg.beardColor || '#1a1a1a';
      beard = `<path d="M${headCx-18} ${fy+18} Q${headCx-12} ${fy+32} ${headCx} ${fy+35} Q${headCx+12} ${fy+32} ${headCx+18} ${fy+18}" fill="${bc}" opacity="0.75"/>
               <path d="M${headCx-8} ${fy+16} Q${headCx} ${fy+22} ${headCx+8} ${fy+16}" fill="${bc}" opacity="0.5"/>`;
    }

    return eyes + brows + nose + blush + mouth + beard;
  }

  // 身体/服装
  function body() {
    const rc = cfg.robeColor, rd = cfg.robeDark, ra = cfg.robeAccent;
    const bw = bodyW, bh = bodyH, bx = bodyX, by = bodyTop;
    const bcx = cx;

    // 主体
    let torso = `<path d="M${bx+6} ${by} Q${bx} ${by+10} ${bx} ${by+bh} L${bx+bw} ${by+bh} Q${bx+bw} ${by+10} ${bx+bw-6} ${by} Z" fill="${rc}"/>`;

    // 领口
    torso += `<path d="M${bcx-12} ${by} L${bcx-6} ${by+18} L${bcx} ${by+12} L${bcx+6} ${by+18} L${bcx+12} ${by} Z" fill="${rd}"/>`;

    // 腰带
    torso += `<rect x="${bx}" y="${by+bh-14}" width="${bw}" height="12" rx="3" fill="${cfg.beltColor}"/>
              <rect x="${bcx-6}" y="${by+bh-16}" width="12" height="16" rx="2" fill="#ffd700" opacity="0.85"/>`;

    // 装饰线
    torso += `<path d="M${bx+4} ${by+8} L${bx+4} ${by+bh-14}" stroke="${ra}" stroke-width="1.5" opacity="0.5"/>
              <path d="M${bx+bw-4} ${by+8} L${bx+bw-4} ${by+bh-14}" stroke="${ra}" stroke-width="1.5" opacity="0.5"/>`;

    // 袖子/手臂
    const armY = by + 14;
    torso += `<path d="M${bx-2} ${armY} Q${bx-20} ${armY+10} ${bx-18} ${armY+bh*.55}" stroke="${rc}" stroke-width="18" stroke-linecap="round" fill="none"/>
              <path d="M${bx+bw+2} ${armY} Q${bx+bw+20} ${armY+10} ${bx+bw+18} ${armY+bh*.55}" stroke="${rc}" stroke-width="18" stroke-linecap="round" fill="none"/>`;

    // 手
    const handLx = bx - 20, handRx = bx + bw + 20;
    const handY = armY + bh * 0.55;
    torso += `<circle cx="${handLx}" cy="${handY}" r="9" fill="${cfg.skinColor}"/>
              <circle cx="${handRx}" cy="${handY}" r="9" fill="${cfg.skinColor}"/>`;

    return torso;
  }

  // 腿部
  function legs() {
    const ly = legY, lc = cfg.robeDark;
    const bootColor = '#4e342e';
    return `
      <rect x="${cx-legW-4}" y="${ly}" width="${legW}" height="${legH}" rx="7" fill="${lc}"/>
      <rect x="${cx+4}" y="${ly}" width="${legW}" height="${legH}" rx="7" fill="${lc}"/>
      <ellipse cx="${cx-legW*.5-4}" cy="${ly+legH}" rx="${legW*.6}" ry="8" fill="${bootColor}"/>
      <ellipse cx="${cx+legW*.5+4}" cy="${ly+legH}" rx="${legW*.6}" ry="8" fill="${bootColor}"/>
      <ellipse cx="${cx-legW*.5-4+8}" cy="${ly+legH+2}" rx="9" ry="5" fill="${bootColor}"/>
      <ellipse cx="${cx+legW*.5+4+8}" cy="${ly+legH+2}" rx="9" ry="5" fill="${bootColor}"/>`;
  }

  // 道具
  function prop() {
    const handRx = bodyX + bodyW + 20;
    const handRy = bodyTop + 14 + bodyH * 0.55;
    const handLx = bodyX - 20;
    const handLy = handRy;

    switch (cfg.prop) {
      case 'fan':
        return `<line x1="${handRx-4}" y1="${handRy-8}" x2="${handRx+5}" y2="${handRy-40}" stroke="#8B4513" stroke-width="3" stroke-linecap="round"/>
                <path d="M${handRx+5} ${handRy-40} Q${handRx+22} ${handRy-55} ${handRx+30} ${handRy-38} Q${handRx+20} ${handRy-35} ${handRx+5} ${handRy-40}" fill="${cfg.propColor}" stroke="#ccc" stroke-width="1"/>
                <line x1="${handRx+5}" y1="${handRy-40}" x2="${handRx+30}" y2="${handRy-38}" stroke="#d4a017" stroke-width="0.8"/>
                <line x1="${handRx+5}" y1="${handRy-40}" x2="${handRx+26}" y2="${handRy-50}" stroke="#d4a017" stroke-width="0.8"/>`;
      case 'sword':
        return `<line x1="${handRx}" y1="${handRy+5}" x2="${handRx+10}" y2="${handRy-55}" stroke="${cfg.propColor}" stroke-width="4" stroke-linecap="round"/>
                <line x1="${handRx-10}" y1="${handRy-25}" x2="${handRx+20}" y2="${handRy-30}" stroke="#8B4513" stroke-width="4" stroke-linecap="round"/>
                <ellipse cx="${handRx+4}" cy="${handRy-55}" rx="3" ry="6" fill="${cfg.propColor}"/>`;
      case 'spear':
        return `<line x1="${handRx-5}" y1="${handRy+10}" x2="${handRx+15}" y2="${handRy-80}" stroke="#8B4513" stroke-width="4" stroke-linecap="round"/>
                <path d="M${handRx+15} ${handRy-80} L${handRx+5} ${handRy-68} L${handRx+20} ${handRy-62} Z" fill="${cfg.propColor}"/>`;
      case 'halberd':
        return `<line x1="${handRx-8}" y1="${handRy+10}" x2="${handRx+12}" y2="${handRy-80}" stroke="#8B4513" stroke-width="5" stroke-linecap="round"/>
                <path d="M${handRx+12} ${handRy-80} L${handRx} ${handRy-65} L${handRx+18} ${handRy-58} Z" fill="${cfg.propColor}"/>
                <path d="M${handRx+5} ${handRy-65} Q${handRx+25} ${handRy-70} ${handRx+20} ${handRy-55}" fill="${cfg.propColor}" stroke="${cfg.propColor}" stroke-width="1"/>`;
      case 'scroll':
        return `<rect x="${handRx-8}" y="${handRy-38}" width="22" height="32" rx="3" fill="${cfg.propColor}" stroke="#d4a017" stroke-width="1.5"/>
                <ellipse cx="${handRx-8}" cy="${handRy-22}" rx="4" ry="16" fill="#e8dcc8"/>
                <ellipse cx="${handRx+14}" cy="${handRy-22}" rx="4" ry="16" fill="#e8dcc8"/>
                <line x1="${handRx-3}" y1="${handRy-32}" x2="${handRx+10}" y2="${handRy-32}" stroke="#d4a017" stroke-width="0.8"/>
                <line x1="${handRx-3}" y1="${handRy-26}" x2="${handRx+10}" y2="${handRy-26}" stroke="#d4a017" stroke-width="0.8"/>`;
      case 'scepter':
        return `<line x1="${handRx}" y1="${handRy+5}" x2="${handRx+8}" y2="${handRy-55}" stroke="${cfg.propColor}" stroke-width="4" stroke-linecap="round"/>
                <circle cx="${handRx+8}" cy="${handRy-55}" r="9" fill="${cfg.propColor}" stroke="#b8860b" stroke-width="1.5"/>
                <circle cx="${handRx+8}" cy="${handRy-55}" r="4" fill="#e74c3c"/>`;
      case 'medicBag':
        return `<rect x="${handLx-14}" y="${handLy-20}" width="28" height="22" rx="5" fill="#8bc34a" stroke="#558b2f" stroke-width="1.5"/>
                <line x1="${handLx}" y1="${handLy-18}" x2="${handLx}" y2="${handLy-2}" stroke="white" stroke-width="2.5"/>
                <line x1="${handLx-7}" y1="${handLy-10}" x2="${handLx+7}" y2="${handLy-10}" stroke="white" stroke-width="2.5"/>`;
      default: return '';
    }
  }

  // 脖子
  const neck = `<rect x="${cx-9}" y="${headCy+headR-8}" width="18" height="16" rx="6" fill="${cfg.skinColor}"/>`;

  // 背景
  const bg = `
    <rect width="${W}" height="${H}" fill="white"/>
    <radialGradient id="bg_${id}" cx="50%" cy="40%">
      <stop offset="0%" stop-color="${cfg.bgColor}"/>
      <stop offset="100%" stop-color="white"/>
    </radialGradient>
    <rect width="${W}" height="${H}" fill="url(#bg_${id})"/>
    <ellipse cx="${cx}" cy="${H-20}" rx="70" ry="15" fill="${cfg.accentColor}" opacity="0.12"/>`;

  // 皮肤-脸
  const faceBase = `<circle cx="${headCx}" cy="${headCy}" r="${headR}" fill="${cfg.skinColor}"/>`;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg_${id}" cx="50%" cy="35%">
      <stop offset="0%" stop-color="${cfg.bgColor}"/>
      <stop offset="100%" stop-color="white"/>
    </radialGradient>
    <filter id="shadow_${id}" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.15)"/>
    </filter>
  </defs>

  <!-- 背景 -->
  <rect width="${W}" height="${H}" fill="white"/>
  <rect width="${W}" height="${H}" fill="url(#bg_${id})"/>
  <ellipse cx="${cx}" cy="${H-18}" rx="72" ry="12" fill="${cfg.accentColor}" opacity="0.1"/>

  <!-- 身体 (先画，头在上面) -->
  <g filter="url(#shadow_${id})">
    ${body()}
    ${legs()}
  </g>

  <!-- 道具 -->
  ${prop()}

  <!-- 脖子 -->
  ${neck}

  <!-- 头部底色 -->
  <g filter="url(#shadow_${id})">
    ${hair()}
    ${faceBase}
    ${hat()}
    ${face()}
  </g>
</svg>`;
}

async function main() {
  for (const [id, cfg] of Object.entries(chars)) {
    const outPath = path.join(OUTPUT_DIR, `${id}.webp`);
    const svg = chibiSVG(id, cfg);
    await sharp(Buffer.from(svg))
      .webp({ quality: 92 })
      .toFile(outPath);
    console.log(`✓ ${id} (${cfg.name})`);
  }
  console.log('\n全部完成！');
}

main().catch(console.error);
