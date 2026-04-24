// 三国志探险 - 登录/注册/用户中心 UI v45

import { getUser, isLoggedIn, register, login, logout, saveGameToCloud, loadGameFromCloud } from './supabase.js';
import { gameState, calcCharPower } from './state.js';
import { avatarHTML } from './avatars.js';
import { getCharacter, characters } from '../data/characters.js';

export function initAuth() {
  window.authModule = { showAuthUI, showUserMenu, syncToCloud, syncFromCloud, updateAuthDisplay, calcPower };
  updateAuthDisplay();
  console.log('[auth] initAuth, isLoggedIn=', isLoggedIn());
  // 页面加载时如果已登录，自动从云端恢复最新存档，再重新渲染当前页面
  if (isLoggedIn()) {
    syncFromCloud().then(() => {
      console.log('[auth] 云端存档加载完成, cards=', Object.keys(gameState.ownedCards));
      if (window.app) {
        window.app.updateAllDisplays();
        window.app.navigate(window.location.hash.slice(1).split('/')[0] || 'home');
      }
    }).catch((e) => { console.error('[auth] 云端加载失败', e); });
  }
}

// ===== 更新顶部显示 =====
function updateAuthDisplay() {
  const el = document.getElementById('auth-status');
  if (!el) return;

  if (isLoggedIn()) {
    const u = getUser();
    const avatarId = gameState.profileAvatar || 'liubei';
    const char = getCharacter(avatarId);
    const ringClass = char?.rarity || 'common';
    el.innerHTML = `
      <div class="home-avatar-card" onclick="window.authModule.showUserMenu()">
        <div class="home-avatar-ring ${ringClass}">
          <img class="home-avatar-img" src="images/characters/${avatarId}.webp"
            onerror="this.src='';this.style.background='rgba(255,255,255,0.2)'">
        </div>
        <span class="home-avatar-name">${u.nickname}</span>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="home-avatar-card" onclick="window.authModule.showAuthUI()">
        <div class="home-avatar-ring guest">
          <img class="home-avatar-img" src="" style="background:rgba(255,255,255,0.15)"
            onerror="this.style.display='none'">
        </div>
        <span class="home-avatar-name">登录</span>
      </div>`;
  }
}

// ===== 登录/注册弹窗 =====
function showAuthUI() {
  showPopup(`
    <h3 style="margin-bottom:12px">🏯 三国志探险</h3>
    <div id="auth-form">
      <div id="auth-tabs" style="display:flex;gap:0;margin-bottom:14px">
        <button id="tab-login" onclick="window._authTab('login')" style="flex:1;padding:8px;border:none;border-bottom:2px solid #667eea;background:none;font-weight:700;cursor:pointer;font-family:inherit">登录</button>
        <button id="tab-reg" onclick="window._authTab('reg')" style="flex:1;padding:8px;border:none;border-bottom:2px solid #ddd;background:none;color:#999;cursor:pointer;font-family:inherit">注册</button>
      </div>
      <div id="auth-fields"></div>
      <div id="auth-error" style="color:#ef5350;font-size:12px;min-height:18px;margin-top:6px"></div>
    </div>
  `);
  window._authTab = showTab;
  showTab('login');
}

function showTab(tab) {
  const loginTab = document.getElementById('tab-login');
  const regTab = document.getElementById('tab-reg');
  const fields = document.getElementById('auth-fields');
  if (!fields) return;

  if (tab === 'login') {
    loginTab.style.borderBottomColor = '#667eea'; loginTab.style.color = '#333';
    regTab.style.borderBottomColor = '#ddd'; regTab.style.color = '#999';
    fields.innerHTML = `
      <input id="a-user" type="text" placeholder="用户名" style="${inputStyle}">
      <input id="a-pass" type="password" placeholder="密码" style="${inputStyle}">
      <button onclick="window._authSubmit('login')" style="${btnStyle}">登 录</button>`;
  } else {
    regTab.style.borderBottomColor = '#667eea'; regTab.style.color = '#333';
    loginTab.style.borderBottomColor = '#ddd'; loginTab.style.color = '#999';
    fields.innerHTML = `
      <input id="a-user" type="text" placeholder="用户名（英文/数字）" style="${inputStyle}">
      <input id="a-nick" type="text" placeholder="昵称（显示名）" style="${inputStyle}">
      <input id="a-pass" type="password" placeholder="密码（至少6位）" style="${inputStyle}">
      <button onclick="window._authSubmit('reg')" style="${btnStyle}">注 册</button>`;
  }
  document.getElementById('auth-error').textContent = '';
  window._authSubmit = submitAuth;
}

const inputStyle = 'width:100%;padding:10px 12px;border:2px solid #e8e8e8;border-radius:10px;font-size:14px;margin-bottom:8px;box-sizing:border-box;font-family:inherit;outline:none';
const btnStyle = 'width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px;font-family:inherit';

async function submitAuth(type) {
  const errEl = document.getElementById('auth-error');
  const username = document.getElementById('a-user')?.value?.trim();
  const password = document.getElementById('a-pass')?.value;
  const nickname = document.getElementById('a-nick')?.value?.trim();

  if (!username || !password) { errEl.textContent = '请填写用户名和密码'; return; }
  if (password.length < 6) { errEl.textContent = '密码至少6位'; return; }

  errEl.textContent = '处理中...';
  errEl.style.color = '#999';

  let result;
  if (type === 'login') {
    result = await login(username, password);
  } else {
    if (username.length < 2) { errEl.textContent = '用户名至少2个字符'; errEl.style.color = '#ef5350'; return; }
    result = await register(username, password, nickname || username);
  }

  if (result.ok) {
    closePopup();
    updateAuthDisplay();
    // 登录后尝试从云端加载存档
    await syncFromCloud();
    if (window.app) {
      window.app.updateAllDisplays();
      window.app.navigate('home');
    }
  } else {
    errEl.textContent = result.error;
    errEl.style.color = '#ef5350';
  }
}

// ===== 用户菜单 =====
function showUserMenu() {
  const u = getUser();
  const avatarId = gameState.profileAvatar || 'liubei';
  const char = getCharacter(avatarId);
  const ringClass = char?.rarity || 'common';
  const cardCount = Object.keys(gameState.ownedCards).length;

  showPopup(`
    <div style="text-align:center;margin-bottom:16px">
      <div id="profile-avatar-ring" style="display:inline-block;padding:3px;border-radius:50%;background:${ringClass==='legend'?'linear-gradient(135deg,#ffd700,#ff9800)':ringClass==='rare'?'linear-gradient(135deg,#7c4dff,#448aff)':'linear-gradient(135deg,#66bb6a,#43a047)'};margin-bottom:8px">
        <img id="profile-avatar-img" src="images/characters/${avatarId}.webp" style="width:72px;height:72px;border-radius:50%;object-fit:cover;display:block;background:rgba(0,0,0,0.1)"
          onerror="this.style.display='none'">
      </div>
      <h3 style="margin:0 0 2px">${u.nickname}</h3>
      <p style="font-size:12px;color:#999;margin:0 0 4px">@${u.username}</p>
      <p style="font-size:12px;color:var(--text-light);margin:0">已拥有 <b style="color:var(--text)">${cardCount}</b> 名武将</p>
    </div>

    <div style="margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--text-light);margin-bottom:8px;letter-spacing:1px">更换头像</div>
      <div class="avatar-picker-grid" id="avatar-picker-grid"></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:8px">
      <button onclick="window.authModule.syncToCloud().then(()=>{alert('存档已同步到云端！');closePopup()})" style="${btnStyle}">☁️ 同步存档到云端</button>
      <button onclick="window.authModule.syncFromCloud().then(()=>{alert('已从云端恢复存档！');closePopup();location.reload()})" style="${btnStyle.replace('#667eea','#4caf50').replace('#764ba2','#43a047')}">📥 从云端恢复存档</button>
      <button onclick="window._doLogout()" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:10px;background:white;font-size:14px;cursor:pointer;font-family:inherit">退出登录</button>
    </div>
  `);

  // 渲染头像选择网格
  renderAvatarPicker();

  window._doLogout = () => {
    logout();
    gameState.reset();
    closePopup();
    updateAuthDisplay();
    if (window.app) {
      window.app.updateAllDisplays();
      window.app.navigate('home');
    }
  };
}

function renderAvatarPicker() {
  const grid = document.getElementById('avatar-picker-grid');
  if (!grid) return;

  const owned = gameState.ownedCards;
  const current = gameState.profileAvatar || 'liubei';

  // 所有武将，已拥有的放前面
  const allChars = characters.slice().sort((a, b) => {
    const aOwned = owned[a.id] ? 1 : 0;
    const bOwned = owned[b.id] ? 1 : 0;
    if (aOwned !== bOwned) return bOwned - aOwned;
    const rOrder = { legend: 0, rare: 1, common: 2 };
    return (rOrder[a.rarity] || 2) - (rOrder[b.rarity] || 2);
  });

  grid.innerHTML = allChars.map(c => {
    const isOwned = !!owned[c.id];
    const isCurrent = c.id === current;
    const borderColor = c.rarity === 'legend' ? '#ffd700' : c.rarity === 'rare' ? '#7c4dff' : '#66bb6a';

    return `<div class="avatar-picker-item ${isCurrent ? 'selected' : ''} ${!isOwned ? 'locked' : ''}"
      onclick="${isOwned ? `window._pickAvatar('${c.id}')` : ''}"
      title="${isOwned ? c.name : '未拥有'}">
      <div style="width:48px;height:48px;border-radius:50%;padding:2px;background:${isOwned ? borderColor : '#ccc'};position:relative">
        <img src="images/characters/${c.id}.webp" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;background:rgba(0,0,0,0.05)"
          onerror="this.style.display='none'">
        ${!isOwned ? `<div style="position:absolute;inset:0;border-radius:50%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:16px">🔒</div>` : ''}
        ${isCurrent ? `<div style="position:absolute;bottom:-2px;right:-2px;background:#4caf50;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;font-size:10px;border:2px solid white">✓</div>` : ''}
      </div>
      <span class="avatar-picker-name" style="color:${isOwned ? 'var(--text)' : 'var(--text-light)'}">${c.name}</span>
      <span class="avatar-picker-rarity" style="color:${isOwned ? borderColor : '#ccc'}">${c.rarity === 'legend' ? '★★★' : c.rarity === 'rare' ? '★★' : '★'}</span>
    </div>`;
  }).join('');

  window._pickAvatar = (id) => {
    gameState.data.profileAvatar = id;
    gameState.save();
    // 同步更新弹窗内大头像
    const ringEl = document.getElementById('profile-avatar-ring');
    const imgEl  = document.getElementById('profile-avatar-img');
    const c = getCharacter(id);
    if (ringEl && c) {
      const grad = c.rarity === 'legend' ? 'linear-gradient(135deg,#ffd700,#ff9800)'
                 : c.rarity === 'rare'   ? 'linear-gradient(135deg,#7c4dff,#448aff)'
                 :                         'linear-gradient(135deg,#66bb6a,#43a047)';
      ringEl.style.background = grad;
    }
    if (imgEl) { imgEl.style.display = 'block'; imgEl.src = `images/characters/${id}.webp`; }
    updateAuthDisplay();
    renderAvatarPicker();
    if (isLoggedIn()) window.authModule.syncToCloud().catch(() => {});
  };
}

// ===== 云同步 =====
function calcPower() {
  let power = 0;
  const cards = gameState.ownedCards;
  for (const id in cards) {
    const lv = cards[id].level || 1;
    power += calcCharPower(id, lv);
  }
  return power;
}

async function syncToCloud() {
  if (!isLoggedIn()) { console.log('[sync] 未登录，跳过云端同步'); return; }
  const power = calcPower();
  console.log('[sync] 正在同步到云端...', { cards: Object.keys(gameState.ownedCards).length, gachaCoins: gameState.gachaCoins });
  await saveGameToCloud(gameState.data, power);
  console.log('[sync] 云端同步完成');
}

async function syncFromCloud() {
  if (!isLoggedIn()) return;
  const data = await loadGameFromCloud();
  if (!data) return;

  const localTs = gameState.data.lastSaved || 0;
  const cloudTs = data.lastSaved || 0;

  // 云端比本地更新（换设备场景）才覆盖，否则保留本地存档
  if (cloudTs <= localTs) return;

  // defaultState 兜底，防止旧云端存档缺字段（如 signDay/lastSignDate）
  const merged = { ...gameState.data, ...data };
  // 确保初始赠送的3张卡不会丢失
  merged.ownedCards = { ...data.ownedCards };
  if (!merged.ownedCards.liubei) merged.ownedCards.liubei = { level: 1 };
  if (!merged.ownedCards.guanyu) merged.ownedCards.guanyu = { level: 1 };
  if (!merged.ownedCards.zhangfei) merged.ownedCards.zhangfei = { level: 1 };
  gameState.data = merged;
  gameState.save();
}

// ===== 自动同步（每5分钟） =====
setInterval(() => {
  if (isLoggedIn()) syncToCloud().catch(() => {});
}, 5 * 60 * 1000);

// ===== 弹窗辅助 =====
function showPopup(html) {
  closePopup();
  const d = document.createElement('div');
  d.id = 'auth-popup';
  d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:500;padding:20px';
  d.innerHTML = `<div style="background:white;border-radius:20px;padding:24px;max-width:340px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.15);animation:fadeIn 0.3s;position:relative">${html}
    <button onclick="closePopup()" style="position:absolute;top:12px;right:14px;background:none;border:none;font-size:22px;cursor:pointer;color:#bbb;line-height:1">✕</button>
  </div>`;
  document.body.appendChild(d);
  window.closePopup = closePopup;
}

function closePopup() {
  const p = document.getElementById('auth-popup');
  if (p) p.remove();
}
