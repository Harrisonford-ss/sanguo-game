// 体力系统 UI
import { gameState } from './state.js';

let _timer = null;

export function initStamina() {
  window.staminaModule = { refresh, showDetail };
  gameState.on('stamina-changed', refresh);
  refresh();
  // 每秒更新倒计时
  _timer = setInterval(refresh, 1000);
}

export function refresh() {
  const sp = gameState.stamina;
  const max = gameState.staminaMax;
  const full = sp >= max;
  const msLeft = gameState.staminaRegenMs();
  const timeStr = full ? '已满' : formatMs(msLeft);
  const color = sp <= 3 ? '#ef5350' : sp <= 6 ? '#ff9800' : '#4caf50';

  // 首页 stat-pill
  const homeEl = document.getElementById('home-stamina');
  if (homeEl) {
    homeEl.innerHTML = `<span style="color:${color};font-weight:800">${sp}</span><span style="color:#aaa;font-size:12px">/${max}</span>`;
  }

  // 首页倒计时
  const homeTimer = document.getElementById('home-stamina-timer');
  if (homeTimer) homeTimer.textContent = full ? '' : timeStr;

  // 关卡页
  const mapEl = document.getElementById('map-stamina');
  if (mapEl) {
    mapEl.innerHTML = `<span style="color:${color};font-weight:800">${sp}/${max}</span>${full ? '' : `<span style="font-size:10px;color:#aaa;margin-left:3px">${timeStr}</span>`}`;
  }
}

export function showDetail() {
  const sp = gameState.stamina;
  const max = gameState.staminaMax;
  const full = sp >= max;
  const msLeft = gameState.staminaRegenMs();
  const fillPct = sp / max * 100;
  const color = sp <= 3 ? '#ef5350' : sp <= 6 ? '#ff9800' : '#4caf50';

  // 计算满体力时间
  let fullTimeStr = '';
  if (!full) {
    const msToFull = msLeft + (max - sp - 1) * gameState.constructor.STAMINA_REGEN_MS;
    const fullAt = new Date(Date.now() + msToFull);
    fullTimeStr = fullAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:600;display:flex;align-items:flex-end;justify-content:center;padding:20px';
  ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
  ov.innerHTML = `
    <div style="background:white;border-radius:20px 20px 16px 16px;padding:20px;width:100%;max-width:400px;box-shadow:0 -4px 30px rgba(0,0,0,0.15)" onclick="event.stopPropagation()">
      <div style="margin-bottom:16px">
        <h4 style="margin:0;font-size:16px">❤️ 体力</h4>
      </div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <span style="font-size:36px;font-weight:900;color:${color}">${sp}</span>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#aaa;margin-bottom:4px">
            <span>当前体力</span><span>${sp} / ${max}</span>
          </div>
          <div style="height:10px;background:#f0f0f0;border-radius:5px;overflow:hidden">
            <div style="height:100%;width:${fillPct}%;background:${color};border-radius:5px;transition:width 0.4s"></div>
          </div>
        </div>
      </div>
      <div style="background:#f9f9f9;border-radius:12px;padding:12px;font-size:13px;display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;justify-content:space-between">
          <span style="color:#888">恢复速度</span><span style="font-weight:600">每 10 分钟 +1</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#888">下次恢复</span>
          <span style="font-weight:600;color:${full?'#4caf50':'#333'}">${full ? '已满' : formatMs(msLeft)}</span>
        </div>
        ${!full ? `<div style="display:flex;justify-content:space-between">
          <span style="color:#888">预计回满</span><span style="font-weight:600">${fullTimeStr}</span>
        </div>` : ''}
      </div>
      <p style="font-size:11px;color:#bbb;text-align:center;margin:10px 0 0">每次闯关消耗 1 点体力</p>
    </div>`;
  document.body.appendChild(ov);
}

function formatMs(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
