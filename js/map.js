// 三国志探险 - 关卡地图（对战入口）
// 地图展示12个关卡，按进度解锁，点击进入对战

import { gameState } from './state.js';
import { stages, getStage } from '../data/stages.js';
import { getCharacter } from '../data/characters.js';
import { avatarHTML } from './avatars.js';

const DIFF_CONFIG = {
  normal: { label: '普通', icon: '⚔️',  color: '#4caf50', bg: '#e8f5e9' },
  elite:  { label: '精英', icon: '🔥',  color: '#ff9800', bg: '#fff3e0' },
  legend: { label: '传说', icon: '👑',  color: '#f5a623', bg: '#fff8e1' },
};

export function initMap() {
  window.mapModule = { refresh, closePanel };

  window._goStage = (id, difficulty = 'normal') => {
    const stage = getStage(id);
    if (!stage) return;
    showStagePopup(stage, difficulty);
  };

  window._startBattle = (id, difficulty) => {
    closeStagePopup();
    if (gameState.stamina <= 0) { showToast('❤️ 体力不足'); return; }
    if (window.battleModule?.startStageBattle) {
      window.battleModule.startStageBattle(id, difficulty);
    }
  };

  window._sweepStage = (id, difficulty = 'normal', times = 1) => {
    const stamina = gameState.stamina;
    if (stamina <= 0) { showToast('❤️ 体力不足，无法扫荡'); return; }
    const remaining = gameState.remainingSweeps(id, difficulty);
    if (remaining <= 0) { showToast('今日扫荡次数已用完'); return; }
    const actualTimes = Math.min(times, stamina, remaining);
    const base = difficulty === 'legend' ? 3 : difficulty === 'elite' ? 2 : 1;
    let totalReward = 0;
    for (let i = 0; i < actualTimes; i++) {
      gameState.spendStamina();
      const clears = gameState.getDailyClears(id, difficulty);
      const reward = clears === 0 ? base : clears === 1 ? Math.floor(base / 2) : 0;
      gameState._recordDailyClear(id, difficulty);
      if (reward > 0) { gameState.data.quizCoins += reward; totalReward += reward; }
    }
    gameState.recordDailySweep(id, difficulty, actualTimes);
    gameState.save();
    gameState.emit('coins-changed');
    closeStagePopup();
    showToast(`⚡ 扫荡×${actualTimes}！+${totalReward} 🎫答题积分`);
    refresh();
  };

  window._sweepAdjust = (delta) => {
    const el = document.getElementById('sweep-count-input');
    if (!el) return;
    el.value = Math.max(1, Math.min(Number(el.max) || 10, Number(el.value) + delta));
    window._sweepInputChanged();
  };

  window._sweepInputChanged = () => {
    const el = document.getElementById('sweep-count-input');
    const hint = document.getElementById('sweep-stamina-hint');
    const btn = document.getElementById('sweep-confirm-btn');
    if (!el || !hint || !btn) return;
    const max = Number(el.max) || 10;
    const n = Math.max(1, Math.min(max, Number(el.value) || 1));
    el.value = n;
    const stamina = gameState.stamina;
    const over = n > stamina;
    hint.textContent = over ? `❤️ 体力不足（当前${stamina}）` : `消耗 ${n} ❤️`;
    hint.style.color = over ? '#ef5350' : '#ab47bc';
    btn.disabled = over;
    btn.style.background = over ? '#e0e0e0' : 'linear-gradient(135deg,#9c27b0,#6a1b9a)';
    btn.style.cursor = over ? 'not-allowed' : 'pointer';
  };

  window._confirmSweep = (id, difficulty) => {
    const el = document.getElementById('sweep-count-input');
    const n = Math.max(1, Number(el?.value) || 1);
    if (n > gameState.stamina) { showToast('❤️ 体力不足，无法扫荡'); return; }
    window._sweepStage(id, difficulty, n);
  };
}

function showStagePopup(stage, difficulty) {
  closeStagePopup();
  const dc = DIFF_CONFIG[difficulty];
  const stars = gameState.getStageStars(stage.id, difficulty);
  const canSweep = stars >= 3;
  const dailyClears = gameState.getDailyClears(stage.id, difficulty);
  const stamina = gameState.stamina;
  const noStamina = stamina <= 0;
  const remainingSweeps = gameState.remainingSweeps(stage.id, difficulty);
  const swept = remainingSweeps <= 0;
  const sweepNote = dailyClears === 0 ? '首次全额' : dailyClears === 1 ? '再次减半' : '后续无奖励';

  const overlay = document.createElement('div');
  overlay.id = 'stage-popup-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1000;display:flex;align-items:center;justify-content:center';
  overlay.onclick = (e) => { if (e.target === overlay) closeStagePopup(); };

  const starsEarned = gameState.getStageStars(stage.id, difficulty);
  const starsHTML = [1,2,3].map(i => i <= starsEarned ? '⭐' : '☆').join('');

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;width:90%;max-width:380px;
      box-shadow:0 16px 48px rgba(0,0,0,0.24),0 2px 8px rgba(0,0,0,0.08);overflow:hidden">

      <!-- 表头 -->
      <div style="background:linear-gradient(135deg,#3a3a4a,#23232f);padding:13px 16px;position:relative;display:flex;align-items:center;gap:10px">
        <div style="flex:1">
          <div style="font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">选择行动</div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="background:${dc.color};color:#fff;font-size:10px;font-weight:800;padding:1px 7px;border-radius:6px">${dc.icon} ${dc.label}</span>
            <span style="font-size:15px;font-weight:900;color:#fff">${stage.name}</span>
          </div>
          <div style="font-size:13px;margin-top:4px;letter-spacing:1px">${starsHTML}</div>
        </div>
        <button onclick="closeStagePopup()" style="background:rgba(255,255,255,0.12);border:none;color:rgba(255,255,255,0.7);
          width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:13px;line-height:1;flex:none">✕</button>
      </div>

      <!-- 左右两栏 -->
      <div style="display:flex;gap:0;padding:14px;gap:10px">

        <!-- 进入战斗 -->
        <button onclick="window._startBattle(${stage.id},'${difficulty}')" ${noStamina?'disabled':''}
          style="flex:1;padding:12px 8px;border-radius:14px;border:none;text-align:center;
          background:${noStamina?'#f2f2f2':'linear-gradient(145deg,'+dc.color+','+dc.color+'aa)'};
          box-shadow:${noStamina?'none':'0 4px 16px '+dc.color+'44'};
          cursor:${noStamina?'not-allowed':'pointer'};font-family:inherit;
          transition:all 0.2s;${noStamina?'opacity:0.5':''}">
          <div style="font-size:28px;margin-bottom:5px">⚔️</div>
          <div style="font-size:13px;font-weight:900;color:${noStamina?'#aaa':'#fff'}">进入战斗</div>
          <div style="font-size:10px;color:${noStamina?'#ccc':'rgba(255,255,255,0.75)'};margin-top:3px">消耗 1 ❤️</div>
        </button>

        <!-- 扫荡 -->
        ${canSweep ? `
        <div style="flex:1.3;padding:12px 10px;border-radius:14px;text-align:center;
          background:${swept?'#f5f5f5':'linear-gradient(145deg,#f3e5f5,#e8d5f0)'};
          border:1.5px solid ${swept?'#e0e0e0':'#ce93d8'};
          box-shadow:${swept?'none':'0 4px 16px rgba(156,39,176,0.15)'};
          ${swept?'opacity:0.6':''}">
          <div style="font-size:28px;margin-bottom:5px">⚡</div>
          <div style="font-size:13px;font-weight:900;color:${swept?'#bbb':'#7b1fa2'}">快速扫荡</div>
          <div style="font-size:10px;color:${swept?'#ccc':'#ab47bc'};margin-top:2px">${sweepNote} · 今日剩余 <b>${remainingSweeps}</b> 次</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:5px;margin-top:9px">
            <button onclick="window._sweepAdjust(-1)" ${swept?'disabled':''}
              style="width:24px;height:24px;border-radius:7px;border:1.5px solid #ce93d8;background:#fff;
              color:#9c27b0;font-size:15px;cursor:pointer;padding:0;font-weight:800;line-height:1">−</button>
            <input id="sweep-count-input" type="number" value="1" min="1" max="${remainingSweeps}"
              oninput="window._sweepInputChanged()"
              style="width:34px;text-align:center;border:1.5px solid #ce93d8;border-radius:8px;
              font-size:14px;font-weight:800;color:#7b1fa2;padding:3px 0;background:#fff" ${swept?'disabled':''}>
            <button onclick="window._sweepAdjust(1)" ${swept?'disabled':''}
              style="width:24px;height:24px;border-radius:7px;border:1.5px solid #ce93d8;background:#fff;
              color:#9c27b0;font-size:15px;cursor:pointer;padding:0;font-weight:800;line-height:1">＋</button>
          </div>
          <div id="sweep-stamina-hint" style="font-size:10px;color:#ab47bc;font-weight:700;margin-top:5px">消耗 1 ❤️</div>
          <button id="sweep-confirm-btn" onclick="window._confirmSweep(${stage.id},'${difficulty}')" ${swept?'disabled':''}
            style="margin-top:8px;width:100%;padding:8px 0;border-radius:10px;border:none;
            background:${swept?'#ddd':'linear-gradient(135deg,#9c27b0,#6a1b9a)'};
            box-shadow:${swept?'none':'0 3px 10px rgba(106,27,154,0.35)'};
            color:#fff;font-family:inherit;font-size:12px;font-weight:800;
            cursor:${swept?'not-allowed':'pointer'}">确认扫荡</button>
        </div>` : `
        <div style="flex:1;padding:12px 8px;border-radius:14px;border:1.5px solid #eee;
          background:#f8f8f8;text-align:center;opacity:0.55">
          <div style="font-size:28px;margin-bottom:5px">⚡</div>
          <div style="font-size:13px;font-weight:900;color:#ccc">快速扫荡</div>
          <div style="font-size:10px;color:#ddd;margin-top:3px">🔒 三星解锁</div>
        </div>`}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function closeStagePopup() {
  document.getElementById('stage-popup-overlay')?.remove();
}
window.closeStagePopup = closeStagePopup;

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 18px;border-radius:20px;font-size:13px;z-index:9999;pointer-events:none;opacity:1;transition:opacity 0.4s';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 1800);
}

function refresh() {
  renderStages();
}

function renderStages() {
  const container = document.getElementById('map-container');
  if (!container) return;

  const currentStage = gameState.currentStage;
  const totalStars = gameState.totalStars;

  container.innerHTML = `
    <div class="stage-header">
      <div class="stage-progress-info">
        <span class="stage-stars-total">⭐ ${totalStars} 星</span>
        <span class="stage-chapter">第 ${Math.min(currentStage, 12)} / 12 关</span>
      </div>
      <div class="stage-progress-bar">
        <div class="stage-progress-fill" style="width: ${Math.min(currentStage - 1, 12) / 12 * 100}%"></div>
      </div>
    </div>
    <div class="stage-list">
      ${stages.map(stage => renderStageCard(stage, currentStage, totalStars)).join('')}
    </div>
  `;
}

function renderStageCard(stage, currentStage, totalStars) {
  const unlocked = totalStars >= stage.unlockStars && stage.id <= currentStage;
  const completed = gameState.getStageStars(stage.id) > 0;
  const stars = gameState.getStageStars(stage.id);
  const locked = !unlocked;
  const isCurrent = stage.id === currentStage;

  const kingdomColors = { wei: '#4a90d9', shu: '#4caf50', wu: '#ef5350' };
  const color = kingdomColors[stage.kingdom] || '#999';

  const npcAvatars = stage.npcTeam.slice(0, 3).map(id => {
    const c = getCharacter(id);
    return c ? avatarHTML(c.id, 32) : '';
  }).join('');

  return `
    <div class="stage-card ${locked ? 'locked' : ''} ${isCurrent ? 'current' : ''} ${completed ? 'completed' : ''}"
         style="--kingdom-color: ${color}"
         onclick="${locked ? '' : `window._goStage(${stage.id})`}">
      <div class="stage-card-img">
        <img src="${stage.sceneImg}" alt="${stage.name}" loading="lazy">
        <div class="stage-card-overlay"></div>
        ${locked ? `<div class="stage-lock">🔒<br><span>需要 ${stage.unlockStars}⭐</span></div>` : ''}
        <div class="stage-number" style="background: ${color}">${stage.id}</div>
      </div>
      <div class="stage-card-body">
        <h4 class="stage-name">${stage.name}</h4>
        <p class="stage-desc">${stage.description}</p>
        <div class="stage-meta">
          <div class="stage-npc-row">${npcAvatars}</div>
        </div>
        ${!locked ? difficultyButtons(stage) : ''}
        ${!locked && gameState.stamina <= 0 ? `<div style="font-size:11px;color:#ef5350;margin-top:6px;font-weight:600">❤️ 体力不足</div>` : ''}
      </div>
    </div>
  `;
}

function difficultyButtons(stage) {
  const noStamina = gameState.stamina <= 0;
  return `<div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap">
    ${['normal','elite','legend'].map(diff => {
      const dc = DIFF_CONFIG[diff];
      const unlocked = gameState.isDifficultyUnlocked(stage.id, diff);
      const stars = gameState.getStageStars(stage.id, diff);
      const dailyClears = gameState.getDailyClears(stage.id, diff);
      const rewardHint = dailyClears === 0 ? '' : dailyClears === 1 ? '½' : '✗';

      if (!unlocked) {
        const need = diff === 'elite' ? '需通普通' : '需通精英';
        return `<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:20px;border:1px solid #e0e0e0;background:#f5f5f5;opacity:0.55;font-size:11px;color:#bbb">
          🔒 ${need}
        </span>`;
      }

      const starsStr = stars > 0 ? '⭐'.repeat(stars) : '';
      return `<button onclick="event.stopPropagation();window._goStage(${stage.id},'${diff}')" ${noStamina ? 'disabled' : ''}
        style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;
        border:1.5px solid ${dc.color};background:${stars>0?dc.bg:'#fff'};
        cursor:pointer;font-family:inherit;font-size:11px;font-weight:700;color:${dc.color};
        transition:all 0.15s;${noStamina?'opacity:0.4;cursor:not-allowed':''}">
        <span>${dc.icon}</span><span>${dc.label}</span>${starsStr ? `<span style="font-size:9px">${starsStr}</span>` : ''}${rewardHint ? `<span style="font-size:9px;opacity:0.7">${rewardHint}</span>` : ''}
      </button>`;
    }).join('')}
  </div>`;
}

function closePanel() {}
