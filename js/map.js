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
    const max = Math.min(10, gameState.stamina);
    el.value = Math.max(1, Math.min(max, Number(el.value) + delta));
  };
}

function showStagePopup(stage, difficulty) {
  closeStagePopup();
  const dc = DIFF_CONFIG[difficulty];
  const stars = gameState.getStageStars(stage.id, difficulty);
  const canSweep = stars >= 3;
  const dailyClears = gameState.getDailyClears(stage.id, difficulty);
  const noStamina = gameState.stamina <= 0;
  const maxSweep = Math.min(10, gameState.stamina);
  const swept = dailyClears >= 2;

  const sweepRewardText = dailyClears === 0
    ? `首次扫荡：全额奖励`
    : dailyClears === 1 ? `再次扫荡：奖励减半` : `今日奖励已领完`;

  const overlay = document.createElement('div');
  overlay.id = 'stage-popup-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:flex-end;justify-content:center';
  overlay.onclick = (e) => { if (e.target === overlay) closeStagePopup(); };

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:20px 20px 32px;box-shadow:0 -4px 24px rgba(0,0,0,0.15)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div>
          <span style="display:inline-block;background:${dc.color};color:#fff;font-size:11px;font-weight:800;padding:2px 10px;border-radius:10px;margin-right:6px">${dc.icon} ${dc.label}</span>
          <span style="font-size:16px;font-weight:800;color:#333">${stage.name}</span>
        </div>
        <button onclick="closeStagePopup()" style="background:none;border:none;font-size:20px;color:#aaa;cursor:pointer;line-height:1">✕</button>
      </div>
      <div style="display:flex;gap:10px">
        <!-- 进入战斗 -->
        <button onclick="window._startBattle(${stage.id},'${difficulty}')" ${noStamina?'disabled':''}
          style="flex:1;padding:14px 10px;border-radius:14px;border:2px solid ${dc.color};
          background:${noStamina?'#f5f5f5':dc.bg};cursor:${noStamina?'not-allowed':'pointer'};
          font-family:inherit;transition:all 0.15s;${noStamina?'opacity:0.5':''}">
          <div style="font-size:24px;margin-bottom:4px">⚔️</div>
          <div style="font-size:14px;font-weight:800;color:${noStamina?'#bbb':dc.color}">进入战斗</div>
          <div style="font-size:11px;color:#aaa;margin-top:2px">消耗 1 ❤️</div>
        </button>
        <!-- 扫荡 -->
        ${canSweep ? `
        <div style="flex:1;padding:14px 10px;border-radius:14px;border:2px solid ${swept||maxSweep<1?'#e0e0e0':'#9c27b0'};
          background:${swept||maxSweep<1?'#f5f5f5':'#f3e5f5'};text-align:center">
          <div style="font-size:24px;margin-bottom:4px">⚡</div>
          <div style="font-size:14px;font-weight:800;color:${swept||maxSweep<1?'#bbb':'#9c27b0'}">扫荡</div>
          <div style="font-size:10px;color:${swept?'#ef5350':'#aaa'};margin-top:2px">${sweepRewardText}</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px">
            <button onclick="window._sweepAdjust(-1)"
              style="width:24px;height:24px;border-radius:50%;border:1.5px solid #ce93d8;background:#fff;
              color:#9c27b0;font-size:14px;cursor:pointer;padding:0;font-weight:700;line-height:1" ${swept||maxSweep<1?'disabled':''}>−</button>
            <input id="sweep-count-input" type="number" value="1" min="1" max="${maxSweep}"
              style="width:36px;text-align:center;border:1.5px solid #ce93d8;border-radius:8px;
              font-size:13px;font-weight:700;color:#9c27b0;padding:3px 0;background:#fff" ${swept||maxSweep<1?'disabled':''}>
            <button onclick="window._sweepAdjust(1)"
              style="width:24px;height:24px;border-radius:50%;border:1.5px solid #ce93d8;background:#fff;
              color:#9c27b0;font-size:14px;cursor:pointer;padding:0;font-weight:700;line-height:1" ${swept||maxSweep<1?'disabled':''}>＋</button>
          </div>
          <button onclick="window._sweepStage(${stage.id},'${difficulty}',Number(document.getElementById('sweep-count-input')?.value||1))"
            style="margin-top:10px;width:100%;padding:7px 0;border-radius:10px;
            border:none;background:${swept||maxSweep<1?'#e0e0e0':'#9c27b0'};color:#fff;
            font-family:inherit;font-size:13px;font-weight:700;cursor:${swept||maxSweep<1?'not-allowed':'pointer'}" ${swept||maxSweep<1?'disabled':''}>
            确认扫荡
          </button>
        </div>` : `
        <div style="flex:1;padding:14px 10px;border-radius:14px;border:2px solid #e0e0e0;background:#fafafa;text-align:center;opacity:0.6">
          <div style="font-size:24px;margin-bottom:4px">⚡</div>
          <div style="font-size:14px;font-weight:800;color:#bbb">扫荡</div>
          <div style="font-size:10px;color:#ccc;margin-top:4px">三星通关后解锁</div>
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
