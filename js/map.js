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
    if (stamina <= 0) { showToast('❤️ 体力不足'); return; }
    const actualTimes = Math.min(times, stamina);
    const base = difficulty === 'legend' ? 3 : difficulty === 'elite' ? 2 : 1;
    let totalReward = 0;
    for (let i = 0; i < actualTimes; i++) {
      gameState.spendStamina();
      const clears = gameState.getDailyClears(id, difficulty);
      const reward = clears === 0 ? base : clears === 1 ? Math.floor(base / 2) : 0;
      gameState._recordDailyClear(id, difficulty);
      if (reward > 0) { gameState.data.quizCoins += reward; totalReward += reward; }
    }
    gameState.save();
    gameState.emit('coins-changed');
    closeStagePopup();
    showToast(`⚡ 扫荡×${actualTimes}！+${totalReward} 🎫答题积分`);
    refresh();
  };

  window._sweepAdjust = (delta) => {
    const el = document.getElementById('sweep-count-input');
    if (!el) return;
    el.value = Math.max(1, Math.min(10, Number(el.value) + delta));
    window._sweepInputChanged();
  };

  window._sweepInputChanged = () => {
    const el = document.getElementById('sweep-count-input');
    const hint = document.getElementById('sweep-stamina-hint');
    const btn = document.getElementById('sweep-confirm-btn');
    if (!el || !hint || !btn) return;
    const n = Math.max(1, Math.min(10, Number(el.value) || 1));
    el.value = n;
    const stamina = gameState.stamina;
    const over = n > stamina;
    hint.textContent = over ? `❤️ 体力不足（当前${stamina}）` : `消耗 ${n} ❤️`;
    hint.style.color = over ? '#ef5350' : '#aaa';
    btn.disabled = over;
    btn.style.background = over ? '#e0e0e0' : '#9c27b0';
    btn.style.cursor = over ? 'not-allowed' : 'pointer';
  };

  window._confirmSweep = (id, difficulty) => {
    const el = document.getElementById('sweep-count-input');
    const n = Math.max(1, Math.min(10, Number(el?.value) || 1));
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
  const swept = dailyClears >= 2;
  const sweepNote = dailyClears === 0 ? '首次全额' : dailyClears === 1 ? '再次减半' : '今日已结束';

  const overlay = document.createElement('div');
  overlay.id = 'stage-popup-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1000;display:flex;align-items:center;justify-content:center';
  overlay.onclick = (e) => { if (e.target === overlay) closeStagePopup(); };

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:88%;max-width:360px;padding:16px 16px 18px;box-shadow:0 8px 32px rgba(0,0,0,0.18)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:7px">
          <span style="background:${dc.color};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px">${dc.icon} ${dc.label}</span>
          <span style="font-size:14px;font-weight:800;color:#333">${stage.name}</span>
        </div>
        <button onclick="closeStagePopup()" style="background:none;border:none;font-size:16px;color:#bbb;cursor:pointer;padding:0;line-height:1">✕</button>
      </div>
      <div style="display:flex;gap:8px;align-items:stretch">
        <!-- 进入战斗 -->
        <button onclick="window._startBattle(${stage.id},'${difficulty}')" ${noStamina?'disabled':''}
          style="flex:1;padding:10px 6px;border-radius:12px;border:1.5px solid ${noStamina?'#e0e0e0':dc.color};
          background:${noStamina?'#f9f9f9':dc.bg};cursor:${noStamina?'not-allowed':'pointer'};
          font-family:inherit;text-align:center;transition:all 0.15s;${noStamina?'opacity:0.5':''}">
          <div style="font-size:20px">⚔️</div>
          <div style="font-size:12px;font-weight:800;color:${noStamina?'#bbb':dc.color};margin-top:3px">进入战斗</div>
          <div style="font-size:10px;color:#aaa;margin-top:2px">消耗 1 ❤️</div>
        </button>
        <!-- 扫荡 -->
        <div style="flex:1.4;padding:10px 8px;border-radius:12px;border:1.5px solid ${canSweep&&!swept?'#9c27b0':'#e0e0e0'};
          background:${canSweep&&!swept?'#f9f0ff':'#f9f9f9'};text-align:center;${!canSweep||swept?'opacity:0.55':''}">
          <div style="font-size:20px">⚡</div>
          <div style="font-size:12px;font-weight:800;color:${canSweep&&!swept?'#9c27b0':'#bbb'};margin-top:3px">扫荡</div>
          ${canSweep ? `<div style="font-size:9px;color:${swept?'#ef5350':'#aaa'};margin-top:1px">${sweepNote}</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:5px;margin-top:8px">
            <button onclick="window._sweepAdjust(-1)" ${swept?'disabled':''}
              style="width:22px;height:22px;border-radius:50%;border:1px solid #ce93d8;background:#fff;
              color:#9c27b0;font-size:14px;cursor:pointer;padding:0;font-weight:700;line-height:1">−</button>
            <input id="sweep-count-input" type="number" value="1" min="1" max="10"
              oninput="window._sweepInputChanged()"
              style="width:32px;text-align:center;border:1px solid #ce93d8;border-radius:7px;
              font-size:12px;font-weight:700;color:#9c27b0;padding:2px 0" ${swept?'disabled':''}>
            <button onclick="window._sweepAdjust(1)" ${swept?'disabled':''}
              style="width:22px;height:22px;border-radius:50%;border:1px solid #ce93d8;background:#fff;
              color:#9c27b0;font-size:14px;cursor:pointer;padding:0;font-weight:700;line-height:1">＋</button>
          </div>
          <div id="sweep-stamina-hint" style="font-size:10px;margin-top:5px;color:#aaa">消耗 1 ❤️</div>
          <button id="sweep-confirm-btn" onclick="window._confirmSweep(${stage.id},'${difficulty}')" ${swept?'disabled':''}
            style="margin-top:7px;width:100%;padding:6px 0;border-radius:9px;border:none;
            background:${swept?'#e0e0e0':'#9c27b0'};color:#fff;font-family:inherit;
            font-size:12px;font-weight:700;cursor:${swept?'not-allowed':'pointer'}">
            确认扫荡
          </button>` : `<div style="font-size:9px;color:#ccc;margin-top:4px">三星通关后解锁</div>`}
        </div>
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
