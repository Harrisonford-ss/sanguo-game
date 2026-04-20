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
    if (gameState.stamina <= 0) return;
    if (window.battleModule?.startStageBattle) {
      window.battleModule.startStageBattle(id, difficulty);
    } else {
      alert('战斗模块加载中，请稍后重试');
    }
  };
  window._sweepStage = (id, difficulty = 'normal') => {
    const clears = gameState.getDailyClears(id, difficulty);
    if (clears >= 2) { showSweepToast('今日扫荡奖励已结束'); return; }
    const base = difficulty === 'legend' ? 3 : difficulty === 'elite' ? 2 : 1;
    const reward = clears === 0 ? base : Math.floor(base / 2);
    gameState._recordDailyClear(id, difficulty);
    gameState.save();
    if (reward > 0) gameState.addQuizCoins(reward);
    showSweepToast(`扫荡成功！获得 +${reward} 🎫答题积分`);
    refresh();
  };
}

function showSweepToast(msg) {
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

  const starsHTML = [1, 2, 3].map(i =>
    `<span class="stage-star ${i <= stars ? 'earned' : ''}">${i <= stars ? '⭐' : '☆'}</span>`
  ).join('');

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
      const canSweep = stars >= 3;
      const swept = dailyClears >= 2;
      const sweepBtn = canSweep ? `<button onclick="event.stopPropagation();window._sweepStage(${stage.id},'${diff}')"
        style="display:inline-flex;align-items:center;gap:3px;padding:4px 9px;border-radius:20px;
        border:1.5px solid ${swept?'#bbb':'#9c27b0'};background:${swept?'#f5f5f5':'#f3e5f5'};
        cursor:${swept?'not-allowed':'pointer'};font-family:inherit;font-size:11px;font-weight:700;
        color:${swept?'#bbb':'#9c27b0'};transition:all 0.15s" ${swept?'disabled':''}>
        ⚡扫荡
      </button>` : '';
      return `<div style="display:inline-flex;align-items:center;gap:4px">
        <button onclick="window._goStage(${stage.id},'${diff}')" ${noStamina ? 'disabled' : ''}
          style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;
          border:1.5px solid ${dc.color};background:${stars>0?dc.bg:'#fff'};
          cursor:pointer;font-family:inherit;font-size:11px;font-weight:700;color:${dc.color};
          transition:all 0.15s;${noStamina?'opacity:0.4;cursor:not-allowed':''}">
          <span>${dc.icon}</span><span>${dc.label}</span>${starsStr ? `<span style="font-size:9px">${starsStr}</span>` : ''}${rewardHint ? `<span style="font-size:9px;opacity:0.7">${rewardHint}</span>` : ''}
        </button>${sweepBtn}
      </div>`;
    }).join('')}
  </div>`;
}

function closePanel() {}
