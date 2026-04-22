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
  initBannerParticles();
}

export function refresh() {
  const coins = gameState.gachaCoins;
  const pe = document.getElementById('gacha-points');
  if (pe) pe.textContent = coins;
  const s1 = document.getElementById('gacha-single-btn');
  const s10 = document.getElementById('gacha-ten-btn');
  if (s1)  s1.disabled  = coins < SINGLE_COST;
  if (s10) s10.disabled = coins < TEN_COST;

  const rareLeft   = Math.max(0, PITY_RARE   - gameState.gachaPityRare);
  const legendLeft = Math.max(0, PITY_LEGEND - gameState.gachaPityLegend);

  const pr = document.getElementById('gacha-pity-rare');
  const pl = document.getElementById('gacha-pity-legend');
  if (pr) pr.textContent = rareLeft;
  if (pl) pl.textContent = legendLeft;

  const barRare   = document.getElementById('gacha-bar-rare');
  const barLegend = document.getElementById('gacha-bar-legend');
  if (barRare)   barRare.style.width   = `${((PITY_RARE   - rareLeft)   / PITY_RARE)   * 100}%`;
  if (barLegend) barLegend.style.width = `${((PITY_LEGEND - legendLeft) / PITY_LEGEND) * 100}%`;
}

// Banner 粒子
export function initBannerParticles() {
  const wrap = document.getElementById('gacha-particles');
  if (!wrap) return;
  wrap.innerHTML = '';
  const colors = ['#ffd700','#d4b0ff','#7c4dff','#ffffff','#b39ddb','#ffe082'];
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    const size = 1.5 + Math.random() * 3;
    const dur  = 5 + Math.random() * 6;
    const del  = Math.random() * 8;
    p.style.cssText = `
      position:absolute;border-radius:50%;pointer-events:none;
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;bottom:-10px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      box-shadow:0 0 ${size*2}px currentColor;
      opacity:0;animation:gwParticleRise ${dur}s ease-in ${del}s infinite;
    `;
    wrap.appendChild(p);
  }
  if (!document.getElementById('gw-particle-style')) {
    const s = document.createElement('style');
    s.id = 'gw-particle-style';
    s.textContent = `
      @keyframes gwParticleRise {
        0%   { transform:translateY(0) scale(1); opacity:0; }
        8%   { opacity:0.9; }
        85%  { opacity:0.4; }
        100% { transform:translateY(-240px) translateX(${Math.random()>0.5?'':'-'}${Math.random()*30}px) scale(0.3); opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }
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
const RARITY_COLOR = { legend: '#ffd700', rare: '#7c4dff', common: '#66bb6a' };
const RARITY_NAME  = { legend: '传　说', rare: '稀　有', common: '普　通' };
const RARITY_BG    = { legend: 'linear-gradient(160deg,#1a0800,#2a1400)', rare: 'linear-gradient(160deg,#0a0820,#150d30)', common: 'linear-gradient(160deg,#081408,#0d1f0d)' };

function injectGachaStyles() {
  if (document.getElementById('gacha-anim-style')) return;
  const s = document.createElement('style');
  s.id = 'gacha-anim-style';
  s.textContent = `
    @keyframes gaOrb    { 0%,100%{transform:scale(1);filter:blur(0px)} 50%{transform:scale(1.2);filter:blur(2px)} }
    @keyframes gaRing   { 0%{transform:scale(0.3);opacity:0.9} 100%{transform:scale(2.5);opacity:0} }
    @keyframes gaFlipIn { 0%{transform:rotateY(90deg) scale(0.85);opacity:0} 60%{transform:rotateY(-8deg) scale(1.03)} 100%{transform:rotateY(0) scale(1);opacity:1} }
    @keyframes gaSlideUp{ 0%{transform:translateY(60px);opacity:0} 100%{transform:translateY(0);opacity:1} }
    @keyframes gaBeam   { 0%{opacity:0;height:0} 40%{opacity:1} 100%{opacity:0;height:120vh} }
    @keyframes gaSpin   { from{transform:rotate(0)} to{transform:rotate(360deg)} }
    @keyframes gaParticle { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--px),var(--py)) scale(0);opacity:0} }
    @keyframes gaCardFly { 0%{transform:translateY(80px) scale(0.7);opacity:0} 70%{transform:translateY(-6px) scale(1.04)} 100%{transform:translateY(0) scale(1);opacity:1} }
    @keyframes gaLegendPulse { 0%,100%{box-shadow:0 0 20px #ffd70088,0 0 60px #ffd70033} 50%{box-shadow:0 0 40px #ffd700cc,0 0 100px #ffd70055} }
  `;
  document.head.appendChild(s);
}

async function playPullAnimation(results) {
  injectGachaStyles();
  const bestRarity = results.some(r => r.rarity === 'legend') ? 'legend' :
                     results.some(r => r.rarity === 'rare') ? 'rare' : 'common';
  const color = RARITY_COLOR[bestRarity];

  const overlay = document.createElement('div');
  overlay.id = 'gacha-anim';
  overlay.style.cssText = `position:fixed;inset:0;z-index:400;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;background:${RARITY_BG[bestRarity]}`;
  document.body.appendChild(overlay);

  // 阶段1：蓄力 orb
  const orbWrap = document.createElement('div');
  orbWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px';
  orbWrap.innerHTML = `
    <div style="position:relative;width:100px;height:100px;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,${color}88,transparent 70%);animation:gaOrb 0.9s ease-in-out infinite"></div>
      <div style="position:absolute;width:100px;height:100px;border-radius:50%;border:2px solid ${color}66;animation:gaRing 1.2s ease-out infinite"></div>
      <div style="position:absolute;width:100px;height:100px;border-radius:50%;border:2px solid ${color}33;animation:gaRing 1.2s ease-out 0.4s infinite"></div>
      <div style="font-size:44px;position:relative;z-index:1">🎴</div>
    </div>
    <div style="color:rgba(255,255,255,0.5);font-size:13px;letter-spacing:2px">召　唤　中</div>`;
  overlay.appendChild(orbWrap);
  await delay(1100);
  orbWrap.remove();

  // 阶段2：爆发光效
  if (bestRarity === 'legend') {
    // 光柱
    const beam = document.createElement('div');
    beam.style.cssText = `position:absolute;bottom:50%;left:50%;transform:translateX(-50%);width:4px;background:linear-gradient(transparent,${color},white);border-radius:2px;animation:gaBeam 0.6s ease-out forwards;z-index:1`;
    overlay.appendChild(beam);
    // 旋转星芒
    const star = document.createElement('div');
    star.style.cssText = `position:absolute;width:200px;height:200px;z-index:2;animation:gaSpin 1.5s linear infinite;opacity:0.5`;
    star.innerHTML = `<svg viewBox="0 0 200 200" style="width:100%;height:100%"><polygon points="100,0 108,88 200,100 108,112 100,200 92,112 0,100 92,88" fill="${color}"/></svg>`;
    overlay.appendChild(star);
    await delay(400);
    star.style.opacity = '0';
  }

  // 光圈扩散
  const burst = document.createElement('div');
  burst.style.cssText = `position:absolute;width:200px;height:200px;border-radius:50%;border:3px solid ${color};animation:gaRing 0.6s ease-out forwards;z-index:3`;
  overlay.appendChild(burst);
  await delay(500);

  // 阶段3：展示卡牌
  if (results.length === 1) {
    await showSingleCard(overlay, results[0], bestRarity);
  } else {
    await showMultiCards(overlay, results, bestRarity);
  }
}

async function showSingleCard(overlay, result, bestRarity) {
  const c = result.char;
  const rc = result.rarity;
  const color = RARITY_COLOR[rc];
  const dupText = result.isNew ? '🆕 新武将！' : `+5 ${c.name}碎片`;
  const isLegend = rc === 'legend';

  // 清空 overlay 内子元素
  overlay.innerHTML = '';
  overlay.style.background = RARITY_BG[rc];

  const card = document.createElement('div');
  card.style.cssText = `position:relative;z-index:5;width:min(260px,80vw);animation:gaFlipIn 0.65s cubic-bezier(0.16,1,0.3,1);cursor:pointer;perspective:800px;${isLegend?'animation:gaFlipIn 0.65s cubic-bezier(0.16,1,0.3,1),gaLegendPulse 2s ease-in-out 0.7s infinite':''}`;
  card.innerHTML = `
    <div style="border-radius:18px;overflow:hidden;border:2.5px solid ${color};box-shadow:0 0 40px ${color}55,0 8px 32px rgba(0,0,0,0.6)">
      <div style="position:relative;aspect-ratio:3/4;overflow:hidden;background:#111">
        <img src="images/cardart/${c.id}.webp" style="width:100%;height:100%;object-fit:cover;display:block;animation:slowZoom 8s ease-in-out infinite alternate" onerror="this.style.display='none'">
        <div style="position:absolute;inset:0;background:linear-gradient(transparent 55%,rgba(0,0,0,0.85))"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;padding:16px;text-align:center">
          <div style="font-size:11px;color:${color};font-weight:800;letter-spacing:4px;margin-bottom:4px">${RARITY_NAME[rc]}</div>
          <div style="font-size:26px;font-weight:900;font-family:ZCOOL XiaoWei,serif;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.8)">${c.name}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:2px">${c.title}</div>
        </div>
        ${isLegend ? `<div style="position:absolute;top:10px;right:10px;background:#ffd700;color:#1a0800;font-size:10px;font-weight:800;padding:3px 8px;border-radius:10px;letter-spacing:1px">LEGEND</div>` : ''}
      </div>
      <div style="background:rgba(10,5,20,0.95);padding:12px 16px;text-align:center;border-top:1px solid ${color}44">
        <div style="font-size:15px;font-weight:700;color:${color}">${dupText}</div>
      </div>
    </div>
    <div style="text-align:center;color:rgba(255,255,255,0.35);font-size:11px;margin-top:14px;letter-spacing:1px">点击关闭</div>`;
  overlay.appendChild(card);

  // 粒子
  spawnParticles(overlay, rc, isLegend ? 40 : rc === 'rare' ? 20 : 8);

  await new Promise(resolve => {
    overlay.addEventListener('click', () => { overlay.remove(); resolve(); }, { once: true });
  });
}

async function showMultiCards(overlay, results, bestRarity) {
  overlay.innerHTML = '';
  overlay.style.cssText += ';justify-content:flex-start;padding-top:16px';

  const color = RARITY_COLOR[bestRarity];

  // 标题行
  const title = document.createElement('div');
  title.style.cssText = 'color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:2px;margin-bottom:12px;animation:gaSlideUp 0.4s ease-out';
  title.textContent = '十连召唤结果';
  overlay.appendChild(title);

  // 卡牌网格
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-width:360px;width:90%;z-index:5';
  overlay.appendChild(grid);

  // 依次翻牌
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const c = r.char;
    const rc = r.rarity;
    const col = RARITY_COLOR[rc];
    const dupText = r.isNew ? '新!' : `+${FRAG[rc]}`;

    const cardEl = document.createElement('div');
    cardEl.style.cssText = `border-radius:10px;overflow:hidden;border:2px solid ${col};
      background:rgba(10,5,20,0.9);text-align:center;cursor:pointer;
      box-shadow:0 2px 12px ${col}44;
      opacity:0;animation:gaCardFly 0.35s cubic-bezier(0.16,1,0.3,1) ${i*0.08}s forwards;
      transition:transform 0.15s`;
    cardEl.innerHTML = `
      <div style="position:relative;aspect-ratio:3/4;overflow:hidden;background:#0a0514">
        <img src="images/cardart/${c.id}.webp" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display='none'">
        <div style="position:absolute;inset:0;background:linear-gradient(transparent 50%,rgba(0,0,0,0.7))"></div>
        ${rc === 'legend' ? `<div style="position:absolute;top:3px;right:3px;font-size:8px;background:#ffd700;color:#1a0800;padding:1px 4px;border-radius:4px;font-weight:800">★</div>` : ''}
      </div>
      <div style="padding:4px 2px 5px">
        <div style="font-size:9px;font-weight:800;color:white">${c.name}</div>
        <div style="font-size:8px;color:${col};margin-top:1px">${dupText}</div>
      </div>`;
    cardEl.onclick = () => showPreview(c.id);
    cardEl.onmouseenter = () => { cardEl.style.transform = 'scale(1.06)'; };
    cardEl.onmouseleave = () => { cardEl.style.transform = ''; };
    grid.appendChild(cardEl);

    // 传说卡出现时额外闪光
    if (rc === 'legend') {
      await delay(i * 80 + 200);
      spawnParticles(overlay, 'legend', 12);
    }
  }

  // 粒子
  if (bestRarity === 'legend') spawnParticles(overlay, 'legend', 25);
  else if (bestRarity === 'rare') spawnParticles(overlay, 'rare', 10);

  // 确认按钮
  const btn = document.createElement('button');
  btn.style.cssText = `margin-top:16px;padding:10px 40px;border:1px solid ${color}66;border-radius:14px;
    background:rgba(255,255,255,0.08);color:white;font-size:14px;font-weight:600;
    cursor:pointer;backdrop-filter:blur(8px);font-family:inherit;letter-spacing:1px;
    animation:gaSlideUp 0.4s ease-out;z-index:5`;
  btn.textContent = '确 认';
  overlay.appendChild(btn);

  await new Promise(resolve => {
    btn.addEventListener('click', resolve, { once: true });
  });
  overlay.remove();
}

function spawnParticles(container, rarity, count) {
  const colors = rarity === 'legend' ? ['#ffd700','#ffb300','#fff8e1','#ffffff'] :
                 rarity === 'rare'   ? ['#7c4dff','#b39ddb','#e8eaf6','#ffffff'] :
                                       ['#66bb6a','#a5d6a7','#ffffff'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = 2 + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 180;
    p.style.cssText = `
      position:absolute;border-radius:50%;pointer-events:none;z-index:10;
      width:${size}px;height:${size}px;
      left:${30 + Math.random()*40}%;top:${20 + Math.random()*40}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      --px:${Math.cos(angle)*dist}px;--py:${Math.sin(angle)*dist}px;
      animation:gaParticle ${0.8+Math.random()*0.8}s ease-out ${Math.random()*0.3}s forwards;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 1800);
  }
}

// ===== 大图预览 =====
function showPreview(charId) {
  const char = getCharacter(charId); if (!char) return;
  const r = char.rarity;
  const color = RARITY_COLOR[r];

  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:500;display:flex;align-items:center;justify-content:center;padding:24px;cursor:pointer;backdrop-filter:blur(4px)';
  ov.onclick = () => ov.remove();
  ov.innerHTML = `
    <div style="max-width:300px;width:100%;animation:gaFlipIn 0.45s cubic-bezier(0.16,1,0.3,1)">
      <div style="border-radius:18px;overflow:hidden;border:2.5px solid ${color};box-shadow:0 0 60px ${color}55,0 12px 40px rgba(0,0,0,0.7)">
        <div style="position:relative;aspect-ratio:3/4;overflow:hidden;background:#0a0514">
          <img src="images/cardart/${charId}.webp" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display='none'">
          <div style="position:absolute;inset:0;background:linear-gradient(transparent 55%,rgba(0,0,0,0.85))"></div>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:20px;text-align:center">
            <div style="font-size:11px;color:${color};font-weight:800;letter-spacing:4px;margin-bottom:4px">${RARITY_NAME[r]}</div>
            <div style="font-size:28px;font-weight:900;font-family:ZCOOL XiaoWei,serif;color:white">${char.name}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:3px">${char.title}</div>
          </div>
        </div>
      </div>
      <div style="text-align:center;color:rgba(255,255,255,0.3);font-size:11px;margin-top:12px;letter-spacing:1px">点击关闭</div>
    </div>`;
  document.body.appendChild(ov);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
