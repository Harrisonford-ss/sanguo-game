// 三国志探险 - 排行榜 + 擂台

import { getLeaderboard, getFloorLeaderboard, getArenaOpponents, getMyArenaTeam, setArenaTeam, recordArenaResult, getArenaLog, isLoggedIn, getUser } from './supabase.js';
import { gameState } from './state.js';
import { getCharacter } from '../data/characters.js';
import { avatarHTML } from './avatars.js';
import { calcStats } from './battle.js';

let currentTab = 'rank'; // 'rank' | 'arena' | 'log'
let rankSubTab = 'power'; // 'power' | 'floor'

export function initLeaderboard() {
  window.lbModule = { refresh };
}

async function refresh() {
  const container = document.getElementById('leaderboard-container');
  if (!container) return;

  if (!isLoggedIn()) {
    container.innerHTML = `<div style="text-align:center;padding:40px 20px">
      <div style="font-size:40px;margin-bottom:8px">🏆</div>
      <h3>排行榜 & 擂台</h3>
      <p style="color:var(--text-light);margin:8px 0">登录后即可查看排行榜和参与擂台对战</p>
      <button class="btn btn-primary" onclick="window.authModule.showAuthUI()">登录 / 注册</button>
    </div>`;
    return;
  }

  container.innerHTML = `
    <div style="display:flex;border-bottom:2px solid #eee;margin-bottom:12px">
      <button class="lb-tab ${currentTab==='rank'?'active':''}" onclick="window.lbModule._tab('rank')">🏆 排行榜</button>
      <button class="lb-tab ${currentTab==='arena'?'active':''}" onclick="window.lbModule._tab('arena')">⚔️ 擂台</button>
      <button class="lb-tab ${currentTab==='log'?'active':''}" onclick="window.lbModule._tab('log')">📜 战报</button>
    </div>
    <div id="lb-content" style="padding:0 4px"></div>`;

  window.lbModule._tab = (t) => { currentTab = t; refresh(); };
  window.lbModule._rankSub = (t) => { rankSubTab = t; refresh(); };

  const content = document.getElementById('lb-content');
  if (currentTab === 'rank') await renderRank(content);
  else if (currentTab === 'arena') await renderArena(content);
  else await renderLog(content);
}

// ===== 排行榜 =====
async function renderRank(el) {
  const isPower = rankSubTab === 'power';

  // 二级切换
  el.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button onclick="window.lbModule._rankSub('power')" style="
        flex:1;padding:8px;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;
        background:${isPower ? 'linear-gradient(135deg,#f5a623,#ff9800)' : 'var(--bg-card)'};
        color:${isPower ? 'white' : 'var(--text-light)'};
        box-shadow:${isPower ? '0 3px 10px rgba(245,166,35,0.35)' : 'var(--shadow)'}">
        ⚔️ 战力榜
      </button>
      <button onclick="window.lbModule._rankSub('floor')" style="
        flex:1;padding:8px;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;
        background:${!isPower ? 'linear-gradient(135deg,#4caf50,#388e3c)' : 'var(--bg-card)'};
        color:${!isPower ? 'white' : 'var(--text-light)'};
        box-shadow:${!isPower ? '0 3px 10px rgba(76,175,80,0.35)' : 'var(--shadow)'}">
        🗺️ 探险榜
      </button>
    </div>
    <div id="rank-list"><div style="text-align:center;color:var(--text-light);padding:20px">加载中...</div></div>`;

  try {
    const list = isPower ? await getLeaderboard(30) : await getFloorLeaderboard(30);
    const me = getUser();
    const listEl = document.getElementById('rank-list');
    if (!listEl) return;

    const filtered = isPower ? list : list.filter(r => r.dungeon_floor > 0);

    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="text-align:center;color:var(--text-light);padding:20px">
        ${isPower ? '暂无战力数据，多多游戏提升战力吧！' : '暂无探险记录，快去探险创造纪录吧！'}
      </div>`;
      return;
    }

    listEl.innerHTML = filtered.map((row, i) => {
      const isMe = row.user_id === me?.id;
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `<span style="font-size:12px">${i+1}</span>`;

      const valueColor = isPower ? '#f5a623' : '#4caf50';
      const value = isPower ? (row.power || 0) : (row.dungeon_floor || 0);
      const unit = isPower ? '战力' : '层';
      const sub = isPower
        ? `🃏${row.card_count||0} &nbsp;⚔️${row.win_count||0}胜`
        : `🃏${row.card_count||0} &nbsp;⚔️${row.win_count||0}胜`;

      return `<div style="display:flex;align-items:center;gap:8px;padding:9px 8px;border-radius:10px;margin-bottom:5px;
        ${isMe
          ? 'background:linear-gradient(135deg,#4caf5012,#4caf5022);border:1.5px solid #4caf5066'
          : 'background:var(--bg-card);border:1.5px solid transparent'};
        box-shadow:var(--shadow)">
        <span style="width:26px;text-align:center;font-size:${i<3?'18':'13'}px;font-weight:700;flex-shrink:0">${medal}</span>
        ${avatarHTML(row.avatar || 'liubei', 36)}
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:700;${isMe?'color:#4caf50':''};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${row.nickname}${isMe?' <span style="font-size:10px;background:#4caf5020;color:#4caf50;padding:1px 5px;border-radius:4px">我</span>':''}
          </div>
          <div style="font-size:10px;color:var(--text-light);margin-top:1px">${sub}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:17px;font-weight:800;color:${valueColor};line-height:1">${value}</div>
          <div style="font-size:9px;color:var(--text-light)">${unit}</div>
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    const listEl = document.getElementById('rank-list');
    if (listEl) listEl.innerHTML = `<div style="color:#ef5350;padding:20px;text-align:center">加载失败: ${e.message}</div>`;
  }
}

// ===== 擂台 =====
async function renderArena(el) {
  el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px">加载中...</div>';

  try {
    const myCards = Object.keys(gameState.ownedCards);
    const opponents = await getArenaOpponents(15);
    const myArena = await getMyArenaTeam();

    // 当前阵容预览
    let currentTeamHTML = '<div style="color:var(--text-light);font-size:12px;padding:8px;text-align:center">尚未设置阵容</div>';
    let savedTeamIds = [null, null, null];

    if (myArena && myArena.team && myArena.team.length > 0) {
      savedTeamIds = myArena.team.map(t => t.charId || t);
      const teamCards = myArena.team.map(t => {
        const c = getCharacter(t.charId || t);
        if (!c) return '';
        const lv = t.level || gameState.getCardLevel(c.id) || 1;
        return `<div style="text-align:center;width:70px">
          ${avatarHTML(c.id, 44)}
          <div style="font-size:11px;font-weight:700;margin-top:2px">${c.name}</div>
          <div style="font-size:9px;color:var(--text-light)">Lv${lv}</div>
        </div>`;
      }).join('');
      currentTeamHTML = `<div style="display:flex;gap:8px;justify-content:center;margin-bottom:4px">${teamCards}</div>
        <div style="text-align:center;font-size:12px;color:#f5a623;font-weight:600">战力 ${myArena.power} · ${myArena.wins||0}胜${myArena.losses||0}负</div>`;
    }

    el.innerHTML = `
      <!-- 我的阵容 -->
      <div style="background:var(--bg-card);border-radius:12px;padding:12px;margin-bottom:12px;box-shadow:var(--shadow)">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">🛡️ 我的防守阵容</div>
        ${currentTeamHTML}
        <button class="btn btn-primary" style="width:100%;font-size:13px;padding:8px;margin-top:8px" onclick="window.lbModule._setTeam()">
          ${myArena ? '修改阵容' : '设置阵容'}
        </button>
      </div>

      <!-- 对手列表 -->
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">⚔️ 挑战对手</div>
      <div id="arena-opponents">${opponents.length === 0 ? '<div style="text-align:center;color:var(--text-light);padding:16px">暂无其他玩家，邀请朋友一起玩吧！</div>' : ''}</div>`;

    // 渲染对手列表
    const oppEl = document.getElementById('arena-opponents');
    if (oppEl && opponents.length > 0) {
      oppEl.innerHTML = opponents.map(opp => {
        const teamPreview = (opp.team || []).slice(0, 3).map(t => {
          const c = getCharacter(t.charId || t);
          return c ? avatarHTML(c.id, 28) : '';
        }).join('');

        return `<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg-card);border-radius:10px;margin-bottom:6px;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
          ${avatarHTML(opp.avatar || 'caocao', 36)}
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700">${opp.nickname}</div>
            <div style="font-size:10px;color:var(--text-light)">战力 ${opp.power} · ${opp.wins}胜${opp.losses}负</div>
            <div style="display:flex;gap:2px;margin-top:2px">${teamPreview}</div>
          </div>
          <button class="btn btn-primary" style="font-size:11px;padding:6px 12px" onclick="window.lbModule._challenge('${opp.user_id}')">挑战</button>
        </div>`;
      }).join('');
    }

    // 设置阵容 — 弹出选将界面
    let arenaSelected = [null, null, null];

    window.lbModule._setTeam = () => {
      // 用已保存的阵容初始化，没有的话清空
      arenaSelected = [
        savedTeamIds[0] && myCards.includes(savedTeamIds[0]) ? savedTeamIds[0] : null,
        savedTeamIds[1] && myCards.includes(savedTeamIds[1]) ? savedTeamIds[1] : null,
        savedTeamIds[2] && myCards.includes(savedTeamIds[2]) ? savedTeamIds[2] : null,
      ];
      renderTeamPicker();
    };

    function renderTeamPicker() {
      const popup = document.createElement('div');
      popup.id = 'arena-picker';
      popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:500;padding:16px';

      const filled = arenaSelected.filter(Boolean).length;
      const totalPower = arenaSelected.filter(Boolean).reduce((s, id) => s + ((gameState.getCardLevel(id)||1)*100+50), 0);

      popup.innerHTML = `<div style="background:white;border-radius:20px;padding:20px;max-width:380px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h4 style="font-size:16px">🛡️ 设置防守阵容</h4>
          <button onclick="document.getElementById('arena-picker')?.remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#999">✕</button>
        </div>

        <!-- 已选槽位 -->
        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px">
          ${arenaSelected.map((id, i) => {
            if (id) {
              const c = getCharacter(id);
              const lv = gameState.getCardLevel(id);
              return `<div style="width:80px;text-align:center;cursor:pointer;border:2px solid #4caf50;border-radius:10px;padding:6px;background:#4caf5010"
                onclick="window.lbModule._arenaRemove(${i})">
                ${avatarHTML(id, 48)}
                <div style="font-size:11px;font-weight:700;margin-top:2px">${c?.name||''}</div>
                <div style="font-size:9px;color:var(--text-light)">Lv${lv}</div>
              </div>`;
            }
            return `<div style="width:80px;height:90px;border:2px dashed #ddd;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:24px;background:#fafafa">+</div>`;
          }).join('')}
        </div>

        <div style="text-align:center;font-size:13px;color:var(--text-light);margin-bottom:10px">
          总战力: <strong style="color:#f5a623;font-size:16px">${totalPower}</strong>
        </div>

        <!-- 可选武将 -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px">
          ${myCards.map(id => {
            const c = getCharacter(id); if (!c) return '';
            const sel = arenaSelected.includes(id);
            const lv = gameState.getCardLevel(id);
            const rb = c.rarity === 'legend' ? '#ffd700' : c.rarity === 'rare' ? '#7c4dff' : '#bbb';
            return `<div style="text-align:center;padding:6px;border-radius:8px;cursor:pointer;
              border:2px solid ${sel ? '#4caf50' : rb};
              background:${sel ? '#4caf5010' : '#fff'};
              ${sel ? 'opacity:0.5;' : ''}
              transition:all 0.2s"
              onclick="${sel ? '' : `window.lbModule._arenaPick('${id}')`}">
              ${avatarHTML(id, 40)}
              <div style="font-size:11px;font-weight:700;margin-top:2px">${c.name}</div>
              <div style="font-size:9px;color:${rb}">Lv${lv} ${'★'.repeat(lv)}</div>
            </div>`;
          }).join('')}
        </div>

        <!-- 确认按钮 -->
        <button ${filled < 3 ? 'disabled' : ''} onclick="window.lbModule._arenaConfirm()"
          style="width:100%;padding:12px;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;
          background:${filled >= 3 ? 'linear-gradient(135deg,#667eea,#764ba2)' : '#e0e0e0'};
          color:${filled >= 3 ? 'white' : '#999'}">
          ${filled < 3 ? `还需选择 ${3-filled} 名武将` : `✅ 确认阵容 (战力${totalPower})`}
        </button>
      </div>`;

      // 移除旧弹窗再添加
      document.getElementById('arena-picker')?.remove();
      document.body.appendChild(popup);
    }

    window.lbModule._arenaPick = (id) => {
      const empty = arenaSelected.indexOf(null);
      if (empty === -1 || arenaSelected.includes(id)) return;
      arenaSelected[empty] = id;
      renderTeamPicker();
    };

    window.lbModule._arenaRemove = (i) => {
      arenaSelected[i] = null;
      renderTeamPicker();
    };

    window.lbModule._arenaConfirm = async () => {
      if (arenaSelected.filter(Boolean).length < 3) return;
      const team = arenaSelected.map(id => ({ charId: id, level: gameState.getCardLevel(id) }));
      const totalPower = team.reduce((s, t) => s + (t.level * 100 + 50), 0);
      document.getElementById('arena-picker')?.remove();
      await setArenaTeam(team, totalPower);
      refresh();
    };

    // 挑战方法 — 完整战斗动画
    window.lbModule._challenge = async (defId) => {
      const opp = opponents.find(o => o.user_id === defId);
      if (!opp || !myArena || !myArena.team || myArena.team.length < 3) {
        alert('请先设置你的防守阵容！');
        return;
      }

      // 构建双方队伍
      const myTeam = myArena.team.map(t => {
        const s = calcStats(t.charId);
        if (!s) return null;
        s.hp = s.maxHp;
        return s;
      }).filter(Boolean);

      const oppTeam = (opp.team || []).map(t => {
        const charId = t.charId || t;
        const lv = t.level || 1;
        const s = calcStats(charId, lv); // 用对方存储的等级
        if (!s) return null;
        s.hp = s.maxHp;
        return s;
      }).filter(Boolean);

      if (myTeam.length < 3 || oppTeam.length < 3) {
        alert('阵容数据异常，请重试');
        return;
      }

      // 创建全屏战斗弹窗
      const overlay = document.createElement('div');
      overlay.id = 'arena-battle';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:600;background:#1a1a2e;overflow-y:auto';

      // 渲染战斗场景
      overlay.innerHTML = `
        <div style="padding:10px;min-height:100%">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px">
            <span style="color:rgba(255,255,255,0.5);font-size:12px">⚔️ 擂台挑战 · ${opp.nickname}</span>
            <button id="arena-speed-btn" onclick="window._toggleArenaSpeed()" style="padding:6px 14px;border:none;border-radius:10px;background:${arenaSpeed===2?'#ffc107':'rgba(255,255,255,0.15)'};color:${arenaSpeed===2?'#333':'white'};font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">${arenaSpeed===2?'⏩ 2x':'▶️ 1x'}</button>
          </div>
          <!-- 敌方 -->
          <div style="display:flex;justify-content:center;gap:8px;margin-bottom:8px">
            ${oppTeam.map((u,i) => arenaUnitCard(u, 'opp', i)).join('')}
          </div>
          <div style="text-align:center;font-size:18px;font-weight:900;color:#ffc107;padding:4px">⚔ VS ⚔</div>
          <!-- 我方 -->
          <div style="display:flex;justify-content:center;gap:8px;margin-top:8px">
            ${myTeam.map((u,i) => arenaUnitCard(u, 'me', i)).join('')}
          </div>
          <!-- 日志 -->
          <div id="arena-log" style="margin-top:12px;background:rgba(0,0,0,0.5);border-radius:10px;padding:8px;max-height:140px;overflow-y:auto;backdrop-filter:blur(4px)"></div>
        </div>`;
      document.body.appendChild(overlay);

      // 运行战斗
      await wait(500);
      const result = await runArenaBattle(myTeam, oppTeam, overlay);

      // 记录结果
      await recordArenaResult(defId, opp.nickname, result.won ? 'attacker' : 'defender', {
        myAlive: result.myAlive, oppAlive: result.oppAlive
      });

      // 显示结果
      const logEl = overlay.querySelector('#arena-log');
      if (logEl) {
        logEl.innerHTML += `
          <div style="text-align:center;padding:16px 0">
            <div style="font-size:36px;margin-bottom:4px">${result.won ? '🎉' : '😤'}</div>
            <h3 style="color:white;font-size:20px">${result.won ? '挑战成功！' : '挑战失败…'}</h3>
            <p style="color:#ccc;font-size:13px;margin-top:4px">${result.won ? `击败了 ${opp.nickname}！` : `不敌 ${opp.nickname}，提升实力再来！`}</p>
            <button onclick="document.getElementById('arena-battle')?.remove();window.lbModule._tab('arena')" style="
              margin-top:12px;padding:10px 32px;border:none;border-radius:12px;
              background:white;color:#333;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">返回擂台</button>
          </div>`;
        logEl.scrollTop = logEl.scrollHeight;
      }

      if (result.won) {
        for(let i=0;i<20;i++){const e=document.createElement('div');e.className='confetti';e.style.left=Math.random()*100+'vw';e.style.background=['#ef5350','#4caf50','#4a90d9','#f5a623'][i%4];e.style.animationDelay=Math.random()*0.5+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),2000);}
      }
    };

  } catch(e) {
    el.innerHTML = `<div style="color:#ef5350;padding:20px;text-align:center">加载失败: ${e.message}</div>`;
  }
}

// ===== 战报 =====
async function renderLog(el) {
  el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px">加载中...</div>';
  try {
    const logs = await getArenaLog(20);
    const me = getUser();

    if (logs.length === 0) {
      el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px">暂无战报</div>';
      return;
    }

    el.innerHTML = logs.map(log => {
      const isAttacker = log.attacker_id === me?.id;
      const won = (isAttacker && log.winner === 'attacker') || (!isAttacker && log.winner === 'defender');
      const time = new Date(log.created_at).toLocaleString('zh-CN', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' });

      return `<div style="display:flex;align-items:center;gap:8px;padding:8px;background:${won?'#e8f5e9':'#ffebee'};border-radius:8px;margin-bottom:4px">
        <span style="font-size:20px">${won ? '🎉' : '😤'}</span>
        <div style="flex:1;font-size:12px">
          <span style="font-weight:700">${log.attacker_name}</span>
          <span style="color:var(--text-light)"> ⚔️ </span>
          <span style="font-weight:700">${log.defender_name}</span>
          <div style="font-size:10px;color:var(--text-light)">${time}</div>
        </div>
        <span style="font-size:12px;font-weight:700;color:${won?'#4caf50':'#ef5350'}">${won?'胜':'负'}</span>
      </div>`;
    }).join('');
  } catch(e) {
    el.innerHTML = `<div style="color:#ef5350;padding:20px;text-align:center">加载失败: ${e.message}</div>`;
  }
}

// ===== 擂台战斗引擎 =====
let arenaSpeed = parseInt(localStorage.getItem('battle_speed')) || 1;

function toggleArenaSpeed() {
  arenaSpeed = arenaSpeed === 1 ? 2 : 1;
  localStorage.setItem('battle_speed', arenaSpeed);
  const btn = document.getElementById('arena-speed-btn');
  if (btn) {
    btn.textContent = arenaSpeed === 2 ? '⏩ 2x' : '▶️ 1x';
    btn.style.background = arenaSpeed === 2 ? '#ffc107' : 'rgba(255,255,255,0.15)';
    btn.style.color = arenaSpeed === 2 ? '#333' : 'white';
  }
}

window._toggleArenaSpeed = toggleArenaSpeed;

function wait(ms) { return new Promise(r => setTimeout(r, Math.round(ms / arenaSpeed))); }

function arenaUnitCard(u, side, idx) {
  const hpPct = Math.max(0, u.hp / u.maxHp * 100);
  const barColor = hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#ef5350';
  const rb = u.rarity === 'legend' ? '#ffd700' : u.rarity === 'rare' ? '#7c4dff' : (side==='me'?'#4caf50':'#ef5350');

  return `<div id="au-${side}-${idx}" style="width:30%;max-width:100px;text-align:center;transition:all 0.3s">
    <div style="border-radius:10px;overflow:hidden;border:2px solid ${rb};background:rgba(0,0,0,0.3);position:relative">
      <img src="images/cardart/${u.id}.webp" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block" onerror="this.remove()">
      <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.8));padding:12px 4px 4px">
        <div style="font-size:11px;font-weight:700;color:white">${u.name}</div>
      </div>
    </div>
    <div style="margin-top:3px;background:rgba(0,0,0,0.4);border-radius:3px;height:6px;overflow:hidden">
      <div id="ahp-${side}-${idx}" style="width:${hpPct}%;height:100%;background:${barColor};transition:width 0.4s;border-radius:3px"></div>
    </div>
    <div style="font-size:8px;color:#aaa;margin-top:1px"><span id="ahptxt-${side}-${idx}">${u.hp}</span>/${u.maxHp}</div>
  </div>`;
}

function updateArenaUnit(u, side, idx) {
  const hpPct = Math.max(0, u.hp / u.maxHp * 100);
  const barColor = hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#ef5350';
  const bar = document.getElementById(`ahp-${side}-${idx}`);
  if (bar) { bar.style.width = hpPct + '%'; bar.style.background = barColor; }
  const txt = document.getElementById(`ahptxt-${side}-${idx}`);
  if (txt) txt.textContent = Math.max(0, u.hp);
  const card = document.getElementById(`au-${side}-${idx}`);
  if (card && u.hp <= 0) { card.style.opacity = '0.3'; card.style.filter = 'grayscale(1)'; }
}

function arenaLog(html) {
  const el = document.getElementById('arena-log'); if (!el) return;
  const d = document.createElement('div');
  d.style.cssText = 'font-size:11px;color:#eee;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.08)';
  d.innerHTML = html;
  el.appendChild(d);
  el.scrollTop = el.scrollHeight;
}

async function runArenaBattle(myTeam, oppTeam) {
  const all = [
    ...myTeam.map((u,i) => ({ ...u, side:'me', idx:i })),
    ...oppTeam.map((u,i) => ({ ...u, side:'opp', idx:i })),
  ];

  let roundNum = 0;
  while (roundNum < 12) {
    roundNum++;
    arenaLog(`<span style="color:#ffc107;font-weight:700">── 第${roundNum}回合 ──</span>`);

    const alive = all.filter(u => u.hp > 0);
    alive.sort((a, b) => (b.spd + Math.random() * 20) - (a.spd + Math.random() * 20));

    for (const atk of alive) {
      if (atk.hp <= 0) continue;
      const enemies = all.filter(u => u.side !== atk.side && u.hp > 0);
      if (enemies.length === 0) break;
      const def = enemies[Math.floor(Math.random() * enemies.length)];

      const useInt = atk.int > atk.atk ? Math.random() < 0.7 : Math.random() < 0.3;
      await arenaAttack(atk, def, useInt);
      await wait(350);

      if (all.filter(u => u.side === 'me' && u.hp > 0).length === 0) break;
      if (all.filter(u => u.side === 'opp' && u.hp > 0).length === 0) break;
    }

    const meAlive = all.filter(u => u.side === 'me' && u.hp > 0);
    const oppAlive = all.filter(u => u.side === 'opp' && u.hp > 0);
    if (meAlive.length === 0 || oppAlive.length === 0) break;
    await wait(200);
  }

  const meAlive = all.filter(u => u.side === 'me' && u.hp > 0);
  const oppAlive = all.filter(u => u.side === 'opp' && u.hp > 0);
  const won = meAlive.length > oppAlive.length ||
    (meAlive.length === oppAlive.length && meAlive.reduce((s,u)=>s+u.hp,0) > oppAlive.reduce((s,u)=>s+u.hp,0));

  return { won, myAlive: meAlive.length, oppAlive: oppAlive.length };
}

async function arenaAttack(atk, def, useInt) {
  const an = `<span style="color:${atk.side==='me'?'#81c784':'#ef9a9a'}">${atk.name}</span>`;
  const dn = `<span style="color:${def.side==='me'?'#81c784':'#ef9a9a'}">${def.name}</span>`;
  const icon = useInt ? '📖' : '⚔️';
  const word = useInt ? '施计' : '出击';

  const ac = document.getElementById(`au-${atk.side}-${atk.idx}`);
  if (ac) { ac.style.filter = 'brightness(1.4)'; ac.style.transform = 'scale(1.05)'; }
  await wait(150);
  if (ac) { ac.style.filter = ''; ac.style.transform = ''; }

  if (Math.random() * 100 < def.dodge) {
    arenaLog(`${an} ${icon}${word} ${dn} — <span style="color:#64b5f6">闪避！</span>`);
    const dc = document.getElementById(`au-${def.side}-${def.idx}`);
    if (dc) { dc.style.transform = 'translateX(8px)'; setTimeout(() => dc.style.transform = '', 200); }
    return;
  }

  let dmg;
  if (useInt) dmg = Math.max(5, Math.round((atk.int - def.def * 0.5) * (0.8 + Math.random() * 0.5)));
  else dmg = Math.max(3, Math.round((atk.atk - def.def * 0.7) * (0.85 + Math.random() * 0.35)));

  let crit = false;
  if (Math.random() * 100 < atk.crit) { crit = true; dmg = Math.round(dmg * 1.8); }

  def.hp = Math.max(0, def.hp - dmg);
  updateArenaUnit(def, def.side, def.idx);

  const critTag = crit ? ' <span style="color:#ff7043">💥暴击!</span>' : '';
  arenaLog(`${an} ${icon}${word} ${dn}，<b style="color:#ffab91">${dmg}</b>伤害${critTag}`);

  const dc = document.getElementById(`au-${def.side}-${def.idx}`);
  if (dc) { dc.style.transform = crit ? 'scale(0.85)' : 'scale(0.92)'; setTimeout(() => dc.style.transform = '', 200); }
  if (crit && window.effects) window.effects.screenShake(4, 200);

  if (def.hp <= 0) arenaLog(`${dn} <span style="color:#ef5350">阵亡！</span> 💀`);

  if (def.hp > 0 && Math.random() < 0.15 && !useInt) {
    await wait(250);
    const cd = Math.max(2, Math.round((def.atk * 0.4 - atk.def * 0.3) * (0.7 + Math.random() * 0.3)));
    atk.hp = Math.max(0, atk.hp - cd);
    updateArenaUnit(atk, atk.side, atk.idx);
    arenaLog(`${dn} <span style="color:#ce93d8">↩反击!</span> ${an} <b>${cd}</b>伤害`);
    if (atk.hp <= 0) arenaLog(`${an} <span style="color:#ef5350">阵亡！</span> 💀`);
  }
}
