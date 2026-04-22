// 三国志探险 - 每日签到 v52

import { gameState } from './state.js';
import { characters } from '../data/characters.js';

const RARE_IDS   = characters.filter(c => c.rarity === 'rare').map(c => c.id);
const LEGEND_IDS = characters.filter(c => c.rarity === 'legend').map(c => c.id);

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// 7天奖励定义
const REWARDS = [
  { day: 1, label: '30 金币',           icon: '💰', give: () => { gameState.addGold(30);         return '30 金币'; } },
  { day: 2, label: '答题积分 ×3',       icon: '📝', give: () => { gameState.addQuizCoins(3);     return '答题积分 ×3'; } },
  { day: 3, label: '稀有武将碎片 ×5',   icon: '🧩', give: () => {
    const id = randomFrom(RARE_IDS);
    gameState.addFragments(id, 5);
    const name = characters.find(c => c.id === id)?.name || id;
    return `${name}碎片 ×5`;
  }},
  { day: 4, label: '50 金币',           icon: '💰', give: () => { gameState.addGold(50);         return '50 金币'; } },
  { day: 5, label: '抽卡积分 ×30',      icon: '💎', give: () => { gameState.addGachaCoins(30);   return '抽卡积分 ×30'; } },
  { day: 6, label: '稀有武将碎片 ×10',  icon: '🧩', give: () => {
    const id = randomFrom(RARE_IDS);
    gameState.addFragments(id, 10);
    const name = characters.find(c => c.id === id)?.name || id;
    return `${name}碎片 ×10`;
  }},
  { day: 7, label: '传说武将碎片 ×5',   icon: '✨', give: () => {
    const id = randomFrom(LEGEND_IDS);
    gameState.addFragments(id, 5);
    const name = characters.find(c => c.id === id)?.name || id;
    return `${name}碎片 ×5`;
  }},
];

export function initSignin() {
  window.signinModule = { showSignin, checkRedDot };
  setTimeout(() => {
    updateRedDot();
    const pill = document.getElementById('signin-pill');
    if (pill) pill.addEventListener('click', showSignin);
  }, 0);
}

function updateRedDot() {
  const dot = document.getElementById('signin-reddot');
  if (dot) dot.style.display = gameState.canSignToday() ? 'block' : 'none';
}

export function checkRedDot() { updateRedDot(); }

export function showSignin() {
  try {
  const canSign = gameState.canSignToday();
  const currentDay = gameState.signDay; // 上次签到是第几天，0=未开始

  const overlay = document.createElement('div');
  overlay.id = 'signin-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:500;padding:16px';

  const nextDay = (currentDay % 7) + 1; // 今天签到将得到的天数

  const dayCards = REWARDS.map(r => {
    const isDone   = r.day <= currentDay && !(canSign && r.day === nextDay);
    const isToday  = canSign && r.day === nextDay;
    const isFuture = !isDone && !isToday;

    const bg = isToday
      ? 'linear-gradient(135deg,#f5a623,#ff9800)'
      : isDone
        ? 'linear-gradient(135deg,#e8f5e9,#c8e6c9)'
        : '#f5f5f5';
    const border = isToday ? '2px solid #ff9800' : isDone ? '2px solid #81c784' : '2px solid #e0e0e0';
    const opacity = isFuture ? '0.55' : '1';

    return `<div style="background:${bg};border:${border};border-radius:10px;padding:8px 4px;text-align:center;opacity:${opacity};position:relative">
      ${isDone ? '<div style="position:absolute;top:2px;right:4px;font-size:12px">✓</div>' : ''}
      <div style="font-size:10px;color:${isToday?'#fff':'#888'};font-weight:700;margin-bottom:2px">第${r.day}天</div>
      <div style="font-size:20px">${r.icon}</div>
      <div style="font-size:9px;color:${isToday?'#fff':'#666'};margin-top:2px;line-height:1.3">${r.label}</div>
    </div>`;
  });

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;width:100%;max-width:360px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.25)">
      <div style="background:linear-gradient(135deg,#f5a623,#e8850a);padding:18px 16px 14px;text-align:center">
        <div style="font-size:32px">🗓️</div>
        <div style="font-size:18px;font-weight:900;color:#fff;margin-top:6px">每日签到</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:3px">连续签到领好礼，7天一循环</div>
      </div>

      <div style="padding:14px 12px">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px">
          ${dayCards.slice(0,4).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px">
          ${dayCards.slice(4).join('')}
        </div>

        ${canSign
          ? `<button id="signin-btn" style="width:100%;height:46px;border:none;border-radius:12px;background:linear-gradient(135deg,#f5a623,#e8850a);color:#fff;font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(245,166,35,0.45)">
              签到领奖 🎁
            </button>`
          : `<div style="text-align:center;padding:12px;background:#f9f9f9;border-radius:12px;color:#aaa;font-size:13px">
              ✓ 今日已签到，明天再来
            </div>`
        }
        <button onclick="document.getElementById('signin-overlay').remove()" style="width:100%;height:40px;border:1px solid #eee;border-radius:12px;background:#fff;color:#999;font-size:14px;cursor:pointer;margin-top:8px">关闭</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  if (canSign) {
    document.getElementById('signin-btn')?.addEventListener('click', () => {
      const day = gameState.doSign();
      if (!day) return;
      const reward = REWARDS.find(r => r.day === day);
      const got = reward.give();
      if (window.authModule?.syncToCloud) window.authModule.syncToCloud().catch(() => {});
      overlay.remove();
      updateRedDot();

      // 奖励弹窗
      showRewardPopup(day, reward.icon, got);
    });
  }
  } catch(e) { alert('签到错误: ' + e.message); console.error('[signin]', e); }
}

function showRewardPopup(day, icon, desc) {
  const pop = document.createElement('div');
  pop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:600;padding:20px';
  pop.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:28px 24px;text-align:center;max-width:280px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,0.25)">
      <div style="font-size:48px;margin-bottom:8px">${icon}</div>
      <h3 style="margin:0 0 6px;font-size:18px">第 ${day} 天签到成功！</h3>
      <p style="font-size:15px;font-weight:700;color:#f5a623;margin:8px 0 20px">+${desc}</p>
      <button style="width:100%;height:44px;border:none;border-radius:12px;background:linear-gradient(135deg,#f5a623,#e8850a);color:#fff;font-size:15px;font-weight:700;cursor:pointer" onclick="this.closest('div[style]').remove()">太棒了！</button>
    </div>`;
  document.body.appendChild(pop);
  pop.addEventListener('click', e => { if (e.target === pop) pop.remove(); });
}
