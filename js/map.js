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
  return `<div style="display:flex;gap:6px;margin-top:10px">
    ${['normal','elite','legend'].map(diff => {
      const dc = DIFF_CONFIG[diff];
      const unlocked = gameState.isDifficultyUnlocked(stage.id, diff);
      const stars = gameState.getStageStars(stage.id, diff);
      const starsStr = stars > 0 ? '⭐'.repeat(stars) : '';
      const multi = diff === 'legend' ? '×3' : diff === 'elite' ? '×2' : '×1';

      if (!unlocked) {
        const need = diff === 'elite' ? '通关普通' : '通关精英';
        return `<div style="flex:1;border-radius:10px;border:1.5px solid #eee;background:#fafafa;padding:7px 4px;text-align:center;opacity:0.5">
          <div style="font-size:14px">🔒</div>
          <div style="font-size:9px;color:#aaa;margin-top:2px">${need}</div>
        </div>`;
      }

      return `<button onclick="window._goStage(${stage.id},'${diff}')" ${noStamina ? 'disabled' : ''}
        style="flex:1;border:1.5px solid ${dc.color};border-radius:10px;background:${stars>0?dc.bg:'white'};
        padding:7px 4px;cursor:pointer;font-family:inherit;transition:all 0.15s;
        ${noStamina?'opacity:0.4;cursor:not-allowed':''}">
        <div style="font-size:13px">${dc.icon}</div>
        <div style="font-size:10px;font-weight:800;color:${dc.color}">${dc.label}</div>
        <div style="font-size:9px;color:#aaa">${starsStr || multi}</div>
      </button>`;
    }).join('')}
  </div>`;
}

function closePanel() {}
