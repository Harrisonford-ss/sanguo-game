// 体力系统 UI
import { gameState } from './state.js';

const REGEN_MS = 10 * 60 * 1000;

let _timer = null;

export function initStamina() {
  window.staminaModule = { refresh };
  gameState.on('stamina-changed', refresh);
  refresh();
  _timer = setInterval(refresh, 1000);
}

export function refresh() {
  const sp = gameState.stamina;
  const max = gameState.staminaMax;
  const full = sp >= max;
  const color = sp <= 3 ? '#ef5350' : sp <= 6 ? '#ff9800' : '#4caf50';

  // 回满总时间
  let fullTimeStr = '';
  if (!full) {
    const msLeft = gameState.staminaRegenMs();
    const msToFull = msLeft + (max - sp - 1) * REGEN_MS;
    fullTimeStr = formatMs(msToFull);
  }

  // 首页 stat-pill
  const homeEl = document.getElementById('home-stamina');
  if (homeEl) {
    homeEl.innerHTML = `<span style="color:${color};font-weight:800">${sp}</span><span style="color:#aaa;font-size:12px">/${max}</span>`;
  }
  const homeTimer = document.getElementById('home-stamina-timer');
  if (homeTimer) homeTimer.textContent = fullTimeStr;

  // 关卡页
  const mapEl = document.getElementById('map-stamina');
  if (mapEl) {
    mapEl.innerHTML = `<span style="color:${color};font-weight:800">${sp}/${max}</span>${fullTimeStr ? `<span style="font-size:10px;color:#aaa;margin-left:3px">${fullTimeStr}</span>` : ''}`;
  }
}

function formatMs(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
