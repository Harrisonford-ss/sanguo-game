// 三国志探险 - 抽卡系统（动画增强版）

import { gameState } from './state.js';
import { characters, charactersByRarity, getCharacter } from '../data/characters.js';
import { avatarHTML } from './avatars.js';

const SINGLE_COST = 10;
const TEN_COST = 90;
const PITY_RARE = 10;
const PITY_LEGEND = 30;
const FRAG = { common: 1, rare: 5, legend: 20 };

export function initGacha() {
  window.gachaModule = { pull, refresh, _showPreview: showPreview };
  refresh();
}

export function refresh() {
  const coins = gameState.gachaCoins;
  const pe = document.getElementById('gacha-points');
  if (pe) pe.textContent = coins;
  const s1 = document.getElementById('gacha-single-btn');
  const s10 = document.getElementById('gacha-ten-btn');
  if (s1) s1.disabled = coins < SINGLE_COST;
  if (s10) s10.disabled = coins < TEN_COST;
  const pr = document.getElementById('gacha-pity-rare');
  const pl = document.getElementById('gacha-pity-legend');
  if (pr) pr.textContent = Math.max(0, PITY_RARE - gameState.gachaPityRare);
  if (pl) pl.textContent = Math.max(0, PITY_LEGEND - gameState.gachaPityLegend);
}

// ===== 抽卡 =====
async function pull(count) {
  const cost = count === 1 ? SINGLE_COST : TEN_COST;
  if (!gameState.spendGachaCoins(cost)) return;
  if (count === 10) gameState.recordTenPull();

  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(pullOne(i === count - 1 && count === 10));
  }

  // 播放抽卡动画
  await playPullAnimation(results);
  refresh();

  // 成就检查
  const hasRare = results.some(r => r.rarity === 'rare' || r.rarity === 'legend');
  const hasLegend = results.some(r => r.rarity === 'legend');
  window.achievementsModule?.check({ hasRare, hasLegend });

  // 抽卡后同步到云端
  if (window.authModule?.syncToCloud) {
    window.authModule.syncToCloud().catch(() => {});
  }
}

function pullOne(isTenth = false) {
  gameState.incrementPity();
  let rarity;
  if (gameState.gachaPityLegend >= PITY_LEGEND) rarity = 'legend';
  else if (gameState.gachaPityRare >= PITY_RARE || isTenth) rarity = Math.random() < 0.15 ? 'legend' : 'rare';
  else { const r = Math.random(); rarity = r < 0.05 ? 'legend' : r < 0.30 ? 'rare' : 'common'; }

  if (rarity === 'legend') gameState.resetPityLegend();
  else if (rarity === 'rare') gameState.resetPityRare();

  const pool = charactersByRarity[rarity];
  const char = pool[Math.floor(Math.random() * pool.length)];
  const isNew = gameState.addCard(char.id);
  if (!isNew) gameState.addFragments(char.id, 5);
  return { char, isNew, rarity };
}

// ===== 抽卡动画 =====
async function playPullAnimation(results) {
  const bestRarity = results.some(r => r.rarity === 'legend') ? 'legend' :
                     results.some(r => r.rarity === 'rare') ? 'rare' : 'common';

  // 创建全屏抽卡动画层
  const overlay = document.createElement('div');
  overlay.id = 'gacha-anim';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;overflow:hidden';

  // 阶段1：蓄力动画（1.5秒）
  const bgColor = bestRarity === 'legend' ? '#1a0a2e' : bestRarity === 'rare' ? '#0a1628' : '#1a1a2e';
  overlay.innerHTML = `
    <div style="position:absolute;inset:0;background:${bgColor}"></div>
    <div id="ga-charge" style="position:relative;z-index:1;text-align:center">
      <div style="font-size:60px;animation:gaPulse 0.8s ease-in-out infinite">🎴</div>
      <div style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:12px">召唤中...</div>
    </div>
    <style>
      @keyframes gaPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
      @keyframes gaExplode { 0%{transform:scale(0);opacity:1} 100%{transform:scale(3);opacity:0} }
      @keyframes gaCardIn { 0%{transform:rotateY(90deg) scale(0.5);opacity:0} 50%{transform:rotateY(-10deg) scale(1.05)} 100%{transform:rotateY(0) scale(1);opacity:1} }
      @keyframes gaShine { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
    </style>`;
  document.body.appendChild(overlay);
  await delay(1200);

  // 阶段2：爆发光效
  const chargeEl = document.getElementById('ga-charge');
  if (chargeEl) chargeEl.remove();

  // 光爆
  const burstColor = bestRarity === 'legend' ? 'radial-gradient(circle,#ffd700,#ff8c00,transparent 70%)' :
                     bestRarity === 'rare' ? 'radial-gradient(circle,#7c4dff,#448aff,transparent 70%)' :
                     'radial-gradient(circle,#66bb6a,#4caf50,transparent 70%)';

  const burst = document.createElement('div');
  burst.style.cssText = `position:absolute;width:300px;height:300px;border-radius:50%;background:${burstColor};animation:gaExplode 0.8s ease-out forwards;z-index:2`;
  overlay.appendChild(burst);

  // 传说特效：旋转光线
  if (bestRarity === 'legend') {
    const shine = document.createElement('div');
    shine.style.cssText = 'position:absolute;width:400px;height:400px;z-index:1;animation:gaShine 3s linear infinite;opacity:0.3';
    shine.innerHTML = `<svg viewBox="0 0 400 400"><polygon points="200,0 210,180 400,200 210,220 200,400 190,220 0,200 190,180" fill="#ffd700" opacity="0.5"/></svg>`;
    overlay.appendChild(shine);
  }

  await delay(600);
  burst.remove();

  // 阶段3：展示卡牌
  if (results.length === 1) {
    await showSingleCard(overlay, results[0]);
  } else {
    await showMultiCards(overlay, results);
  }
}

async function showSingleCard(overlay, result) {
  const c = result.char;
  const rc = result.rarity;
  const borderColor = rc === 'legend' ? '#ffd700' : rc === 'rare' ? '#7c4dff' : '#66bb6a';
  const rarityName = rc === 'legend' ? '传 说' : rc === 'rare' ? '稀 有' : '普 通';
  const dupText = result.isNew ? '🆕 新武将！' : `+5 ${c.name}碎片`;

  const cardHtml = `
    <div style="position:relative;z-index:5;width:260px;animation:gaCardIn 0.6s ease-out" onclick="document.getElementById('gacha-anim')?.remove()">
      <div style="border-radius:16px;overflow:hidden;border:3px solid ${borderColor};box-shadow:0 0 30px ${borderColor}66;background:#fff">
        <img src="images/cardart/${c.id}.webp" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block" onerror="this.remove()">
        <div style="padding:14px;text-align:center">
          <div style="font-size:12px;color:${borderColor};font-weight:700;letter-spacing:3px;margin-bottom:2px">${rarityName}</div>
          <div style="font-size:22px;font-weight:900;font-family:ZCOOL XiaoWei,serif">${c.name}</div>
          <div style="font-size:12px;color:#888;margin:2px 0">${c.title}</div>
          <div style="font-size:14px;color:#f5a623;font-weight:700;margin-top:6px">${dupText}</div>
        </div>
      </div>
      <div style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;margin-top:12px">点击关闭</div>
    </div>`;

  overlay.innerHTML += cardHtml;

  // 传说卡撒金粉
  if (rc === 'legend') {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;background:#ffd700;
        left:${Math.random()*100}%;top:${Math.random()*100}%;
        animation:confettiFall ${1.5+Math.random()*2}s ease-out ${Math.random()*0.5}s forwards;opacity:0.7`;
      overlay.appendChild(p);
    }
  }

  // 等待点击关闭
  await new Promise(resolve => {
    overlay.addEventListener('click', () => { overlay.remove(); resolve(); }, { once: true });
  });
}

async function showMultiCards(overlay, results) {
  // 十连：依次翻牌
  let html = `<div style="position:relative;z-index:5;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:360px;padding:10px">`;

  results.forEach((r, i) => {
    const c = r.char;
    const rc = r.rarity;
    const borderColor = rc === 'legend' ? '#ffd700' : rc === 'rare' ? '#7c4dff' : '#66bb6a';
    const bg = rc === 'legend' ? '#fffde7' : rc === 'rare' ? '#e8eaf6' : '#f5f5f5';
    const dupText = r.isNew ? '新!' : `+${FRAG[rc]}`;

    html += `<div style="width:62px;border-radius:10px;overflow:hidden;border:2px solid ${borderColor};
      background:${bg};text-align:center;
      animation:gaCardIn 0.4s ease-out ${i * 0.1}s backwards;
      box-shadow:0 2px 8px ${borderColor}33;cursor:pointer"
      onclick="window.gachaModule._showPreview('${c.id}')">
      <img src="images/cardart/${c.id}.webp" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block" onerror="this.remove()">
      <div style="padding:3px;font-size:8px;font-weight:700">${c.name}</div>
      <div style="font-size:7px;color:${borderColor};padding-bottom:3px">${dupText}</div>
    </div>`;
  });

  html += `</div>
    <div style="position:relative;z-index:5;text-align:center;margin-top:10px">
      <button onclick="document.getElementById('gacha-anim')?.remove()" style="
        padding:8px 32px;border:none;border-radius:12px;background:rgba(255,255,255,0.15);
        color:white;font-size:14px;cursor:pointer;backdrop-filter:blur(4px);font-family:inherit">确 认</button>
    </div>`;

  overlay.innerHTML += html;

  // 最高稀有度光效
  const best = results.find(r => r.rarity === 'legend') || results.find(r => r.rarity === 'rare');
  if (best && best.rarity === 'legend') {
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:absolute;width:3px;height:3px;border-radius:50%;background:#ffd700;
        left:${Math.random()*100}%;top:${Math.random()*100}%;
        animation:confettiFall ${1+Math.random()*2}s ease-out ${Math.random()*0.8}s forwards;opacity:0.6`;
      overlay.appendChild(p);
    }
  }

  await new Promise(resolve => {
    const btn = overlay.querySelector('button');
    if (btn) btn.addEventListener('click', resolve, { once: true });
    else setTimeout(resolve, 5000);
  });
  overlay.remove();
}

// ===== 大图预览 =====
function showPreview(charId) {
  const char = getCharacter(charId); if (!char) return;
  const r = char.rarity;
  const border = r === 'legend' ? '#ffd700' : r === 'rare' ? '#7c4dff' : '#66bb6a';

  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;cursor:pointer';
  ov.onclick = () => ov.remove();
  ov.innerHTML = `<div style="max-width:300px;width:100%;animation:gaCardIn 0.4s ease-out">
    <div style="border-radius:16px;overflow:hidden;border:3px solid ${border};box-shadow:0 0 40px ${border}44">
      <img src="images/cardart/${charId}.webp" style="width:100%;display:block" onerror="this.remove()">
      <div style="padding:12px;text-align:center;background:white">
        <div style="font-size:20px;font-weight:900">${char.name}</div>
        <div style="font-size:12px;color:#888">${char.title}</div>
      </div>
    </div>
    <div style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;margin-top:8px">点击关闭</div>
  </div>`;
  document.body.appendChild(ov);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
