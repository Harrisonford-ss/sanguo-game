// 三国志探险 - 战斗系统（回合制RPG风格）
// HP制，物理攻击+计谋攻击，暴击/闪避/反击，稀有度差距大

import { gameState } from './state.js';
import { characters, getCharacter } from '../data/characters.js';
import { stages, getStage } from '../data/stages.js';
import { avatarHTML } from './avatars.js';

let selectedTeam = [null, null, null];
let currentStageId = null;
let currentDifficulty = 'normal'; // 'normal'|'elite'|'legend'

const DIFF_CONFIG = {
  normal: { label: '普通', icon: '⚔️',  npcMult: 1.0, color: '#4caf50' },
  elite:  { label: '精英', icon: '🔥',  npcMult: 1.6, color: '#ff9800' },
  legend: { label: '传说', icon: '👑',  npcMult: 2.4, color: '#f5a623' },
};

// ===== 战斗属性计算 =====
// 设计目标：
// - 传说比普通强约40%（不是碾压，普通卡有一战之力）
// - 3v3战斗约6-8回合结束
// - 物理/计谋伤害各一刀约打掉1/4~1/3血
// - 防御能挡掉约20-30%伤害
// - 等级差距明显但不夸张（Lv5比Lv1强约50%）

const RARITY_MULT = { common: 1, rare: 1.15, legend: 1.35 };
const RARITY_HP = { common: 0, rare: 30, legend: 80 }; // 额外固定HP

export function calcStats(charId, overrideLv = null) {
  const c = getCharacter(charId);
  if (!c) return null;
  const lv = overrideLv || gameState.getCardLevel(charId) || 1;
  const rm = RARITY_MULT[c.rarity] || 1;
  const lvMult = 1 + (lv - 1) * 0.20; // 每级+20%，Lv5=1.8倍
  const extraHp = RARITY_HP[c.rarity] || 0;

  const wu = c.stats.武力, zhi = c.stats.智力, mei = c.stats.魅力;

  // HP: 基础300 + 三围，缩小HP池让战斗更快
  const baseHp = 300 + wu * 1.2 + zhi * 0.8 + mei * 0.8 + extraHp;
  // ATK/INT: 主属性直接用（不缩放），保证伤害够高
  const baseAtk = wu;
  const baseInt = zhi;
  // DEF: 偏低，只挡20%左右伤害
  const baseDef = (wu * 0.15 + zhi * 0.08 + mei * 0.1);
  // SPD: 差距小
  const baseSpd = 30 + zhi * 0.2 + wu * 0.12 + mei * 0.08;

  return {
    id: c.id, name: c.name, rarity: c.rarity,
    maxHp: Math.round(baseHp * rm * lvMult),
    atk: Math.round(baseAtk * rm * lvMult),
    int: Math.round(baseInt * rm * lvMult),
    def: Math.round(baseDef * rm * lvMult),
    spd: Math.round(baseSpd * rm * lvMult),
    crit: Math.min(8 + zhi * 0.12 + (lv - 1) * 1.5, 35),  // 暴击率%
    dodge: Math.min(5 + mei * 0.08 + (lv - 1) * 0.8, 20),  // 闪避率%
  };
}

export function initBattle() {
  window.battleModule = { refresh, startFight, startStageBattle };
}

export function startStageBattle(stageId, difficulty = 'normal') {
  currentStageId = stageId;
  currentDifficulty = difficulty;
  if (window.app?.navigate) window.app.navigate('battle');
  setTimeout(() => {
    selectedTeam = [null, null, null];
    const stage = getStage(stageId);
    const dc = DIFF_CONFIG[difficulty];
    const header = document.querySelector('#screen-battle .screen-header h2');
    if (header && stage) header.textContent = `第${stage.id}关 · ${stage.name}`;
    showSelectScreen();
  }, 50);
}

function refresh() {
  // 只渲染选将界面，不调 navigate（避免循环）
  if (!currentStageId) {
    currentStageId = Math.min(gameState.currentStage, 12);
  }
  const stage = getStage(currentStageId);
  const header = document.querySelector('#screen-battle .screen-header h2');
  if (header && stage) header.textContent = `第${stage.id}关 · ${stage.name}`;
  selectedTeam = [null, null, null];
  showSelectScreen();
}

// ===== 选将界面 =====
function showSelectScreen() {
  const container = document.getElementById('battle-container');
  if (!container) return;

  const ownedIds = Object.keys(gameState.ownedCards);
  const stage = getStage(currentStageId);

  // NPC展示（用全身图）
  const npcCards = stage ? stage.npcTeam.map(id => {
    const c = getCharacter(id);
    if (!c) return '';
    return `<div style="text-align:center">
      ${avatarHTML(c.id, 56)}
      <div style="font-size:12px;font-weight:700;margin-top:4px">${c.name}</div>
    </div>`;
  }).join('') : '';

  container.innerHTML = `
    <div style="padding:12px">
      <!-- 关卡信息 -->
      ${stage ? `<div style="position:relative;border-radius:14px;overflow:hidden;margin-bottom:14px;box-shadow:var(--shadow)">
        <img src="${stage.sceneImg}" style="width:100%;height:100px;object-fit:cover;display:block" onerror="this.style.display='none'">
        <div style="position:absolute;inset:0;background:linear-gradient(transparent 30%,rgba(0,0,0,0.7));display:flex;align-items:flex-end;padding:10px 14px">
          <div style="color:white;flex:1">
            <div style="font-size:16px;font-weight:800">${stage.name}</div>
            <div style="font-size:12px;opacity:0.8">${stage.description} · 难度${'🔥'.repeat(stage.difficulty)}</div>
          </div>
          <div style="background:${DIFF_CONFIG[currentDifficulty].color};color:white;font-size:11px;font-weight:800;padding:3px 10px;border-radius:12px;white-space:nowrap">
            ${DIFF_CONFIG[currentDifficulty].icon} ${DIFF_CONFIG[currentDifficulty].label}
          </div>
        </div>
      </div>` : ''}

      <!-- 敌方武将 -->
      <div style="margin-bottom:14px">
        <div style="font-size:12px;color:var(--text-light);text-align:center;margin-bottom:8px">🔴 敌方阵容</div>
        <div style="display:flex;justify-content:center;gap:10px">${npcCards}</div>
      </div>

      <!-- 分隔 -->
      <div style="text-align:center;color:var(--text-light);font-size:18px;font-weight:900;margin:10px 0">⚔️ VS ⚔️</div>

      <!-- 我方选将 -->
      <div style="margin-bottom:10px">
        <div style="font-size:12px;color:var(--text-light);text-align:center;margin-bottom:8px">🟢 选择你的武将（3名）</div>
        <div id="b-slots" style="display:flex;gap:10px;justify-content:center;margin-bottom:14px"></div>
      </div>

      <!-- 可选武将 -->
      <div id="b-picks" style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-bottom:14px"></div>

      <button id="b-go" class="btn btn-primary" style="width:100%;font-size:16px;padding:14px" disabled onclick="window.battleModule._startFight()">还需选择武将</button>
    </div>`;

  renderSlots();
  renderPicks(ownedIds);

  window.battleModule._addTo = (id) => {
    const idx = selectedTeam.indexOf(id);
    if (idx !== -1) selectedTeam[idx] = null;
    else { const e = selectedTeam.indexOf(null); if (e !== -1) selectedTeam[e] = id; }
    renderSlots(); renderPicks(ownedIds); updateGoBtn();
  };
  window.battleModule._rmFrom = (i) => {
    selectedTeam[i] = null; renderSlots(); renderPicks(ownedIds); updateGoBtn();
  };
  window.battleModule._startFight = () => {
    if (selectedTeam.filter(Boolean).length === 3) startFight();
  };
}

function renderSlots() {
  const el = document.getElementById('b-slots'); if (!el) return;
  el.innerHTML = selectedTeam.map((id, i) => {
    if (id) {
      const c = getCharacter(id);
      const rb = c?.rarity === 'legend' ? '#ffd700' : c?.rarity === 'rare' ? '#7c4dff' : '#4caf50';
      return `<div style="text-align:center;cursor:pointer;padding:6px 8px;border:2px solid ${rb};border-radius:12px;background:${rb}10" onclick="window.battleModule._rmFrom(${i})">
        ${avatarHTML(id, 56)}
        <div style="font-size:12px;font-weight:700;margin-top:2px">${c?.name||''}</div>
        <div style="font-size:9px;color:var(--text-light)">点击移除</div>
      </div>`;
    }
    return `<div style="width:76px;height:90px;border:2.5px dashed #ddd;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:28px;background:#fafafa">+</div>`;
  }).join('');
}

function renderPicks(ids) {
  const el = document.getElementById('b-picks'); if (!el) return;
  // 按战力排序
  const sorted = ids
    .map(id => { const s = calcStats(id); return { id, power: s ? (s.atk+s.int+s.def+Math.round(s.maxHp/10)) : 0 }; })
    .sort((a,b) => b.power - a.power)
    .map(x => x.id);

  el.innerHTML = sorted.map(id => {
    const c = getCharacter(id); if (!c) return '';
    const sel = selectedTeam.includes(id);
    const lv = gameState.getCardLevel(id);
    const rb = c.rarity==='legend'?'#ffd700':c.rarity==='rare'?'#7c4dff':'#bbb';
    return `<div style="text-align:center;padding:4px;border-radius:8px;cursor:pointer;
      border:2px solid ${sel?'#4caf50':rb};background:${sel?'#4caf5010':'#fff'};transition:all 0.15s"
      onclick="window.battleModule._addTo('${id}')">
      <div style="display:flex;align-items:center;justify-content:center;padding:3px 0">
        ${avatarHTML(id, 48)}
      </div>
      <div style="font-size:10px;font-weight:700">${c.name}</div>
      <div style="font-size:9px;color:${rb};font-weight:600">Lv${lv}</div>
    </div>`;
  }).join('');
}

function updateGoBtn() {
  const btn = document.getElementById('b-go'); if (!btn) return;
  const n = selectedTeam.filter(Boolean).length;
  btn.disabled = n < 3;
  btn.textContent = n < 3 ? `还需选择 ${3-n} 名武将` : '⚔️ 出战！';
}

// ===== 战斗主流程 =====
async function startFight() {
  const stage = getStage(currentStageId);
  if (!stage) return;

  // 扣除体力
  if (!gameState.spendStamina()) return;
  window.staminaModule?.refresh();

  const myTeam = selectedTeam.map(id => ({ ...calcStats(id), hp: 0 }));
  myTeam.forEach(u => u.hp = u.maxHp);

  // NPC等级 + 难度倍率加成
  const npcLv = Math.min(5, Math.ceil(stage.difficulty * 1.0));
  const npcMult = DIFF_CONFIG[currentDifficulty].npcMult;
  const npcTeam = stage.npcTeam.map(id => {
    const s = calcStats(id, npcLv);
    if (!s) return null;
    // 精英/传说对NPC全属性加成
    if (npcMult !== 1) {
      s.atk  = Math.round(s.atk  * npcMult);
      s.def  = Math.round(s.def  * npcMult);
      s.int  = Math.round(s.int  * npcMult);
      s.maxHp= Math.round(s.maxHp* npcMult);
    }
    s.hp = s.maxHp;
    return s;
  }).filter(Boolean);

  renderBattleScene(myTeam, npcTeam, stage);
  await delay(500);
  await runBattle(myTeam, npcTeam, stage);
}

// ===== 战斗场景渲染（全屏大画面）=====
function renderBattleScene(my, npc, stage) {
  const container = document.getElementById('battle-container');
  container.innerHTML = `
    <div style="position:relative;min-height:calc(100vh - 130px);background:#1a1a2e;overflow:hidden">
      <!-- 场景图背景 -->
      <img src="${stage.sceneImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.3;filter:blur(1px)" onerror="this.remove()">
      <!-- 暗角 -->
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.6) 100%)"></div>

      <div style="position:relative;z-index:1;padding:10px 6px;height:100%;display:flex;flex-direction:column">
        <!-- 关卡标题 + 速度按钮 -->
        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px">
          <span style="color:rgba(255,255,255,0.6);font-size:11px">${stage.name} · 难度${'🔥'.repeat(stage.difficulty)}</span>
          <button id="speed-btn" onclick="window._toggleSpeed()" style="padding:6px 14px;border:none;border-radius:10px;background:${battleSpeed===2?'#ffc107':'rgba(255,255,255,0.15)'};color:${battleSpeed===2?'#333':'white'};font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">${battleSpeed===2?'⏩ 2x':'▶️ 1x'}</button>
        </div>

        <!-- 敌方（上方）-->
        <div style="display:flex;justify-content:space-around;align-items:flex-end;padding:0 4px">
          ${npc.map((u,i) => unitCard(u, 'npc', i)).join('')}
        </div>

        <!-- 中间对战区域 -->
        <div id="b-clash" style="flex:0;text-align:center;padding:6px 0;position:relative">
          <div style="font-size:20px;font-weight:900;color:#ffc107;text-shadow:0 0 20px rgba(255,193,7,0.5);letter-spacing:4px">⚔ 对 战 ⚔</div>
        </div>

        <!-- 我方（下方）-->
        <div style="display:flex;justify-content:space-around;align-items:flex-start;padding:0 4px">
          ${my.map((u,i) => unitCard(u, 'my', i)).join('')}
        </div>

        <!-- 战斗日志 -->
        <div id="b-log" style="margin-top:auto;background:rgba(0,0,0,0.55);border-radius:10px;padding:6px 8px;max-height:100px;overflow-y:auto;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)"></div>
      </div>
    </div>`;
}

function unitCard(u, side, idx) {
  const hpPct = Math.max(0, u.hp / u.maxHp * 100);
  const dead = u.hp <= 0;
  const barColor = hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#ef5350';
  const sideColor = side === 'my' ? '#4caf50' : '#ef5350';
  const rarityGlow = u.rarity === 'legend' ? 'box-shadow:0 0 20px rgba(255,215,0,0.5),0 0 40px rgba(255,215,0,0.2);' :
                     u.rarity === 'rare' ? 'box-shadow:0 0 15px rgba(124,77,255,0.4),0 0 30px rgba(124,77,255,0.15);' : 'box-shadow:0 2px 8px rgba(0,0,0,0.2);';
  const rarityBorder = u.rarity === 'legend' ? '#ffd700' : u.rarity === 'rare' ? '#7c4dff' : sideColor;
  const rarityLabel = u.rarity === 'legend' ? '传说' : u.rarity === 'rare' ? '稀有' : '';

  return `<div id="unit-${side}-${idx}" style="width:30%;max-width:110px;text-align:center;
    ${dead?'opacity:0.3;filter:grayscale(1);':''}transition:all 0.3s;position:relative">

    <!-- 全身卡牌图 -->
    <div style="border-radius:10px;overflow:hidden;border:2px solid ${rarityBorder};${rarityGlow}
      background:linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.5));position:relative">
      <img src="images/cardart/${u.id}.webp" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block"
           onerror="this.style.display='none'">
      <!-- 稀有度标志 -->
      ${u.rarity==='legend'?`<div style="position:absolute;top:0;left:0;right:0;background:linear-gradient(90deg,#ffd70088,transparent);padding:2px 6px;font-size:9px;color:#fff;font-weight:800;text-shadow:0 1px 2px rgba(0,0,0,0.5)">👑 传说</div>`:''}
      ${u.rarity==='rare'?`<div style="position:absolute;top:0;left:0;right:0;background:linear-gradient(90deg,#7c4dff88,transparent);padding:2px 6px;font-size:9px;color:#fff;font-weight:800;text-shadow:0 1px 2px rgba(0,0,0,0.5)">💎 稀有</div>`:''}
      <!-- 底部名字条 -->
      <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.8));
        padding:16px 4px 4px;text-align:center">
        <div style="font-size:12px;font-weight:800;color:white;text-shadow:0 1px 3px rgba(0,0,0,0.8)">${u.name}</div>
      </div>
    </div>

    <!-- HP条 -->
    <div style="margin-top:4px;background:rgba(0,0,0,0.5);border-radius:4px;height:8px;overflow:hidden;border:1px solid ${sideColor}55">
      <div id="hp-${side}-${idx}" style="width:${hpPct}%;height:100%;background:linear-gradient(90deg,${barColor},${barColor}cc);
        transition:width 0.5s ease;border-radius:3px"></div>
    </div>
    <div style="font-size:9px;color:#aaa;margin-top:2px">
      <span style="color:${barColor};font-weight:700" id="hptxt-${side}-${idx}">${Math.max(0,u.hp)}</span>
      <span>/${u.maxHp}</span>
    </div>

    <!-- 属性小标签 -->
    <div style="display:flex;justify-content:center;gap:3px;margin-top:2px">
      <span style="font-size:8px;color:#ef9a9a">⚔${u.atk}</span>
      <span style="font-size:8px;color:#90caf9">📖${u.int}</span>
      <span style="font-size:8px;color:#a5d6a7">🛡${u.def}</span>
    </div>
  </div>`;
}

function updateUnit(u, side, idx) {
  const hpPct = Math.max(0, u.hp / u.maxHp * 100);
  const barColor = hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#ef5350';

  const hpBar = document.getElementById(`hp-${side}-${idx}`);
  if (hpBar) { hpBar.style.width = hpPct + '%'; hpBar.style.background = barColor; }

  const hpTxt = document.getElementById(`hptxt-${side}-${idx}`);
  if (hpTxt) hpTxt.textContent = Math.max(0, u.hp);

  const card = document.getElementById(`unit-${side}-${idx}`);
  if (card && u.hp <= 0) { card.style.opacity = '0.35'; card.style.filter = 'grayscale(1)'; }
}

// ===== 战斗日志 =====
function battleLog(html) {
  const el = document.getElementById('b-log'); if (!el) return;
  const entry = document.createElement('div');
  entry.style.cssText = 'font-size:11px;color:#eee;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.1);animation:fadeIn 0.3s';
  entry.innerHTML = html;
  el.appendChild(entry);
  el.scrollTop = el.scrollHeight;
}

// ===== 伤害弹出数字 =====
function showDamageNumber(side, idx, text, color) {
  const card = document.getElementById(`unit-${side}-${idx}`);
  if (!card) return;
  const num = document.createElement('div');
  num.style.cssText = `position:absolute;left:50%;top:20%;transform:translateX(-50%);
    font-size:18px;font-weight:900;color:${color};text-shadow:0 1px 3px rgba(0,0,0,0.5);
    pointer-events:none;z-index:20;animation:dmgFloat 1s ease-out forwards`;
  num.textContent = text;
  card.style.position = 'relative';
  card.appendChild(num);
  setTimeout(() => num.remove(), 1000);
}

// ===== 回合制战斗引擎 =====
async function runBattle(my, npc, stage) {
  const allUnits = [
    ...my.map((u, i) => ({ ...u, side: 'my', idx: i })),
    ...npc.map((u, i) => ({ ...u, side: 'npc', idx: i })),
  ];

  let roundNum = 0;
  const maxRounds = 15;

  while (roundNum < maxRounds) {
    roundNum++;
    battleLog(`<span style="color:#ffc107;font-weight:700">── 第${roundNum}回合 ──</span>`);

    // 按速度排序（加随机扰动增加随机性）
    const alive = allUnits.filter(u => u.hp > 0);
    alive.sort((a, b) => (b.spd + Math.random() * 20) - (a.spd + Math.random() * 20));

    for (const attacker of alive) {
      if (attacker.hp <= 0) continue;

      // 选择目标：对面活着的随机一个
      const enemies = allUnits.filter(u => u.side !== attacker.side && u.hp > 0);
      if (enemies.length === 0) break;
      const target = enemies[Math.floor(Math.random() * enemies.length)];

      // 选择攻击方式：物理 or 计谋（根据属性高低+随机）
      const useInt = (attacker.int > attacker.atk) ? Math.random() < 0.7 : Math.random() < 0.3;

      await executeAttack(attacker, target, useInt, allUnits);
      await delay(400);

      // 检查是否一方全灭
      if (allUnits.filter(u => u.side === 'my' && u.hp > 0).length === 0) break;
      if (allUnits.filter(u => u.side === 'npc' && u.hp > 0).length === 0) break;
    }

    // 结束检查
    const myAlive = allUnits.filter(u => u.side === 'my' && u.hp > 0);
    const npcAlive = allUnits.filter(u => u.side === 'npc' && u.hp > 0);
    if (myAlive.length === 0 || npcAlive.length === 0) break;

    await delay(300);
  }

  // 判定结果
  const myAlive = allUnits.filter(u => u.side === 'my' && u.hp > 0);
  const npcAlive = allUnits.filter(u => u.side === 'npc' && u.hp > 0);
  const won = myAlive.length > npcAlive.length || (myAlive.length === npcAlive.length &&
    myAlive.reduce((s,u) => s+u.hp, 0) > npcAlive.reduce((s,u) => s+u.hp, 0));

  await delay(500);
  showResult(won, myAlive.length, stage, currentDifficulty);
}

async function executeAttack(atk, def, useInt, allUnits) {
  const atkName = `<span style="color:${atk.side==='my'?'#81c784':'#ef9a9a'}">${atk.name}</span>`;
  const defName = `<span style="color:${def.side==='my'?'#81c784':'#ef9a9a'}">${def.name}</span>`;

  // 攻击者高亮闪烁
  const atkCard = document.getElementById(`unit-${atk.side}-${atk.idx}`);
  if (atkCard) { atkCard.style.filter = 'brightness(1.4)'; atkCard.style.transform = 'scale(1.05)'; }
  await delay(200);

  // 显示中间区域攻击动画
  const clash = document.getElementById('b-clash');
  const actionIcon = useInt ? '📖' : '⚔️';
  const actionWord = useInt ? '施计' : '出击';
  if (clash) clash.innerHTML = `<div style="font-size:16px;color:white;font-weight:700;animation:fadeIn 0.3s">
    ${atk.name} ${actionIcon} ${actionWord}！→ ${def.name}
  </div>`;

  // 恢复攻击者
  if (atkCard) { atkCard.style.filter = ''; atkCard.style.transform = ''; }

  // 闪避判定
  if (Math.random() * 100 < def.dodge) {
    battleLog(`${atkName} ${actionWord} ${defName}，${defName} <span style="color:#64b5f6">闪避！</span>`);
    showDamageNumber(def.side, def.idx, '闪避！', '#64b5f6');
    const defCard = document.getElementById(`unit-${def.side}-${def.idx}`);
    if (defCard) {
      defCard.style.transform = 'translateX(15px)';
      defCard.style.opacity = '0.5';
      setTimeout(() => { defCard.style.transform = ''; defCard.style.opacity = ''; }, 300);
    }
    if (clash) clash.innerHTML = `<div style="font-size:14px;color:#64b5f6;animation:fadeIn 0.2s">💨 ${def.name} 闪避！</div>`;
    return;
  }

  // 伤害公式：攻击力 - 防御*减伤系数 + 随机波动±20%
  let dmg;
  if (useInt) {
    // 计谋攻击：INT vs DEF*0.4，波动大，上限高
    const base = atk.int * 1.2 - def.def * 0.4;
    dmg = Math.max(8, Math.round(base * (0.85 + Math.random() * 0.35)));
  } else {
    // 物理攻击：ATK vs DEF*0.6，稳定
    const base = atk.atk * 1.1 - def.def * 0.6;
    dmg = Math.max(5, Math.round(base * (0.9 + Math.random() * 0.25)));
  }

  // 暴击判定（1.6倍，不是1.8，避免一刀秒）
  let isCrit = false;
  if (Math.random() * 100 < atk.crit) {
    isCrit = true;
    dmg = Math.round(dmg * 1.6);
  }

  // 扣血
  def.hp = Math.max(0, def.hp - dmg);
  updateUnit(def, def.side, def.idx);

  // 日志
  const critTag = isCrit ? ' <span style="color:#ff7043;font-weight:700">💥暴击!</span>' : '';
  battleLog(`${atkName} ${actionIcon}${actionWord} ${defName}，造成 <b style="color:#ffab91">${dmg}</b> 伤害${critTag}`);

  // 受击动画：卡牌震动 + 红色闪烁
  const defCard = document.getElementById(`unit-${def.side}-${def.idx}`);
  if (defCard) {
    defCard.style.transform = isCrit ? 'scale(0.85) rotate(-3deg)' : 'scale(0.92)';
    defCard.style.filter = 'brightness(1.5) saturate(0.5)';
    setTimeout(() => { defCard.style.transform = ''; defCard.style.filter = def.hp <= 0 ? 'grayscale(1)' : ''; }, 250);
  }

  // 中间显示伤害
  if (clash) {
    const critText = isCrit ? '💥暴击！' : '';
    const color = isCrit ? '#ff7043' : '#ffc107';
    clash.innerHTML = `<div style="animation:fadeIn 0.2s">
      <span style="font-size:${isCrit?'28px':'22px'};font-weight:900;color:${color};text-shadow:0 0 15px ${color}55">${critText}-${dmg}</span>
    </div>`;
  }

  // 伤害浮动数字
  showDamageNumber(def.side, def.idx, isCrit ? `💥${dmg}` : `-${dmg}`, isCrit ? '#ff7043' : '#fff');

  // 震屏（暴击时更强）
  if (window.effects) {
    if (isCrit) window.effects.screenShake(6, 300);
    else window.effects.screenShake(2, 150);
  }

  // 阵亡
  if (def.hp <= 0) {
    battleLog(`${defName} <span style="color:#ef5350">阵亡！</span> 💀`);
    if (clash) clash.innerHTML = `<div style="font-size:18px;color:#ef5350;animation:fadeIn 0.2s">💀 ${def.name} 阵亡</div>`;
  }

  // 反击（20%概率，仅物理且存活）
  if (def.hp > 0 && Math.random() < 0.2 && !useInt) {
    await delay(400);
    if (clash) clash.innerHTML = `<div style="font-size:14px;color:#ce93d8;animation:fadeIn 0.2s">↩ ${def.name} 反击！</div>`;
    const counterDmg = Math.max(2, Math.round((def.atk * 0.5 - atk.def * 0.3) * (0.7 + Math.random() * 0.3)));
    atk.hp = Math.max(0, atk.hp - counterDmg);
    updateUnit(atk, atk.side, atk.idx);
    battleLog(`${defName} <span style="color:#ce93d8">↩反击！</span> 对 ${atkName} 造成 <b>${counterDmg}</b> 伤害`);
    showDamageNumber(atk.side, atk.idx, `-${counterDmg}`, '#ce93d8');

    if (atkCard) {
      atkCard.style.transform = 'scale(0.92)';
      setTimeout(() => { atkCard.style.transform = ''; atkCard.style.filter = atk.hp <= 0 ? 'grayscale(1)' : ''; }, 200);
    }
    if (atk.hp <= 0) battleLog(`${atkName} <span style="color:#ef5350">阵亡！</span> 💀`);
  }
}

// ===== 战斗结果 =====
function showResult(won, surviving, stage, difficulty = 'normal') {
  const dc = DIFF_CONFIG[difficulty];
  let reward = '';
  if (won) {
    const stars = surviving;
    const { starsGained, quizReward, clearCount } = gameState.completeStage(stage.id, stars, difficulty);
    const rewardNote = clearCount === 1 ? '<span style="font-size:11px;color:#aaa">（今日再通关奖励减半）</span>'
                     : clearCount >= 2  ? '<span style="font-size:11px;color:#aaa">（今日奖励已领完）</span>' : '';
    const rewardLine = quizReward > 0
      ? `<p style="color:var(--gold);font-weight:700;font-size:16px">+${quizReward} 🎫答题积分</p>${rewardNote}`
      : `<p style="color:#aaa;font-size:13px">今日积分奖励已结束</p>`;
    reward = `
      <div style="margin:8px 0">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
      <div style="display:inline-block;background:${dc.color};color:white;font-size:11px;font-weight:800;padding:2px 10px;border-radius:10px;margin-bottom:6px">${dc.icon} ${dc.label}</div>
      ${rewardLine}`;
    if (window.effects) window.effects.flashPulse('rgba(245,166,35,0.4)');
    // 关卡通关后同步到云端
    if (window.authModule?.syncToCloud) {
      window.authModule.syncToCloud().catch(() => {});
    }
    // 撒花
    for(let i=0;i<25;i++){const e=document.createElement('div');e.className='confetti';e.style.left=Math.random()*100+'vw';e.style.background=['#ef5350','#4caf50','#4a90d9','#f5a623'][i%4];e.style.animationDelay=Math.random()*0.5+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),2000);}
  }

  const logEl = document.getElementById('b-log');
  if (logEl) {
    logEl.innerHTML += `
      <div style="text-align:center;padding:16px 0">
        <div style="font-size:32px;margin-bottom:4px">${won ? '🎉' : '😤'}</div>
        <h3 style="color:white;font-size:20px;margin-bottom:8px">${won ? '胜利！' : '战败…'}</h3>
        ${reward}
        ${!won ? '<p style="color:#ccc;font-size:13px">升级武将再来挑战！</p>' : ''}
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px">
          ${won ? '<button class="btn btn-primary" onclick="window.app.navigate(\'quiz\')">去答题</button>' : ''}
          ${won && stages.find(s => s.id === stage.id + 1) ? `<button class="btn" style="background:linear-gradient(135deg,#4caf50,#388e3c);color:white;font-weight:700;border:none" onclick="window._goNextStage(${stage.id},'${difficulty}')">⚔️ 下一关</button>` : ''}
          <button class="btn" style="background:#fff;color:#333;font-weight:700;border:none" onclick="window.battleModule.startStageBattle(${stage.id},'${difficulty}')">🔄 再来</button>
          <button class="btn" style="background:#fff;color:#333;font-weight:700;border:none" onclick="window.app.navigate('map')">🏠 返回</button>
        </div>
      </div>`;
    logEl.scrollTop = logEl.scrollHeight;
  }
}

window._goNextStage = function(currentId, difficulty) {
  const next = stages.find(s => s.id === currentId + 1);
  if (!next) { window.app.navigate('map'); return; }
  // 检查下一关是否已解锁
  const totalStars = gameState.totalStars;
  if (totalStars >= next.unlockStars) {
    window.battleModule.startStageBattle(next.id, difficulty);
  } else {
    window.app.navigate('map');
  }
};

// ===== 速度控制 =====
let battleSpeed = parseInt(localStorage.getItem('battle_speed')) || 1;

export function toggleSpeed() {
  battleSpeed = battleSpeed === 1 ? 2 : 1;
  localStorage.setItem('battle_speed', battleSpeed);
  const btn = document.getElementById('speed-btn');
  if (btn) {
    btn.textContent = battleSpeed === 2 ? '⏩ 2x' : '▶️ 1x';
    btn.style.background = battleSpeed === 2 ? '#ffc107' : 'rgba(255,255,255,0.15)';
    btn.style.color = battleSpeed === 2 ? '#333' : 'white';
  }
}

window._toggleSpeed = toggleSpeed;

function delay(ms) { return new Promise(r => setTimeout(r, Math.round(ms / battleSpeed))); }
