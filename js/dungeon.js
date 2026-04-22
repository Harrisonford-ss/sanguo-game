// 三国志探险 - 乱世探险（无限层Roguelike）v47
// 探险内等级系统 + 每层BOSS + 宝箱陷阱合并为?格
// 无上限：层数越深难度越高，奖励也越丰厚，死亡才结算

import { gameState, calcCharPower } from './state.js';
import { characters, getCharacter } from '../data/characters.js';
import { quizzes } from '../data/quizzes.js';
import { avatarHTML } from './avatars.js';
import { calcStats } from './battle.js';
import { timelineQuizzes } from '../data/timeline.js';

// ===== 武将被动技能 =====
const PASSIVES = {
  // ===== 传说 =====
  caocao:     { name:'挟天子令', icon:'👑', desc:'战斗胜利后回血10%',              type:'post_win_heal',      value:0.10 },
  simayi:     { name:'深忍不发', icon:'🦊', desc:'HP低于40%时防御+50%',            type:'low_hp_def',         value:0.50 },
  zhugeliang: { name:'神机妙算', icon:'🪄', desc:'BOSS题答错仍减BOSS血量',          type:'quiz_no_fail',       value:0    },
  guanyu:     { name:'忠义先锋', icon:'⚔️', desc:'答题答对后的战斗必定先手',        type:'quiz_correct_first', value:0    },
  zhaoyun:    { name:'常山之龙', icon:'🐉', desc:'HP低于30%时防御翻倍',             type:'low_hp_def_double',  value:0.30 },
  zhouyu:     { name:'赤壁之谋', icon:'🎶', desc:'战斗第3轮起伤害+35%',             type:'late_game_dmg',      value:0.35 },
  lvbu:       { name:'天下无双', icon:'⚡', desc:'物理伤害+40%',                    type:'phys_dmg_bonus',     value:0.40 },
  // ===== 稀有 =====
  guojia:     { name:'鬼才算策', icon:'🎯', desc:'每次答对题额外+5EXP',             type:'quiz_bonus_exp',     value:5    },
  zhangliao:  { name:'虎威先锋', icon:'🐯', desc:'每次战斗必定先手攻击一轮',        type:'always_first',       value:0    },
  liubei:     { name:'仁德之主', icon:'🌟', desc:'进营地回血额外+20%',              type:'camp_heal_bonus',    value:0.20 },
  zhangfei:   { name:'万夫莫当', icon:'💪', desc:'每轮15%概率令敌方跳过攻击',       type:'stun_chance',        value:0.15 },
  huangzhong: { name:'老当益壮', icon:'🏹', desc:'战斗第一轮伤害+50%',              type:'first_round_dmg',    value:0.50 },
  machao:     { name:'锦马超威', icon:'🐴', desc:'物理伤害+25%',                    type:'phys_dmg_bonus',     value:0.25 },
  sunquan:    { name:'江东之主', icon:'🌊', desc:'商店所有物品便宜5金币',            type:'shop_discount',      value:5    },
  luxun:      { name:'以退为进', icon:'🔥', desc:'战斗第3轮起伤害+40%',             type:'late_game_dmg',      value:0.40 },
  lvmeng:     { name:'士别三日', icon:'📚', desc:'每次答对题回血15%',               type:'quiz_heal',          value:0.15 },
  jiaxu:      { name:'毒士算计', icon:'☠️', desc:'每次战斗胜利额外+8金币',          type:'post_win_coin',      value:8    },
  jiangwei:   { name:'北伐之志', icon:'🔱', desc:'HP低于50%时攻击+25%',             type:'berserk',            value:0.25 },
  sunce:      { name:'小霸王威', icon:'🦁', desc:'每轮25%概率连击（额外造成一次伤害）', type:'double_strike',  value:0.25 },
  xiahoudun:  { name:'拔矢啖睛', icon:'👁️', desc:'HP低于50%时攻击+30%',             type:'berserk',            value:0.30 },
  yuanshao:   { name:'袁氏底蕴', icon:'💎', desc:'每场战斗开始临时HP+15%',          type:'battle_hp_bonus',    value:0.15 },
  dongzhuo:   { name:'横征暴敛', icon:'💰', desc:'每层开始获得5金币',               type:'floor_gold',         value:5    },
};

function getPassive() {
  const ch = heroId ? characters.find(c => c.id === heroId) : null;
  if (!ch || ch.rarity === 'common') return null;
  return PASSIVES[heroId] || null;
}

const GRID = 6;
// 无MAX_FLOOR限制，无限层
const FOG = 0, VISIBLE = 1, EXPLORED = 2;

// 难度系数：层数越深增幅越快（前10层线性，之后加速）
function floorMult(f) {
  if (f <= 10) return 1 + (f - 1) * 0.10;
  return 1 + 9 * 0.10 + (f - 10) * 0.18; // 10层后每层+18%
}
// 战斗奖励随层递增
function battleReward(f) {
  return { exp: 4 + f * 2, coin: 2 + Math.floor(f / 2) };
}
// BOSS奖励随层递增
function bossReward(f) {
  return { exp: 10 + f * 3, coin: 5 + f * 2 };
}

// 格子类型（宝箱和陷阱合并为 mystery）
const TILES = {
  empty:   { icon: '',   color: '#e8e0d0' },
  wall:    { icon: '🌲', color: '#1b5e20' }, // 树林，不可通行
  battle:  { icon: '⚔️', color: '#ffcdd2' },
  quiz:    { icon: '📜', color: '#c8e6c9' },
  mystery: { icon: '❓', color: '#fff3d4' }, // 宝箱或陷阱
  timeline:{ icon: '🔍', color: '#e1f5fe' }, // 找错/配对挑战
  camp:    { icon: '🏕️', color: '#b3e5fc' },
  shop:    { icon: '🏪', color: '#ffe0b2' },
  boss:    { icon: '👹', color: '#ff8a80' },
  exit:    { icon: '🚩', color: '#a5d6a7' },
  start:   { icon: '🏁', color: '#90caf9' },
};

// ===== 装备系统 =====
const WEAPONS = [
  { id:'w1', name:'青铜剑',   rarity:'common', icon:'🗡️',  atk:12, desc:'普通铁剑，锋利耐用' },
  { id:'w2', name:'铁矛',     rarity:'common', icon:'🏹',  atk:18, desc:'长矛突刺，攻势凌厉' },
  { id:'w3', name:'虎头枪',   rarity:'rare',   icon:'⚔️',  atk:30, desc:'枪法神妙，如猛虎扑食' },
  { id:'w4', name:'青龙偃月刀', rarity:'rare', icon:'🌙',  atk:38, desc:'关羽爱刀，寒光凛凛' },
  { id:'w5', name:'方天画戟', rarity:'legend', icon:'✨',  atk:55, desc:'吕布神兵，天下无双' },
  { id:'w6', name:'倚天剑',   rarity:'legend', icon:'💫',  atk:50, desc:'宝剑出鞘，所向披靡' },
];
const ARMORS = [
  { id:'a1', name:'皮甲',     rarity:'common', icon:'🧥',  def:10, hp:20,  desc:'轻便皮甲，略有防护' },
  { id:'a2', name:'锁子甲',   rarity:'common', icon:'🛡️',  def:18, hp:35,  desc:'铁环相扣，防御不凡' },
  { id:'a3', name:'虎头盔',   rarity:'rare',   icon:'🪖',  def:28, hp:55,  desc:'虎纹铸就，气势威武' },
  { id:'a4', name:'鱼鳞甲',   rarity:'rare',   icon:'⛊',   def:35, hp:70,  desc:'千片鱼鳞，坚不可摧' },
  { id:'a5', name:'麒麟甲',   rarity:'legend', icon:'🦁',  def:50, hp:100, desc:'神兽之甲，护体如铁壁' },
  { id:'a6', name:'铁骑战甲', rarity:'legend', icon:'🏰',  def:45, hp:120, desc:'重甲骑兵，攻守兼备' },
];

const RARITY_COLOR = { common: '#78909c', rare: '#7e57c2', legend: '#f57f17' };
const RARITY_NAME  = { common: '普通', rare: '稀有', legend: '传说' };

function rarityWeight(floor) {
  // 层数越深，稀有装备概率越高
  if (Math.random() < 0.08 + floor * 0.06) return 'legend';
  if (Math.random() < 0.25 + floor * 0.08) return 'rare';
  return 'common';
}
function randomWeapon(rarity) {
  const pool = WEAPONS.filter(w => w.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}
function randomArmor(rarity) {
  const pool = ARMORS.filter(a => a.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ===== 每日次数 =====
const DAILY_FREE = 3;       // 每日免费次数
// 超出后每次消耗1答题积分（spendQuizCoin）

function todayKey() {
  return 'dungeon_daily_' + new Date().toISOString().slice(0, 10);
}
function getDailyCount() {
  return parseInt(localStorage.getItem(todayKey()) || '0');
}
function incDailyCount() {
  const k = todayKey();
  localStorage.setItem(k, (getDailyCount() + 1).toString());
  // 清理昨天及更早的key，避免localStorage堆积
  Object.keys(localStorage).filter(k2 => k2.startsWith('dungeon_daily_') && k2 !== k).forEach(k2 => localStorage.removeItem(k2));
}

// ===== 扫荡存档 =====
const SWEEP_KEY = 'dungeon_best_floor';
function getBestFloor() { return parseInt(localStorage.getItem(SWEEP_KEY) || '0'); }
function saveBestFloor(f) { const cur = getBestFloor(); if (f > cur) localStorage.setItem(SWEEP_KEY, f); }
// 扫荡里程碑：每5层一档，bestFloor=8→milestone=5，bestFloor=13→milestone=10
function sweepMilestone() { return Math.floor(getBestFloor() / 5) * 5; }

// ===== 状态 =====
let map, fogMap, playerPos;
let active = false;
let floor = 1;
let hp, maxHp;
let coins = 0;
let buffs = [];
let logs = [];
let heroId, heroBase; // 基础属性（不含探险等级）
let equip = { weapon: null, armor: null }; // 当前装备

// 被动状态追踪
let lastQuizCorrect = false;  // 上次答题是否答对（关羽先手）

// 探险等级系统
let dgLv = 1;        // 探险等级（1-10）
let dgExp = 0;        // 当前经验
let dgExpNext = 20;   // 升级所需经验

export function initDungeon() {
  window.dungeonModule = { refresh, startDungeon, startSweep, _quit: quitDungeon };
}

function refresh() { if (!active) renderLobby(); }

// ===== 经验/等级 =====
function expToNext(lv) { return 15 + lv * 10; } // 25,35,45...

function gainExp(amount) {
  dgExp += amount;
  while (dgExp >= dgExpNext && dgLv < 10) {
    dgExp -= dgExpNext;
    dgLv++;
    dgExpNext = expToNext(dgLv);
    // 升级回血30% + 属性提升
    hp = Math.min(getMaxHp(), hp + Math.round(getMaxHp() * 0.3));
    maxHp = getMaxHp();
    addLog(`⬆️ 升级！探险Lv${dgLv}！HP回复30%`);
    if (window.effects) window.effects.flashPulse('rgba(76,175,80,0.3)');
  }
}

// 探险等级加成后的属性
function getMaxHp() { return Math.round(heroBase.maxHp * (1 + (dgLv - 1) * 0.12)) + (equip.armor?.hp || 0); }
function getAtk() { return Math.round(heroBase.atk * (1 + (dgLv - 1) * 0.10)) + buffs.filter(b=>b.e==='atk').reduce((s,b)=>s+b.v,0) + (equip.weapon?.atk||0); }
function getDef() { return Math.round(heroBase.def * (1 + (dgLv - 1) * 0.10)) + buffs.filter(b=>b.e==='def').reduce((s,b)=>s+b.v,0) + (equip.armor?.def||0); }
function getMaxHpBonus() { return equip.armor?.hp || 0; }
function getInt() { return Math.round(heroBase.int * (1 + (dgLv - 1) * 0.10)); }

// ===== 大厅 =====
function renderLobby() {
  const c = el('dungeon-container'); if (!c) return;
  c.style.background = 'var(--bg)';
  const owned = Object.keys(gameState.ownedCards);
  const milestone = sweepMilestone();
  const best = getBestFloor();
  const cnt = getDailyCount();
  const remaining = Math.max(0, DAILY_FREE - cnt);
  const canAfford = gameState.quizCoins >= 1;

  const sweepSection = milestone < 5
    ? `<div class="dg-sweep-locked">🔒 通过第5层后解锁扫荡（当前最深：第${best||0}层）</div>`
    : `<div class="dg-sweep-card">
        <div class="dg-sweep-title">⚡ 扫荡可用</div>
        <div class="dg-sweep-desc">历史最深第 ${best} 层，可扫荡前 ${milestone} 层，直接从第 ${milestone+1} 层出发</div>
        <button class="dg-sweep-btn" ${heroId?'':'disabled'} onclick="window.dungeonModule.startSweep()">
          ${heroId?`⚡ 扫荡前${milestone}层并出发`:'请先选择武将'}
        </button>
      </div>`;

  const charCards = owned
    .map(id => ({ id, power: calcCharPower(id, gameState.getCardLevel(id)) }))
    .sort((a, b) => b.power - a.power)
    .map(({ id }) => {
      const ch = getCharacter(id); if (!ch) return '';
      const lv = gameState.getCardLevel(id), sel = heroId === id;
      const rb = ch.rarity==='legend'?'#ffd700':ch.rarity==='rare'?'#7c4dff':'#aaa';
      const pas = PASSIVES[id];
      return `<div class="dg-char-item ${sel?'selected':''}" style="border-color:${sel?'#4caf50':rb}"
        onclick="window.dungeonModule._pick('${id}')">
        ${avatarHTML(id, 44)}
        <div class="dg-char-name">${ch.name}</div>
        <div class="dg-char-lv" style="color:${rb}">Lv${lv}</div>
        ${pas ? `<div class="dg-char-passive">${pas.icon}${pas.name}</div>` : ''}
      </div>`;
    }).join('');

  const passiveBanner = heroId && PASSIVES[heroId] ? `
    <div class="dg-passive-banner">
      <span style="font-size:15px">${PASSIVES[heroId].icon}</span>
      <b> 被动·${PASSIVES[heroId].name}</b>：${PASSIVES[heroId].desc}
    </div>` : '';

  const quotaSection = remaining > 0
    ? `<div class="dg-quota">今日免费次数：<b style="color:#66bb6a">${remaining}</b> / ${DAILY_FREE} 次剩余</div>`
    : `<div class="dg-quota-warn">今日免费次数已用完 · 继续需消耗 <b style="color:#ffb74d">1 🎫答题积分</b>
        <span style="color:${canAfford?'#66bb6a':'#ef5350'}">（当前：${gameState.quizCoins}）</span>
      </div>`;

  const canStart = heroId && (cnt < DAILY_FREE || canAfford);
  const btnLabel = !heroId ? '请选择武将' : cnt < DAILY_FREE ? '⚔️ 出发探险（免费）' : '⚔️ 出发探险（-1🎫）';

  c.innerHTML = `<div class="dg-lobby">
    <div class="dg-lobby-hero">
      <div class="dg-lobby-icon">🗺️</div>
      <div class="dg-lobby-title">乱世探险</div>
      <div class="dg-lobby-sub">无限层 · 刷怪升级 · 击败BOSS</div>
    </div>
    <div class="dg-rules-card">
      <p>· 选一名武将深入无限层地牢<br>
         · 所有格子都是暗格，踏上去才知道遇到什么<br>
         · 可能遭遇战斗、答题、宝箱、陷阱、商人……<br>
         · 每层有👹BOSS，击败才能进入下一层<br>
         · 每通过5层解锁扫荡，下次可直接跳过已通关卡</p>
    </div>
    ${sweepSection}
    <div class="dg-section-title">选择武将 · 按战力排序</div>
    <div class="dg-char-grid">${charCards}</div>
    ${passiveBanner}
    ${quotaSection}
    <button class="dg-start-btn" ${canStart?'':'disabled'} onclick="window.dungeonModule.startDungeon()">
      ${btnLabel}
    </button>
  </div>`;
  window.dungeonModule._pick = id => { heroId = id; renderLobby(); };
}

// ===== 开始 =====
function startDungeon() {
  if (!heroId) return;
  // 每日次数检查
  if (getDailyCount() >= DAILY_FREE) {
    if (!gameState.spendQuizCoin()) return; // 积分不足（按钮已disabled，保险起见）
  }
  incDailyCount();
  active = true;
  floor = 1; coins = 0; buffs = []; logs = []; equip = { weapon: null, armor: null };
  dgLv = 1; dgExp = 0; dgExpNext = expToNext(1);
  lastQuizCorrect = false;
  heroBase = calcStats(heroId);
  maxHp = getMaxHp();
  hp = maxHp;
  genMap();
  render();
}

// ===== 扫荡并从里程碑后一层开始 =====
function startSweep() {
  if (!heroId) return;
  const milestone = sweepMilestone();
  if (milestone < 5) return;
  if (getDailyCount() >= DAILY_FREE) {
    if (!gameState.spendQuizCoin()) return;
  }
  incDailyCount();

  // 初始化角色
  active = true;
  floor = milestone + 1;
  coins = 0; buffs = []; logs = []; equip = { weapon: null, armor: null };
  dgLv = 1; dgExp = 0; dgExpNext = expToNext(1);
  heroBase = calcStats(heroId);

  // 计算扫荡奖励：每层约3场战斗+1个宝箱，给金币和EXP
  let sweepGold = 0, sweepExp = 0;
  for (let f = 1; f <= milestone; f++) {
    const { exp, coin } = battleReward(f);
    sweepGold += Math.round(coin * 2.5); // 约2-3场战斗均值
    sweepExp  += Math.round(exp  * 2.5);
  }
  // 扫荡金币进探险内部，结算时再按比例给
  coins = sweepGold;
  // 经验直接发放（推高探险等级）
  gainExp(sweepExp);

  // 每5层给1个随机buff
  const buffCount = milestone / 5;
  for (let i = 0; i < buffCount; i++) buffs.push(rBuff());

  // 按里程碑层数给一件对应品质的装备
  const sweepRarity = milestone >= 10 ? 'rare' : 'common';
  const sweepWeapon = Math.random() < 0.5;
  equip.weapon = randomWeapon(sweepRarity);
  equip.armor  = randomArmor(sweepRarity);

  maxHp = getMaxHp();
  hp = maxHp;

  addLog(`⚡ 扫荡前${milestone}层完成！探险Lv${dgLv}，携带${buffs.length}个buff出发`);

  // 展示扫荡结算弹窗再进入游戏
  const buffNames = buffs.map(b => `${b.i}${b.n}`).join(' ');
  popup(`<div style="font-size:36px">⚡</div>
    <h4>扫荡完成！</h4>
    <p style="font-size:12px;color:var(--text-light);margin:4px 0">前 ${milestone} 层已自动清扫</p>
    <div style="background:#f5f5f5;border-radius:10px;padding:10px;margin:10px 0;font-size:12px;text-align:left">
      <div>🎖️ 探险等级：Lv<b>${dgLv}</b></div>
      <div>💰 携带金币：<b>${coins}</b></div>
      <div>${equip.weapon.icon} 武器：<b>${equip.weapon.name}</b>（ATK+${equip.weapon.atk}）</div>
      <div>${equip.armor.icon}  防具：<b>${equip.armor.name}</b>（DEF+${equip.armor.def}）</div>
      <div>✨ Buff：${buffNames || '无'}</div>
    </div>
    <p style="font-size:14px;font-weight:700;color:#e65100">从第 ${floor} 层开始！</p>
    <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._dgOk()">出发！</button>`);
  window._dgOk = () => { closePopup(); genMap(); render(); };
}

// ===== 生成地图 =====
function genMap() {
  // 董卓：每层开始获得金币
  const passive = getPassive();
  if (passive?.type === 'floor_gold') { coins += passive.value; addLog(`💰 ${passive.name}：本层+${passive.value}金币`); }

  map = Array.from({length:GRID}, () => Array(GRID).fill('empty'));
  fogMap = Array.from({length:GRID}, () => Array(GRID).fill(FOG));

  playerPos = { x: Math.floor(Math.random()*2), y: Math.floor(Math.random()*2) };
  map[playerPos.y][playerPos.x] = 'start';

  // BOSS 放在距出发点曼哈顿距离 >= GRID 的格子里（远半区随机）
  const minDist = GRID; // 6×6 最大曼哈顿距离=10，>=6 确保不紧贴起点
  const bossCandidates = [];
  for (let cy = 0; cy < GRID; cy++) {
    for (let cx = 0; cx < GRID; cx++) {
      if (Math.abs(cx - playerPos.x) + Math.abs(cy - playerPos.y) >= minDist) {
        bossCandidates.push({ cx, cy });
      }
    }
  }
  // 若候选不足则降低距离要求
  if (bossCandidates.length === 0) {
    for (let cy = 0; cy < GRID; cy++)
      for (let cx = 0; cx < GRID; cx++)
        if (cx !== playerPos.x || cy !== playerPos.y)
          bossCandidates.push({ cx, cy });
  }
  const { cx: bx, cy: by } = bossCandidates[Math.floor(Math.random() * bossCandidates.length)];
  map[by][bx] = 'boss';

  // 填充事件（6×6 格子更紧凑，缩减数量让流程更短）
  const pool = [];
  const battleCount = 3 + Math.floor(floor / 2); // 3-7个战斗
  for (let i=0;i<battleCount;i++) pool.push('battle');
  for (let i=0;i<3;i++) pool.push('mystery');
  for (let i=0;i<3;i++) pool.push('quiz');
  pool.push('timeline');
  pool.push('camp');
  pool.push('shop');

  for (let y=0;y<GRID;y++) for (let x=0;x<GRID;x++) {
    if (map[y][x]!=='empty') continue;
    if (pool.length > 0 && Math.random() < 0.60) {
      const idx = Math.floor(Math.random()*pool.length);
      map[y][x] = pool.splice(idx,1)[0];
    }
  }

  // ===== 石墙迷宫：随机铺墙，保证起点到BOSS有通路 =====
  const PROTECTED = new Set(['start','boss','camp','shop']); // 这些格子不变成墙
  // 随机将部分格子变为石墙
  for (let y=0;y<GRID;y++) for (let x=0;x<GRID;x++) {
    if (!PROTECTED.has(map[y][x]) && Math.random() < 0.22) {
      map[y][x] = 'wall';
    }
  }
  // 确保所有非墙格都从起点可达（会自动连通BOSS和所有事件格）
  _ensureAllReachable(playerPos);

  revealAround(playerPos.x, playerPos.y);
}

// 确保所有非墙格都从起点可达：对每个孤立非墙格，打通一条最短墙路连回可达区域
function _ensureAllReachable(start) {
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

  // BFS 找出从 start 出发可达的所有非墙格
  function reachableSet() {
    const visited = Array.from({length:GRID}, ()=>Array(GRID).fill(false));
    const queue = [start];
    visited[start.y][start.x] = true;
    while (queue.length) {
      const {x,y} = queue.shift();
      for (const [dx,dy] of dirs) {
        const nx=x+dx, ny=y+dy;
        if (nx<0||nx>=GRID||ny<0||ny>=GRID||visited[ny][nx]||map[ny][nx]==='wall') continue;
        visited[ny][nx] = true;
        queue.push({x:nx,y:ny});
      }
    }
    return visited;
  }

  // BFS 忽略墙找从某点到最近可达格的最短路，返回路径
  function pathToReachable(sx, sy, reachable) {
    const prev = Array.from({length:GRID}, ()=>Array(GRID).fill(null));
    const visited = Array.from({length:GRID}, ()=>Array(GRID).fill(false));
    const queue = [{x:sx,y:sy}];
    visited[sy][sx] = true;
    while (queue.length) {
      const {x,y} = queue.shift();
      if (reachable[y][x]) {
        const path = [];
        let cur = {x,y};
        while (cur) { path.push(cur); cur = prev[cur.y][cur.x]; }
        return path;
      }
      for (const [dx,dy] of dirs) {
        const nx=x+dx, ny=y+dy;
        if (nx<0||nx>=GRID||ny<0||ny>=GRID||visited[ny][nx]) continue;
        visited[ny][nx] = true;
        prev[ny][nx] = {x,y};
        queue.push({x:nx,y:ny});
      }
    }
    return [];
  }

  // 反复修复，直到所有非墙格可达（最多迭代 GRID*GRID 次防死循环）
  for (let iter=0; iter<GRID*GRID; iter++) {
    const reachable = reachableSet();
    let fixed = false;
    for (let y=0;y<GRID;y++) for (let x=0;x<GRID;x++) {
      if (map[y][x]==='wall' || reachable[y][x]) continue;
      // 找到一个不可达的非墙格，打通路径
      const path = pathToReachable(x, y, reachable);
      for (const p of path) {
        if (map[p.y][p.x]==='wall') map[p.y][p.x] = 'empty';
      }
      fixed = true;
      break; // 每轮只修一个，重新计算可达集
    }
    if (!fixed) break; // 所有格都可达了
  }
}

function revealAround(x,y) {
  for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) {
    const nx=x+dx, ny=y+dy;
    if (nx>=0&&nx<GRID&&ny>=0&&ny<GRID&&fogMap[ny][nx]===FOG) fogMap[ny][nx]=VISIBLE;
  }
  fogMap[y][x]=EXPLORED;
}

// ===== 主渲染 =====
function render() {
  const c = el('dungeon-container'); if (!c) return;
  c.style.background = 'var(--bg)';
  const hpPct  = Math.max(0, hp / maxHp * 100);
  const hpFillClass = hpPct > 50 ? 'high' : hpPct > 25 ? 'mid' : '';
  const expPct = Math.min(100, dgExp / dgExpNext * 100);
  const pas    = getPassive();

  const chips = (equip.weapon || equip.armor || buffs.length) ? `
    <div class="dg-chips">
      ${equip.weapon ? `<span class="dg-chip weapon">${equip.weapon.icon} ${equip.weapon.name} +${equip.weapon.atk}</span>` : ''}
      ${equip.armor  ? `<span class="dg-chip armor">${equip.armor.icon} ${equip.armor.name} +${equip.armor.def}</span>` : ''}
      ${buffs.map(b => `<span class="dg-chip buff" title="${b.n}">${b.i} ${b.n}</span>`).join('')}
    </div>` : '';

  const logLines = logs.length === 0
    ? `<div class="dg-log-empty">踏上格子开始探险…</div>`
    : logs.slice(-3).map(m => `<div class="dg-log-line">${m}</div>`).join('');

  c.innerHTML = `
  <div class="dg-hud">
    <div class="dg-hud-top">
      ${avatarHTML(heroId, 38)}
      <div class="dg-hud-info">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <span class="dg-hud-name">${heroBase.name}</span>
          <span class="dg-hud-floor">第 ${floor} 层</span>
        </div>
        <div class="dg-hud-meta">
          探险 Lv${dgLv} · 💰 ${coins}
          ${pas ? `· <span style="color:#ce93d8">${pas.icon}${pas.name}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="dg-bar-row"><span style="color:#66bb6a">❤️ HP</span><span>${hp} / ${maxHp}</span></div>
    <div class="dg-bar-track">
      <div class="dg-bar-fill hp ${hpFillClass}" style="width:${hpPct}%"></div>
    </div>
    <div class="dg-bar-row"><span style="color:#64b5f6">✨ EXP</span><span>${dgExp} / ${dgExpNext}</span></div>
    <div class="dg-bar-track dg-bar-exp">
      <div class="dg-bar-fill exp" style="width:${expPct}%"></div>
    </div>
    ${chips}
  </div>

  <div class="dg-map-area">
    <div class="dg-map-wrap">
      <div id="dg-map"></div>
      <div class="dg-map-hint">❓ 踏上格子才知道遇到什么</div>
    </div>
    <div class="dg-quit-col">
      <button class="dg-quit-btn" onclick="window.dungeonModule._quit()">结算 🏳️</button>
    </div>
  </div>

  <div class="dg-log">${logLines}</div>`;

  renderGrid();
}

function renderGrid() {
  const m = el('dg-map'); if (!m) return;
  const sz = Math.min(Math.floor((Math.min(window.innerWidth,600)-70)/GRID), 72);

  let h = `<div style="display:grid;grid-template-columns:repeat(${GRID},${sz}px);gap:3px;justify-content:center">`;
  for (let y=0;y<GRID;y++) for (let x=0;x<GRID;x++) {
    const fog=fogMap[y][x], tile=map[y][x], isP=playerPos.x===x&&playerPos.y===y;
    const adj=Math.abs(x-playerPos.x)+Math.abs(y-playerPos.y)===1;
    const t=TILES[tile]||TILES.empty;
    const s=`width:${sz}px;height:${sz}px`;

    if (fog===FOG) {
      h+=`<div class="dg-tile fog" style="${s}"></div>`;
    } else if (tile==='wall') {
      h+=`<div class="dg-tile wall" style="${s};font-size:${sz>50?20:15}px">🌲</div>`;
    } else if (fog===VISIBLE && !isP) {
      h+=`<div class="dg-tile dark ${adj?'adjacent':''}" style="${s};font-size:${sz>50?16:13}px"
        ${adj?`onclick="window.dungeonModule._mv(${x},${y})"`:''}>
        <span style="color:rgba(255,255,255,0.3);font-weight:700">?</span>
      </div>`;
    } else {
      const explored = fog===EXPLORED && !isP;
      h+=`<div class="dg-tile revealed ${isP?'player':''} ${adj&&!isP?'adjacent':''}"
        style="${s};background:${t.color}${explored?'55':'99'}"
        ${adj&&!isP&&tile!=='wall'?`onclick="window.dungeonModule._mv(${x},${y})"`:''}>
        ${isP ? avatarHTML(heroId, sz>50?32:24)
               : `<span style="font-size:${sz>50?18:13}px;opacity:${explored?0.4:0.8}">${t.icon}</span>`}
      </div>`;
    }
  }
  h+='</div>';
  m.innerHTML = h;
  window.dungeonModule._mv = moveTo;
}

// ===== 移动 =====
async function moveTo(x,y) {
  if (Math.abs(x-playerPos.x)+Math.abs(y-playerPos.y)!==1) return;
  if (map[y][x]==='wall') return; // 石墙不可进入
  playerPos={x,y};
  revealAround(x,y);
  const tile=map[y][x];
  // boss/start 格子保留图标；其他踩到立刻清空
  if (tile!=='empty'&&tile!=='start'&&tile!=='boss') map[y][x]='empty';
  render();
  if (tile!=='empty'&&tile!=='start') await handleTile(tile,x,y);
  if (hp<=0) { endDungeon(); return; }
  render();
}

// ===== 事件 =====
async function handleTile(tile,x,y) {
  switch(tile) {
    case 'battle': await doBattle(); break;
    case 'quiz': await doQuiz(); break;
    case 'mystery': await doMystery(); break;
    case 'timeline': await doChallenge(); break;
    case 'camp': await doCamp(); break;
    case 'shop': await doShop(); break;
    case 'boss': await doBoss(); break;
    // exit不再出现在地图上，只能通过击败BOSS进入下一层
  }
  // boss 击败后地图重新生成（genMap）；其他格子已在 moveTo 中提前清空
}

// 战斗（给经验）
async function doBattle() {
  // 深层开始出现传说级敌人
  const pool = floor >= 8
    ? characters
    : characters.filter(c => c.rarity !== 'legend');
  const enemy=pool[Math.floor(Math.random()*pool.length)];
  const eLv=Math.min(5, 1 + Math.floor(floor / 3));
  const eS=calcStats(enemy.id,eLv);
  if(!eS)return;
  const mult = floorMult(floor);
  eS.maxHp=Math.round(eS.maxHp*mult); eS.atk=Math.round(eS.atk*mult); eS.def=Math.round(eS.def*mult);

  return new Promise(resolve=>{
    popup(`<div style="font-size:28px">⚔️</div>
      <h4>遭遇 ${enemy.name}！</h4>
      <div style="display:flex;justify-content:center;gap:12px;margin:10px 0">
        <div style="text-align:center">${avatarHTML(heroId,44)}<div style="font-size:10px;margin-top:2px">${heroBase.name}<br>ATK:${getAtk()} HP:${hp}</div></div>
        <div style="font-size:20px;align-self:center">⚔</div>
        <div style="text-align:center">${avatarHTML(enemy.id,44)}<div style="font-size:10px;margin-top:2px">${enemy.name}<br>ATK:${eS.atk} HP:${eS.maxHp}</div></div>
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="window._dgFight()">战斗！</button>`);

    window._dgFight=()=>{
      let eHp=eS.maxHp;
      let rounds=0;
      const passive = getPassive();

      // 袁绍：战斗开始临时HP+15%
      if (passive?.type === 'battle_hp_bonus') hp = Math.min(maxHp + Math.round(maxHp * passive.value), hp + Math.round(maxHp * passive.value));

      // 关羽/张辽：先手额外一轮
      const hasFirst = passive?.type === 'always_first' || (passive?.type === 'quiz_correct_first' && lastQuizCorrect);
      if (hasFirst) {
        const bonusDmg = Math.max(5, Math.round((getAtk()*1.1-eS.def*0.6)*0.9));
        eHp = Math.max(0, eHp - bonusDmg);
      }

      while(hp>0&&eHp>0&&rounds<12){
        rounds++;
        let myDmg=Math.max(5,Math.round((getAtk()*1.1-eS.def*0.6)*(0.85+Math.random()*0.3)));
        let eDmg=Math.max(3,Math.round((eS.atk*1.1-getDef()*0.6)*(0.85+Math.random()*0.3)));

        if(rounds===1 && passive?.type==='first_round_dmg') myDmg=Math.round(myDmg*(1+passive.value));
        if(rounds>=3 && passive?.type==='late_game_dmg') myDmg=Math.round(myDmg*(1+passive.value));
        if(passive?.type==='phys_dmg_bonus') myDmg=Math.round(myDmg*(1+passive.value));
        if(passive?.type==='berserk' && hp<maxHp*0.5) myDmg=Math.round(myDmg*(1+passive.value));
        // 孙策：25%概率连击
        if(passive?.type==='double_strike' && Math.random()<passive.value) myDmg=Math.round(myDmg*1.8);

        if(passive?.type==='low_hp_def_double' && hp<maxHp*passive.value) eDmg=Math.max(1,Math.round(eDmg*0.5));
        if(passive?.type==='low_hp_def' && hp<maxHp*0.4) eDmg=Math.max(1,Math.round(eDmg*0.67));
        if(passive?.type==='stun_chance' && Math.random()<passive.value) eDmg=0;

        eHp-=myDmg;
        if(eHp>0)hp-=eDmg;
      }
      lastQuizCorrect=false;
      hp=Math.max(0,hp);
      const won=eHp<=0;
      if(won && passive?.type==='post_win_heal'){ hp=Math.min(maxHp,hp+Math.round(maxHp*passive.value)); }
      if(won && passive?.type==='post_win_coin'){ coins+=passive.value; addLog(`☠️ ${heroBase.name}被动：+${passive.value}💰`); }
      let rewardText='';
      if(won){
        const {exp:expGain,coin:coinGain}=battleReward(floor);
        gainExp(expGain);
        coins+=coinGain;
        rewardText=`+${expGain}EXP +${coinGain}💰`;
        addLog(`⚔️ 击败${enemy.name}！${rewardText}`);
      } else {
        addLog(`⚔️ 被${enemy.name}击伤…HP:${hp}`);
      }
      popup(`<div style="font-size:28px">${won?'🎉':'😤'}</div>
        <h4>${won?'战斗胜利！':'战斗失败…'}</h4>
        <p style="font-size:13px;color:var(--text-light)">${won?rewardText:`HP:${hp}/${maxHp}`}</p>
        <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._dgOk()">继续</button>`);
      window._dgOk=()=>{closePopup();resolve()};
    };
  });
}

// 答题
async function doQuiz() {
  const quiz=quizzes[Math.floor(Math.random()*quizzes.length)];
  const q=quiz.questions[Math.floor(Math.random()*quiz.questions.length)];

  return new Promise(resolve=>{
    popup(`<div style="font-size:28px">📜</div><h4>遇到谋士</h4>
      <p style="font-size:13px;font-weight:600;text-align:left;margin:10px 0">${q.question}</p>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${q.options.map((o,i)=>`<button class="mono-quiz-opt" onclick="window._dgAns(${i})">${'ABCD'[i]}. ${o}</button>`).join('')}
      </div>`);

    window._dgAns=idx=>{
      const ok=idx===q.answer;
      lastQuizCorrect = ok;
      if(ok){
        coins+=2; hp=Math.min(maxHp,hp+Math.round(maxHp*0.05)); gainExp(3);
        let bonusLog = '📜 答对！+4💰 +5EXP 回血10%';
        const passive = getPassive();
        if (passive?.type === 'quiz_bonus_exp') { gainExp(passive.value); bonusLog += ` +${passive.value}EXP（${passive.name}）`; }
        if (passive?.type === 'quiz_heal') { hp = Math.min(maxHp, hp + Math.round(maxHp * passive.value)); bonusLog += ` 回血${Math.round(passive.value*100)}%（${passive.name}）`; }
        addLog(bonusLog);
      } else { addLog('📜 答错了…'); }
      popup(`<div style="font-size:28px">${ok?'✅':'❌'}</div><h4>${ok?'答对了！':'答错了'}</h4>
        <p style="font-size:12px;color:var(--text-light);text-align:left;margin:8px 0">${q.explanation}</p>
        <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._dgOk()">继续</button>`);
      window._dgOk=()=>{closePopup();resolve()};
    };
  });
}

// 📅时间线排序
// ===== 方案B：找错游戏 数据 =====
const FIND_ERROR_DATA = [
  { desc:'「赤壁之战」中，曹操率领①<b>八十万</b>大军南下，②<b>孙刘联军</b>以③<b>火攻</b>大破曹军，曹操败走④<b>华容道</b>。',
    opts:['①八十万','②孙刘联军','③火攻','④华容道'], wrong:0,
    explain:'曹操军队实为约二十余万，"八十万"是演义夸大之词，正史记载约十五至二十三万。' },
  { desc:'「桃园三结义」中，①<b>刘备</b>、②<b>关羽</b>、③<b>张飞</b>歃血为盟，以④<b>关羽</b>年长为大哥。',
    opts:['①刘备','②关羽','③张飞','④关羽年长为大哥'], wrong:3,
    explain:'桃园三结义以刘备为大哥，关羽为二弟，张飞为三弟，刘备年长，非关羽。' },
  { desc:'「空城计」中，①<b>司马懿</b>率军而来，②<b>诸葛亮</b>坦然在城楼③<b>弹琴</b>，司马懿疑有埋伏而④<b>主动撤军</b>。',
    opts:['①司马懿','②诸葛亮','③弹琴','④主动撤军'], wrong:3,
    explain:'司马懿并非主动撤军，而是生性多疑，怀疑城中有伏兵，不得不退。此为诸葛亮利用其疑心的谋略。' },
  { desc:'「长坂坡之战」中，①<b>赵云</b>在乱军中②<b>七进七出</b>，保护③<b>阿斗</b>（刘禅），此举令④<b>曹操</b>也暗自赞叹。',
    opts:['①赵云','②七进七出','③阿斗','④曹操'], wrong:1,
    explain:'"七进七出"是演义描写，正史中赵云确实护送刘禅突围，但"七进七出"的说法源于演义渲染。' },
  { desc:'「煮酒论英雄」中，①<b>曹操</b>与②<b>刘备</b>青梅煮酒，曹操说③<b>"天下英雄，唯使君与操耳"</b>，刘备闻言④<b>故意落箸</b>以掩惊慌。',
    opts:['①曹操','②刘备','③原话引用','④故意落箸'], wrong:2,
    explain:'原文为"天下英雄，唯使君与操耳"，此处引用正确。但刘备落箸是因雷声，借此掩饰惊慌反应。（此题为原话基本正确题，选③为迷惑项）' },
  { desc:'「草船借箭」中，①<b>诸葛亮</b>利用②<b>大雾天气</b>，驱船逼近曹营，曹操令士兵③<b>放箭</b>，诸葛亮由此得箭④<b>十万余支</b>。',
    opts:['①诸葛亮','②大雾天气','③放箭','④十万余支'], wrong:0,
    explain:'正史中草船借箭是孙权所为，与诸葛亮无关。诸葛亮草船借箭是《三国演义》的虚构情节。' },
  { desc:'「连环计」中，①<b>王允</b>将②<b>貂蝉</b>先许③<b>吕布</b>、再嫁④<b>曹操</b>，离间二人，最终吕布杀死董卓。',
    opts:['①王允','②貂蝉','③吕布','④曹操'], wrong:3,
    explain:'连环计中貂蝉被许配吕布、嫁给董卓，并非曹操。王允借此挑起吕布对董卓的不满，使吕布弑父。' },
  { desc:'「七擒孟获」中，①<b>诸葛亮</b>七次擒获②<b>孟获</b>又七次释放，最终孟获③<b>心服口服</b>，归顺蜀汉，此役史称④<b>南中平定</b>。',
    opts:['①诸葛亮','②孟获','③心服口服','④南中平定'], wrong:2,
    explain:'正史中孟获是否真的"七擒七纵"存疑，"心服口服"的具体过程更多出于演义渲染，正史记载较简略。' },
  { desc:'「官渡之战」发生于①<b>公元200年</b>，②<b>曹操</b>以少胜多击败③<b>袁绍</b>，关键在于奇袭④<b>乌巢</b>粮仓，断敌粮草。',
    opts:['①公元200年','②曹操','③袁绍','④乌巢'], wrong:0,
    explain:'官渡之战发生于公元200年，此处正确。（此题各项均正确，考察综合判断力，"八十万"常见错误已在赤壁题中考察）' },
  { desc:'「三顾茅庐」中，①<b>刘备</b>三次亲赴②<b>隆中</b>拜访③<b>诸葛亮</b>，诸葛亮提出④<b>隆中对</b>，为刘备规划三分天下大计。',
    opts:['①刘备','②隆中','③诸葛亮','④隆中对'], wrong:1,
    explain:'关于诸葛亮隐居地，史学界有"隆中说"（湖北）和"南阳说"（河南）之争，正史《出师表》称"躬耕于南阳"，隆中说来自后人考证。' },
  { desc:'「夷陵之战」中，①<b>刘备</b>为报②<b>关羽</b>之仇伐吴，被③<b>陆逊</b>以④<b>火攻</b>大败，刘备退至白帝城后病逝。',
    opts:['①刘备','②关羽','③陆逊','④火攻'], wrong:1,
    explain:'刘备伐吴名义上为关羽报仇，实则也有夺回荆州的战略目的。单说"为报关羽之仇"是演义的简化叙述，并非全貌。' },
  { desc:'「白门楼」中，①<b>吕布</b>兵败被擒，向②<b>曹操</b>求饶，③<b>刘备</b>进言"丁原、董卓之事"，曹操遂下令④<b>处死吕布</b>。',
    opts:['①吕布','②曹操','③刘备','④处死吕布'], wrong:2,
    explain:'正是刘备提醒曹操吕布曾先后背叛丁原和董卓，曹操才决意处死吕布，此细节演义与正史记载基本一致，刘备的角色是关键转折。' },
];

// ===== 方案C：连线配对 数据 =====
const MATCH_PAIRS_DATA = [
  { title:'武将与绰号', pairs:[['关羽','美髯公'],['张飞','燕人张翼德'],['赵云','常山赵子龙'],['诸葛亮','卧龙先生']] },
  { title:'武将与兵器', pairs:[['关羽','青龙偃月刀'],['吕布','方天画戟'],['张飞','丈八蛇矛'],['曹操','倚天剑']] },
  { title:'武将与国家', pairs:[['郭嘉','魏'],['周瑜','吴'],['赵云','蜀'],['吕布','群雄']] },
  { title:'战役与主将', pairs:[['赤壁之战','周瑜'],['官渡之战','曹操'],['夷陵之战','陆逊'],['长坂坡','赵云']] },
  { title:'武将与称号', pairs:[['诸葛亮','伏龙'],['庞统','凤雏'],['司马懿','冢虎'],['陆逊','江东之秀']] },
  { title:'武将与典故', pairs:[['曹操','煮酒论英雄'],['诸葛亮','草船借箭'],['黄盖','苦肉计'],['貂蝉','连环计']] },
  { title:'武将与出身', pairs:[['刘备','中山靖王之后'],['曹操','沛国谯县'],['孙权','吴郡富春'],['诸葛亮','琅琊阳都']] },
  { title:'谋士与主公', pairs:[['郭嘉','曹操'],['法正','刘备'],['周瑜','孙权'],['贾诩','张绣→曹操']] },
];

// ===== 随机挑战入口 =====
async function doChallenge() {
  if (Math.random() < 0.5) return doFindError();
  return doMatchPairs();
}

// 方案B：找错游戏
async function doFindError() {
  const data = FIND_ERROR_DATA[Math.floor(Math.random() * FIND_ERROR_DATA.length)];
  return new Promise(resolve => {
    popup(`
      <div style="font-size:28px">🔍</div>
      <h4 style="margin:4px 0">找出史实错误</h4>
      <p style="font-size:11px;color:var(--text-light);margin-bottom:10px">以下描述中有一处错误，点击找出它</p>
      <div style="font-size:13px;line-height:1.9;text-align:left;padding:10px;background:#fafafa;border-radius:10px;margin-bottom:12px">${data.desc}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        ${data.opts.map((o,i) => `<button onclick="window._dgFindErr(${i})"
          style="padding:10px 6px;border:2px solid #ddd;border-radius:10px;background:#fff;
          font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s">${o}</button>`).join('')}
      </div>`);

    window._dgFindErr = idx => {
      const ok = idx === data.wrong;
      lastQuizCorrect = ok;
      if (ok) { coins += 3; gainExp(5); hp = Math.min(maxHp, hp + Math.round(maxHp * 0.08)); addLog('🔍 找错正确！+3💰 +5EXP'); }
      else { addLog('🔍 判断有误…'); }
      popup(`
        <div style="font-size:32px">${ok ? '✅' : '❌'}</div>
        <h4>${ok ? '找对了！' : '判断有误'}</h4>
        <div style="font-size:12px;text-align:left;padding:10px;background:#f5f5f5;border-radius:8px;margin:8px 0;line-height:1.7">
          <b style="color:#ef5350">错误项：</b>${data.opts[data.wrong]}<br>
          <b>解析：</b>${data.explain}
        </div>
        ${ok ? '<p style="color:#4caf50;font-weight:700">+3💰 +5EXP 回血8%</p>' : ''}
        <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._dgOk()">继续</button>`);
      window._dgOk = () => { closePopup(); resolve(); };
    };
  });
}

// 方案C：连线配对（自由连线，全部配完后统一判断）
async function doMatchPairs() {
  const data = MATCH_PAIRS_DATA[Math.floor(Math.random() * MATCH_PAIRS_DATA.length)];
  const leftItems  = data.pairs.map(p => p[0]);
  const rightItems = [...data.pairs.map(p => p[1])].sort(() => Math.random() - 0.5);
  const correctMap = Object.fromEntries(data.pairs); // left→right
  let selected = null;  // 当前选中的左侧index（null=未选）
  let matched  = {};    // leftIdx → rightIdx（可以是错的）

  function render() {
    const allDone = Object.keys(matched).length === leftItems.length;
    popup(`
      <div style="font-size:28px">🔗</div>
      <h4 style="margin:4px 0">连线配对：${data.title}</h4>
      <p style="font-size:11px;color:var(--text-light);margin-bottom:6px">先点左侧，再点右侧完成配对；可重新点左侧更换</p>
      <div id="mp-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;margin-bottom:10px"></div>
      ${allDone ? `<button id="mp-confirm" class="btn btn-primary" style="width:100%;font-size:13px">确认提交</button>` : `<div style="font-size:11px;color:#aaa;text-align:center">已配 ${Object.keys(matched).length}/${leftItems.length} 对</div>`}`);

    const grid = document.getElementById('mp-grid');
    if (!grid) return;

    leftItems.forEach((l, li) => {
      const matchedRi = matched[li] !== undefined ? matched[li] : null;
      const isPaired  = matchedRi !== null;
      const isSel     = selected === li;

      const lBtn = document.createElement('button');
      lBtn.textContent = l;
      lBtn.style.cssText = `padding:9px 6px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;
        border:2px solid ${isSel ? '#667eea' : isPaired ? '#42a5f5' : '#ddd'};
        background:${isSel ? '#ede7f6' : isPaired ? '#e3f2fd' : '#fff'};
        color:${isSel ? '#4527a0' : isPaired ? '#1565c0' : '#333'};transition:all 0.15s`;
      lBtn.onclick = () => { selected = li; render(); };

      const rBtn = document.createElement('button');
      const pairedByLeft = Object.entries(matched).find(([, ri]) => ri === li);
      const isPairedR = pairedByLeft !== undefined;
      rBtn.textContent = rightItems[li];
      rBtn.style.cssText = `padding:9px 6px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;
        border:2px solid ${isPairedR ? '#42a5f5' : '#ddd'};
        background:${isPairedR ? '#e3f2fd' : '#fafafa'};
        color:${isPairedR ? '#1565c0' : '#555'};transition:all 0.15s`;
      rBtn.onclick = () => {
        if (selected === null) return;
        const ri = li;
        // 若该右侧已被别的左侧配对，先解绑
        const existingLeft = Object.entries(matched).find(([, r]) => r === ri);
        if (existingLeft) delete matched[existingLeft[0]];
        matched[selected] = ri;
        selected = null;
        render();
      };

      grid.appendChild(lBtn);
      grid.appendChild(rBtn);
    });

    if (allDone) {
      document.getElementById('mp-confirm').onclick = () => finalize();
    }
  }

  function finalize() {
    const correctCount = Object.entries(matched).filter(([li, ri]) =>
      correctMap[leftItems[li]] === rightItems[ri]
    ).length;
    const total = leftItems.length;
    const allCorrect = correctCount === total;
    const noneCorrect = correctCount === 0;

    // 奖惩：全对=满奖，部分对=减半奖励，全错=扣血扣金
    if (allCorrect) {
      coins += 3; gainExp(8); hp = Math.min(maxHp, hp + Math.round(maxHp * 0.08));
      lastQuizCorrect = true;
      addLog(`🔗 连线全对！+3💰 +8EXP 回血8%`);
    } else if (!noneCorrect) {
      gainExp(correctCount * 2);
      addLog(`🔗 连线${correctCount}/${total}正确 +${correctCount*2}EXP`);
    } else {
      hp = Math.max(1, hp - Math.round(maxHp * 0.1));
      addLog(`🔗 连线全错！扣血10%`);
    }

    popup(`
      <div style="font-size:32px">${allCorrect ? '🎉' : noneCorrect ? '💔' : '📊'}</div>
      <h4 style="margin:4px 0">${allCorrect ? '完美配对！' : noneCorrect ? '全部错误' : `答对 ${correctCount}/${total}`}</h4>
      <div style="margin:8px 0;font-size:12px;text-align:left">
        ${leftItems.map((l, li) => {
          const ri = matched[li];
          const userAns = rightItems[ri];
          const ok = correctMap[l] === userAns;
          return `<div style="padding:3px 0;color:${ok?'#2e7d32':'#c62828'}">
            ${ok?'✅':'❌'} ${l} → ${userAns}${ok?'':` <span style="color:#888;font-size:10px">（正确：${correctMap[l]}）</span>`}
          </div>`;
        }).join('')}
      </div>
      <p style="font-weight:700;color:${allCorrect?'#4caf50':noneCorrect?'#ef5350':'#ff9800'}">
        ${allCorrect ? '+3💰 +8EXP 回血8%' : noneCorrect ? '扣血10%' : `+${correctCount*2}EXP`}
      </p>
      <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._dgOk()">继续</button>`);
    window._dgOk = () => { closePopup(); resolve(); };
  }

  return new Promise(resolve => { render(); });
}

// 装备获得弹窗
function equipPopup(item, type, resolve) {
  const isWeapon = type === 'weapon';
  const old = equip[type];
  const statText = isWeapon ? `ATK +${item.atk}` : `DEF +${item.def}  HP +${item.hp}`;
  const oldText = old ? `（替换：${old.icon}${old.name}）` : '（首件装备！）';
  const rc = RARITY_COLOR[item.rarity];
  const rn = RARITY_NAME[item.rarity];
  equip[type] = item;
  maxHp = getMaxHp();
  if (hp > maxHp && old) hp = maxHp; // 换甲后如果HP超出则截断
  addLog(`${item.icon} 获得装备：${item.name}`);
  popup(`<div style="font-size:36px">${item.icon}</div>
    <div style="display:inline-block;padding:2px 10px;border-radius:8px;font-size:12px;font-weight:700;color:${rc};border:1.5px solid ${rc};margin:4px 0">${rn}</div>
    <h4 style="margin:6px 0">${item.name}</h4>
    <p style="font-size:12px;color:var(--text-light);margin-bottom:6px">${item.desc}</p>
    <p style="font-size:15px;font-weight:700;color:${rc};margin:6px 0">${statText}</p>
    <p style="font-size:12px;color:#999">${oldText}</p>
    <button class="btn btn-primary" style="width:100%;margin-top:10px" onclick="window._dgOk()">装备！</button>`);
  window._dgOk = () => { closePopup(); resolve(); };
}

// ❓未知格（45%宝箱 35%装备 20%陷阱）
async function doMystery() {
  const roll = Math.random();

  if (roll < 0.35) {
    // 掉落装备
    const rarity = rarityWeight(floor);
    const isWeapon = Math.random() < 0.5;
    const item = isWeapon ? randomWeapon(rarity) : randomArmor(rarity);
    return new Promise(resolve => equipPopup(item, isWeapon ? 'weapon' : 'armor', resolve));

  } else if (roll < 0.80) {
    // 普通宝箱
    const rewards=[
      {t:'💰 +5金币',fn:()=>{coins+=5}},
      {t:'❤️ 回复25%HP',fn:()=>{hp=Math.min(maxHp,hp+Math.round(maxHp*0.25))}},
      {t:'⬆️ +10EXP',fn:()=>{gainExp(10)}},
      {t:`${rBuff().i} 获得buff`,fn:()=>{const b=rBuff();buffs.push(b);addLog(`buff:${b.i}${b.n}`)}},
    ];
    const r=rewards[Math.floor(Math.random()*rewards.length)];
    r.fn();
    addLog(`🎁 宝箱！${r.t}`);

    return new Promise(resolve=>{
      popup(`<div style="font-size:40px">🎁</div><h4>是宝箱！</h4>
        <p style="font-size:16px;font-weight:700;color:#f5a623;margin:8px 0">${r.t}</p>
        <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._dgOk()">继续</button>`);
      window._dgOk=()=>{closePopup();resolve()};
    });
  } else {
    const traps=[
      {t:'💀 毒箭！HP-20%',fn:()=>{hp=Math.max(1,hp-Math.round(maxHp*0.2))}},
      {t:'💀 落石！HP-15%',fn:()=>{hp=Math.max(1,hp-Math.round(maxHp*0.15))}},
      {t:'💀 被盗！-8💰',fn:()=>{coins=Math.max(0,coins-8)}},
      {t:'💀 诅咒！失去buff',fn:()=>{if(buffs.length>0)buffs.pop()}},
    ];
    const t=traps[Math.floor(Math.random()*traps.length)];
    t.fn();
    addLog(t.t);
    if(window.effects)window.effects.screenShake(5,300);

    return new Promise(resolve=>{
      popup(`<div style="font-size:40px">💀</div><h4>是陷阱！</h4>
        <p style="font-size:14px;color:#ef5350;margin:8px 0">${t.t}</p>
        <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._dgOk()">继续</button>`);
      window._dgOk=()=>{closePopup();resolve()};
    });
  }
}

// 营寨
async function doCamp() {
  return new Promise(resolve=>{
    popup(`<div style="font-size:36px">🏕️</div><h4>发现营寨</h4>
      <p style="font-size:12px;color:var(--text-light);margin-bottom:10px">选择休整方式</p>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn btn-primary" onclick="window._dgCamp('heal')">❤️ 回复50%HP</button>
        <button class="btn btn-secondary" onclick="window._dgCamp('atk')">⚔️ ATK+20</button>
        <button class="btn btn-secondary" onclick="window._dgCamp('def')">🛡️ DEF+15</button>
      </div>`);
    window._dgCamp=c=>{
      const passive = getPassive();
      const campBonus = passive?.type === 'camp_heal_bonus' ? passive.value : 0;
      if(c==='heal'){
        const healRate = 0.5 + campBonus;
        hp=Math.min(maxHp,hp+Math.round(maxHp*healRate));
        addLog(`🏕️ 回血${Math.round(healRate*100)}%${campBonus>0?` （${passive.name}+${Math.round(campBonus*100)}%）`:''}`);
      }
      else if(c==='atk'){buffs.push({n:'强攻',e:'atk',v:20,i:'⚔️'});addLog('🏕️ ATK+20')}
      else{buffs.push({n:'坚守',e:'def',v:15,i:'🛡️'});addLog('🏕️ DEF+15')}
      closePopup();resolve();
    };
  });
}

// 商店
async function doShop() {
  return new Promise(resolve=>{
    const passive = getPassive();
    const discount = passive?.type === 'shop_discount' ? passive.value : 0;
    const p1 = Math.max(0, 15 - discount), p2 = Math.max(0, 10 - discount);
    const discountNote = discount > 0 ? `<div style="font-size:11px;color:#7c4dff;margin-bottom:6px">${passive.icon} ${passive.name}：所有物品便宜${discount}💰</div>` : '';
    popup(`<div style="font-size:36px">🏪</div><h4>路遇商人</h4>
      <p style="font-size:12px;color:var(--text-light);margin-bottom:6px">当前💰${coins}</p>
      ${discountNote}
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn btn-primary" ${coins>=p1?'':'disabled'} onclick="window._dgBuy('hp')">❤️ 回满HP (${p1}💰)</button>
        <button class="btn btn-secondary" ${coins>=p2?'':'disabled'} onclick="window._dgBuy('atk')">⚔️ ATK+30 (${p2}💰)</button>
        <button class="btn btn-secondary" ${coins>=p2?'':'disabled'} onclick="window._dgBuy('exp')">⬆️ +20EXP (${p2}💰)</button>
        <button class="btn btn-secondary" onclick="window._dgBuy('skip')">离开</button>
      </div>`);
    window._dgBuy=i=>{
      if(i==='hp'&&coins>=p1){coins-=p1;hp=maxHp;addLog('🏪 回满HP')}
      else if(i==='atk'&&coins>=p2){coins-=p2;buffs.push({n:'利刃',e:'atk',v:30,i:'🗡️'});addLog('🏪 ATK+30')}
      else if(i==='exp'&&coins>=p2){coins-=p2;gainExp(20);addLog('🏪 +20EXP')}
      closePopup();resolve();
    };
  });
}

// BOSS专属知识挑战（改动C）
async function doBossQuiz(bossName) {
  const passive = getPassive();
  const noFail = passive?.type === 'quiz_no_fail'; // 诸葛亮：答错也算对

  // 随机抽3道题
  const pool = [];
  for (const quiz of quizzes) for (const q of quiz.questions) pool.push(q);
  const questions = [];
  const used = new Set();
  while (questions.length < 3 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    if (!used.has(idx)) { used.add(idx); questions.push(pool[idx]); }
  }

  let correctCount = 0;

  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi];
    correctCount += await new Promise(resolve => {
      popup(`
        <div style="text-align:center;margin-bottom:10px">
          <div style="font-size:28px">📜</div>
          <h4 style="color:#ef5350;margin:4px 0">BOSS挑战：${bossName}</h4>
          <div style="font-size:12px;color:#999;margin-bottom:6px">答题可削弱BOSS · 第 ${qi+1}/3 题</div>
          ${noFail ? `<div style="font-size:11px;color:#7c4dff;background:#ede7f6;border-radius:6px;padding:4px 8px;margin-bottom:6px">🪄 神机妙算：答错也有效！</div>` : ''}
          <div style="display:flex;justify-content:center;gap:6px;margin-bottom:8px">
            ${[0,1,2].map(i => `<div style="width:28px;height:6px;border-radius:3px;background:${i<qi?'#4caf50':i===qi?'#ffc107':'#ddd'}"></div>`).join('')}
          </div>
        </div>
        <p style="font-size:13px;font-weight:600;text-align:left;margin:0 0 10px 0;padding:8px;background:#f9f9f9;border-radius:8px">${q.question}</p>
        <div style="display:flex;flex-direction:column;gap:5px">
          ${q.options.map((o,i) => `<button class="mono-quiz-opt" onclick="window._dgBossAns(${i})">${'ABCD'[i]}. ${o}</button>`).join('')}
        </div>`);
      window._dgBossAns = idx => {
        const actualOk = idx === q.answer;
        const countAsOk = noFail || actualOk;
        if (countAsOk) lastQuizCorrect = true;
        const hpReduce = countAsOk ? 10 : 0;
        popup(`
          <div style="text-align:center;padding:8px 0">
            <div style="font-size:36px">${actualOk ? '✅' : noFail ? '🪄' : '❌'}</div>
            <h4>${actualOk ? '答对了！' : noFail ? '答错了，但神机妙算！' : '答错了…'}</h4>
            ${countAsOk ? `<p style="color:#4caf50;font-weight:700;font-size:14px">BOSS血量减少10%！</p>` : `<p style="color:#ef5350;font-size:13px">本题无效</p>`}
            <p style="font-size:11px;color:var(--text-light);margin:6px 0;text-align:left">${q.explanation}</p>
            <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._dgOk()">继续</button>
          </div>`);
        window._dgOk = () => { closePopup(); resolve(countAsOk ? 1 : 0); };
      };
    });
  }

  // 汇总结果弹窗
  const hpReduction = correctCount * 10;
  await new Promise(resolve => {
    popup(`
      <div style="text-align:center">
        <div style="font-size:36px">${correctCount === 3 ? '🔥' : correctCount >= 2 ? '💪' : correctCount >= 1 ? '👍' : '😤'}</div>
        <h4>答题挑战结果</h4>
        <p style="font-size:14px;margin:6px 0">答对 <b style="color:#4caf50">${correctCount}</b> / 3 题</p>
        ${hpReduction > 0
          ? `<p style="font-size:15px;font-weight:700;color:#ef5350;margin:8px 0">BOSS初始血量 <b>-${hpReduction}%</b>！</p>`
          : `<p style="font-size:13px;color:#999;margin:8px 0">BOSS血量未受损，全力应战！</p>`}
        ${correctCount === 3 ? `<p style="font-size:12px;color:#4caf50">🏆 全对！BOSS大幅削弱，胜算大增！</p>` : ''}
        <button class="btn btn-primary" style="width:100%;background:linear-gradient(135deg,#ef5350,#c62828);margin-top:10px" onclick="window._dgOk()">⚔️ 迎战！</button>
      </div>`);
    window._dgOk = () => { closePopup(); resolve(); };
  });

  return correctCount;
}

// BOSS（无限层，强度随层递增）
async function doBoss() {
  const bossPool = characters.filter(c => c.rarity === 'legend');
  const boss = bossPool[floor % bossPool.length];
  const bLv = Math.min(5, 1 + Math.floor(floor / 4));
  const bS = calcStats(boss.id, bLv);
  if (!bS) { endDungeon(); return; }
  // BOSS = 普通怪强化基础上再×1.4
  const mult = floorMult(floor) * 1.4;
  bS.maxHp = Math.round(bS.maxHp * mult);
  bS.atk   = Math.round(bS.atk   * mult);
  bS.def   = Math.round(bS.def   * mult);

  // ===== 改动C：BOSS前知识挑战 =====
  const correctCount = await doBossQuiz(boss.name);
  bS.maxHp = Math.round(bS.maxHp * (1 - correctCount * 0.10));
  bS.hp = bS.maxHp;
  if (correctCount > 0) addLog(`📜 答对${correctCount}题！BOSS血量减少${correctCount*10}%`);

  // ===== 战斗前公告 popup =====
  const passive = getPassive();
  const charmStun = passive?.type === 'boss_charm' && Math.random() < passive.value;

  await new Promise(res => {
    popup(`<div style="font-size:36px">👹</div>
      <h4 style="color:#ef5350">第${floor}层BOSS: ${boss.name}！</h4>
      <p style="font-size:12px;color:var(--text-light);margin:4px 0">遭遇强敌，无路可退！</p>
      ${charmStun ? `<p style="font-size:12px;color:#e91e63;font-weight:700">💃 美人计：BOSS跳过首轮攻击！</p>` : ''}
      <div style="display:flex;justify-content:center;gap:12px;margin:10px 0">
        <div style="text-align:center">${avatarHTML(heroId,44)}<div style="font-size:10px;margin-top:2px">${heroBase.name}<br>ATK:${getAtk()} HP:${hp}</div></div>
        <div style="font-size:20px;align-self:center">⚔</div>
        <div style="text-align:center">${avatarHTML(boss.id,44)}<div style="font-size:10px;margin-top:2px">${boss.name}<br>ATK:${bS.atk} HP:${bS.maxHp}${correctCount>0?` (-${correctCount*10}%)`:''}</div></div>
      </div>
      <button class="btn btn-primary" style="width:100%;background:linear-gradient(135deg,#ef5350,#c62828)" onclick="window._dgBossStart()">⚔️ 迎战！</button>`);
    window._dgBossStart = () => { closePopup(); res(); };
  });

  // ===== 动画战斗 =====
  await new Promise(resolve => {
    // 速度控制（复用 battle.js 的 battleSpeed 全局）
    const spd = () => (window._battleSpeed || 1);
    const wait = ms => new Promise(r => setTimeout(r, Math.round(ms / spd())));

    // 英雄当前HP作为独立变量追踪（战后同步回全局）
    let heroHp = hp;
    let bossHp = bS.maxHp;

    // 袁绍被动：战斗开始临时HP+15%
    if (passive?.type === 'battle_hp_bonus') {
      heroHp = Math.min(maxHp + Math.round(maxHp * passive.value), heroHp + Math.round(maxHp * passive.value));
    }

    // 先手被动处理
    const hasFirst = passive?.type === 'always_first' || (passive?.type === 'quiz_correct_first' && lastQuizCorrect);

    // ===== 渲染战斗场景 =====
    const container = document.getElementById('dungeon-container');
    if (!container) { resolve(); return; }

    const heroRarity = heroBase?.rarity || 'common';
    const heroRarityGlow = heroRarity === 'legend'
      ? 'box-shadow:0 0 20px rgba(255,215,0,0.5),0 0 40px rgba(255,215,0,0.2);'
      : heroRarity === 'rare' ? 'box-shadow:0 0 15px rgba(124,77,255,0.4),0 0 30px rgba(124,77,255,0.15);'
      : 'box-shadow:0 2px 8px rgba(0,0,0,0.2);';
    const heroRarityBorder = heroRarity === 'legend' ? '#ffd700' : heroRarity === 'rare' ? '#7c4dff' : '#4caf50';
    const bossRarityGlow = 'box-shadow:0 0 20px rgba(255,215,0,0.5),0 0 40px rgba(255,215,0,0.2);';

    function hpColor(pct) { return pct > 50 ? '#4caf50' : pct > 25 ? '#ff9800' : '#ef5350'; }

    function heroHpPct() { return Math.max(0, heroHp / maxHp * 100); }
    function bossHpPct() { return Math.max(0, bossHp / bS.maxHp * 100); }

    function unitCardHtml(side) {
      if (side === 'hero') {
        const pct = heroHpPct();
        const bc = hpColor(pct);
        return `<div id="bg-unit-hero" style="width:30%;max-width:110px;text-align:center;transition:all 0.3s;position:relative">
          <div style="border-radius:10px;overflow:hidden;border:2px solid ${heroRarityBorder};${heroRarityGlow}
            background:linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.5));position:relative">
            <img src="images/cardart/${heroId}.webp" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block" onerror="this.style.display='none'">
            ${heroRarity==='legend'?`<div style="position:absolute;top:0;left:0;right:0;background:linear-gradient(90deg,#ffd70088,transparent);padding:2px 6px;font-size:9px;color:#fff;font-weight:800">👑 传说</div>`:''}
            ${heroRarity==='rare'?`<div style="position:absolute;top:0;left:0;right:0;background:linear-gradient(90deg,#7c4dff88,transparent);padding:2px 6px;font-size:9px;color:#fff;font-weight:800">💎 稀有</div>`:''}
            <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.8));padding:16px 4px 4px;text-align:center">
              <div style="font-size:12px;font-weight:800;color:white">${heroBase.name}</div>
            </div>
          </div>
          <div style="margin-top:4px;background:rgba(0,0,0,0.5);border-radius:4px;height:8px;overflow:hidden;border:1px solid #4caf5055">
            <div id="bg-hp-hero" style="width:${pct}%;height:100%;background:linear-gradient(90deg,${bc},${bc}cc);transition:width 0.5s ease;border-radius:3px"></div>
          </div>
          <div style="font-size:9px;color:#aaa;margin-top:2px">
            <span id="bg-hptxt-hero" style="color:${bc};font-weight:700">${Math.max(0,heroHp)}</span>/<span>${maxHp}</span>
          </div>
          <div style="display:flex;justify-content:center;gap:3px;margin-top:2px">
            <span style="font-size:8px;color:#ef9a9a">⚔${getAtk()}</span>
            <span style="font-size:8px;color:#a5d6a7">🛡${getDef()}</span>
          </div>
        </div>`;
      } else {
        const pct = bossHpPct();
        const bc = hpColor(pct);
        return `<div id="bg-unit-boss" style="width:30%;max-width:110px;text-align:center;transition:all 0.3s;position:relative">
          <div style="border-radius:10px;overflow:hidden;border:2px solid #ffd700;${bossRarityGlow}
            background:linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.5));position:relative">
            <img src="images/cardart/${boss.id}.webp" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block" onerror="this.style.display='none'">
            <div style="position:absolute;top:0;left:0;right:0;background:linear-gradient(90deg,#ef535088,transparent);padding:2px 6px;font-size:9px;color:#fff;font-weight:800">👹 BOSS</div>
            <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.8));padding:16px 4px 4px;text-align:center">
              <div style="font-size:12px;font-weight:800;color:white">${boss.name}</div>
            </div>
          </div>
          <div style="margin-top:4px;background:rgba(0,0,0,0.5);border-radius:4px;height:8px;overflow:hidden;border:1px solid #ef535055">
            <div id="bg-hp-boss" style="width:${pct}%;height:100%;background:linear-gradient(90deg,${bc},${bc}cc);transition:width 0.5s ease;border-radius:3px"></div>
          </div>
          <div style="font-size:9px;color:#aaa;margin-top:2px">
            <span id="bg-hptxt-boss" style="color:${bc};font-weight:700">${Math.max(0,bossHp)}</span>/<span>${bS.maxHp}</span>
          </div>
          <div style="display:flex;justify-content:center;gap:3px;margin-top:2px">
            <span style="font-size:8px;color:#ef9a9a">⚔${bS.atk}</span>
            <span style="font-size:8px;color:#a5d6a7">🛡${bS.def}</span>
          </div>
        </div>`;
      }
    }

    // 速度切换（必须在 container.innerHTML 之前声明，避免 TDZ 错误）
    let _bossSpeed = Number(localStorage.getItem('dungeon-boss-speed')) || 1;
    window._battleSpeed = _bossSpeed;

    container.innerHTML = `
      <div style="position:relative;min-height:calc(100vh - 130px);background:#1a1a2e;overflow:hidden">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,#2a0a0a 0%,#1a1a2e 50%,#0a0a1e 100%)"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.6) 100%)"></div>
        <div style="position:relative;z-index:1;padding:10px 6px;height:100%;display:flex;flex-direction:column">
          <!-- 标题 + 速度 -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px">
            <span style="color:rgba(255,255,255,0.7);font-size:12px;font-weight:700">👹 第${floor}层 BOSS战</span>
            <button id="bg-speed-btn" onclick="window._dgToggleSpeed()" style="padding:6px 14px;border:none;border-radius:10px;background:rgba(255,255,255,0.15);color:white;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">${_bossSpeed === 2 ? '⏩ 2x' : '▶️ 1x'}</button>
          </div>
          <!-- BOSS（上方）-->
          <div style="display:flex;justify-content:space-around;align-items:flex-end;padding:0 4px">
            ${unitCardHtml('boss')}
          </div>
          <!-- 中间冲突区 -->
          <div id="bg-clash" style="flex:0;text-align:center;padding:8px 0;position:relative">
            <div style="font-size:20px;font-weight:900;color:#ef5350;text-shadow:0 0 20px rgba(239,83,80,0.5);letter-spacing:4px">👹 对 战 ⚔</div>
          </div>
          <!-- 英雄（下方）-->
          <div style="display:flex;justify-content:space-around;align-items:flex-start;padding:0 4px">
            ${unitCardHtml('hero')}
          </div>
          <!-- 战斗日志 -->
          <div id="bg-log" style="margin-top:auto;background:rgba(0,0,0,0.55);border-radius:10px;padding:6px 8px;max-height:120px;overflow-y:auto;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)"></div>
        </div>
      </div>`;

    // 速度切换按钮同步
    const _applySpeedBtn = () => {
      const btn = document.getElementById('bg-speed-btn');
      if (btn) {
        btn.textContent = _bossSpeed === 2 ? '⏩ 2x' : '▶️ 1x';
        btn.style.background = _bossSpeed === 2 ? '#ffc107' : 'rgba(255,255,255,0.15)';
        btn.style.color = _bossSpeed === 2 ? '#333' : 'white';
      }
    };
    window._dgToggleSpeed = () => {
      _bossSpeed = _bossSpeed === 1 ? 2 : 1;
      window._battleSpeed = _bossSpeed;
      localStorage.setItem('dungeon-boss-speed', _bossSpeed);
      _applySpeedBtn();
    };
    setTimeout(_applySpeedBtn, 0); // 渲染后同步按钮样式

    function bLog(html) {
      const el = document.getElementById('bg-log'); if (!el) return;
      const d = document.createElement('div');
      d.style.cssText = 'font-size:11px;color:#eee;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.1);animation:fadeIn 0.3s';
      d.innerHTML = html;
      el.appendChild(d);
      el.scrollTop = el.scrollHeight;
    }

    function updateHpBar(side) {
      const pct = side === 'hero' ? heroHpPct() : bossHpPct();
      const bc = hpColor(pct);
      const bar = document.getElementById(`bg-hp-${side}`);
      const txt = document.getElementById(`bg-hptxt-${side}`);
      const val = side === 'hero' ? heroHp : bossHp;
      if (bar) { bar.style.width = pct + '%'; bar.style.background = `linear-gradient(90deg,${bc},${bc}cc)`; }
      if (txt) { txt.textContent = Math.max(0, val); txt.style.color = bc; }
      if (pct <= 0) {
        const card = document.getElementById(`bg-unit-${side}`);
        if (card) { card.style.opacity = '0.35'; card.style.filter = 'grayscale(1)'; }
      }
    }

    function showDmg(side, text, color) {
      const card = document.getElementById(`bg-unit-${side}`); if (!card) return;
      const n = document.createElement('div');
      n.style.cssText = `position:absolute;left:50%;top:20%;transform:translateX(-50%);
        font-size:18px;font-weight:900;color:${color};text-shadow:0 1px 3px rgba(0,0,0,0.5);
        pointer-events:none;z-index:20;animation:dmgFloat 1s ease-out forwards`;
      n.textContent = text;
      card.style.position = 'relative';
      card.appendChild(n);
      setTimeout(() => n.remove(), 1000);
    }

    function setClash(html) {
      const el = document.getElementById('bg-clash'); if (el) el.innerHTML = html;
    }

    // ===== 战斗主循环（异步）=====
    async function runBossFight() {
      await wait(400);

      // 先手
      if (hasFirst) {
        const bonusDmg = Math.max(8, Math.round((getAtk() * 1.1 - bS.def * 0.6) * 0.9));
        bossHp = Math.max(0, bossHp - bonusDmg);
        updateHpBar('boss');
        setClash(`<div style="animation:fadeIn 0.2s"><span style="font-size:22px;font-weight:900;color:#ffc107;text-shadow:0 0 15px #ffc10755">先手 -${bonusDmg}</span></div>`);
        showDmg('boss', `-${bonusDmg}`, '#ffc107');
        bLog(`<span style="color:#81c784">${heroBase.name}</span> ⚡先手！对 <span style="color:#ef9a9a">${boss.name}</span> 造成 <b style="color:#ffab91">${bonusDmg}</b> 伤害`);
        if (window.effects) window.effects.screenShake(3, 200);
        await wait(600);
      }

      let rounds = 0;
      while (heroHp > 0 && bossHp > 0 && rounds < 20) {
        rounds++;
        bLog(`<span style="color:#ffc107;font-weight:700">── 第${rounds}回合 ──</span>`);
        await wait(300);

        // === 英雄出击 ===
        const heroCard = document.getElementById('bg-unit-hero');
        if (heroCard) { heroCard.style.filter = 'brightness(1.4)'; heroCard.style.transform = 'scale(1.05)'; }
        await wait(200);

        let myDmg = Math.max(8, Math.round((getAtk() * 1.1 - bS.def * 0.6) * (0.85 + Math.random() * 0.3)));

        // 被动加成
        if (rounds === 1 && passive?.type === 'first_round_dmg') myDmg = Math.round(myDmg * (1 + passive.value));
        if (rounds >= 3 && passive?.type === 'late_game_dmg') myDmg = Math.round(myDmg * (1 + passive.value));
        if (passive?.type === 'phys_dmg_bonus') myDmg = Math.round(myDmg * (1 + passive.value));
        if (passive?.type === 'berserk' && heroHp < maxHp * 0.5) myDmg = Math.round(myDmg * (1 + passive.value));
        const isDoubleStrike = passive?.type === 'double_strike' && Math.random() < passive.value;
        if (isDoubleStrike) myDmg = Math.round(myDmg * 1.8);

        // 暴击判定
        const heroCrit = heroBase?.crit || 10;
        const isCrit = Math.random() * 100 < heroCrit;
        if (isCrit) myDmg = Math.round(myDmg * 1.6);

        if (heroCard) { heroCard.style.filter = ''; heroCard.style.transform = ''; }

        bossHp = Math.max(0, bossHp - myDmg);
        updateHpBar('boss');

        const critTag = isCrit ? ' <span style="color:#ff7043;font-weight:700">💥暴击!</span>' : '';
        const dsTag = isDoubleStrike ? ' <span style="color:#ce93d8">✨连击!</span>' : '';
        bLog(`<span style="color:#81c784">${heroBase.name}</span> ⚔️出击 <span style="color:#ef9a9a">${boss.name}</span>，造成 <b style="color:#ffab91">${myDmg}</b> 伤害${critTag}${dsTag}`);

        const bossCard = document.getElementById('bg-unit-boss');
        if (bossCard) {
          bossCard.style.transform = isCrit ? 'scale(0.85) rotate(-3deg)' : 'scale(0.92)';
          bossCard.style.filter = 'brightness(1.5) saturate(0.5)';
          setTimeout(() => { bossCard.style.transform = ''; bossCard.style.filter = bossHp <= 0 ? 'grayscale(1)' : ''; }, 250);
        }

        const clashColor = isCrit ? '#ff7043' : '#ffc107';
        setClash(`<div style="animation:fadeIn 0.2s"><span style="font-size:${isCrit?'28px':'22px'};font-weight:900;color:${clashColor};text-shadow:0 0 15px ${clashColor}55">${isCrit?'💥暴击！':''}-${myDmg}</span></div>`);
        showDmg('boss', isCrit ? `💥${myDmg}` : `-${myDmg}`, isCrit ? '#ff7043' : '#fff');

        if (window.effects) {
          if (isCrit) window.effects.screenShake(6, 300);
          else window.effects.screenShake(2, 150);
        }
        if (bossHp <= 0) {
          bLog(`<span style="color:#ef9a9a">${boss.name}</span> <span style="color:#ef5350">阵亡！</span> 💀`);
          setClash(`<div style="font-size:18px;color:#ef5350;animation:fadeIn 0.2s">💀 ${boss.name} 阵亡</div>`);
          break;
        }
        await wait(400);

        // 吕蒙：答对题回血
        if (passive?.type === 'quiz_heal' && lastQuizCorrect) {
          const healAmt = Math.round(maxHp * passive.value);
          heroHp = Math.min(maxHp, heroHp + healAmt);
          updateHpBar('hero');
          bLog(`<span style="color:#81c784">📚 ${heroBase.name} 被动回血 +${healAmt}</span>`);
          await wait(200);
        }

        // === BOSS反击 ===
        if (bossHp <= 0) break;
        if (bossCard) { bossCard.style.filter = 'brightness(1.3)'; bossCard.style.transform = 'scale(1.05)'; }
        await wait(200);

        let eDmg = Math.max(5, Math.round((bS.atk * 1.1 - getDef() * 0.6) * (0.85 + Math.random() * 0.3)));

        if (passive?.type === 'low_hp_def_double' && heroHp < maxHp * passive.value) eDmg = Math.max(1, Math.round(eDmg * 0.5));
        if (passive?.type === 'low_hp_def' && heroHp < maxHp * 0.4) eDmg = Math.max(1, Math.round(eDmg * 0.67));
        if (passive?.type === 'stun_chance' && Math.random() < passive.value) eDmg = 0;
        if (rounds === 1 && charmStun) eDmg = 0;

        if (bossCard) { bossCard.style.filter = ''; bossCard.style.transform = ''; }

        if (eDmg === 0) {
          bLog(`<span style="color:#ef9a9a">${boss.name}</span> 进攻，<span style="color:#64b5f6">被抵挡！</span>`);
          setClash(`<div style="font-size:14px;color:#64b5f6;animation:fadeIn 0.2s">🛡 ${heroBase.name} 抵挡！</div>`);
          showDmg('hero', '抵挡！', '#64b5f6');
        } else {
          heroHp = Math.max(0, heroHp - eDmg);
          updateHpBar('hero');
          bLog(`<span style="color:#ef9a9a">${boss.name}</span> ⚔️攻击 <span style="color:#81c784">${heroBase.name}</span>，造成 <b style="color:#ef9a9a">${eDmg}</b> 伤害`);
          setClash(`<div style="animation:fadeIn 0.2s"><span style="font-size:22px;font-weight:900;color:#ef5350;text-shadow:0 0 15px #ef535055">-${eDmg}</span></div>`);
          showDmg('hero', `-${eDmg}`, '#ef9a9a');
          if (heroCard) {
            heroCard.style.transform = 'scale(0.92)';
            heroCard.style.filter = 'brightness(1.5) saturate(0.5)';
            setTimeout(() => { heroCard.style.transform = ''; heroCard.style.filter = heroHp <= 0 ? 'grayscale(1)' : ''; }, 250);
          }
          if (window.effects) window.effects.screenShake(2, 150);
        }

        if (heroHp <= 0) {
          bLog(`<span style="color:#81c784">${heroBase.name}</span> <span style="color:#ef5350">阵亡！</span> 💀`);
          setClash(`<div style="font-size:18px;color:#ef5350;animation:fadeIn 0.2s">💀 ${heroBase.name} 阵亡</div>`);
          break;
        }

        // 曹操被动：每回合检查
        if (passive?.type === 'post_win_heal') { /* 战后处理 */ }

        await wait(400);
      }

      // ===== 同步回全局HP =====
      lastQuizCorrect = false;
      hp = Math.max(0, heroHp);
      const won = bossHp <= 0;

      // 被动：胜利后效果
      if (won) {
        const { exp: expG, coin: coinG } = bossReward(floor);
        gainExp(expG); coins += coinG;
        if (passive?.type === 'post_win_heal') { hp = Math.min(maxHp, hp + Math.round(maxHp * passive.value)); addLog(`👑 ${heroBase.name}被动：回血${Math.round(passive.value*100)}%`); }
        if (passive?.type === 'post_win_coin') { coins += passive.value; addLog(`☠️ ${heroBase.name}被动：+${passive.value}💰`); }
        addLog(`👹 击败BOSS ${boss.name}！+${expG}EXP +${coinG}💰`);
      } else {
        addLog(`👹 败给${boss.name}…`);
      }

      await wait(800);

      if (!won) {
        popup(`<div style="font-size:32px">💀</div>
          <h4>讨伐失败…</h4>
          <p style="font-size:13px;color:var(--text-light)">倒在第${floor}层</p>
          <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._dgOk()">查看结算</button>`);
        window._dgOk = () => { closePopup(); endDungeon(); resolve(); };
        return;
      }

      // 胜利：BOSS掉落装备
      const bossRarity = floor >= 10 ? 'legend' : floor >= 4 ? 'rare' : 'common';
      const dropWeapon = Math.random() < 0.5;
      const bossDrop   = dropWeapon ? randomWeapon(bossRarity) : randomArmor(bossRarity);
      const dropType   = dropWeapon ? 'weapon' : 'armor';
      const rc = RARITY_COLOR[bossDrop.rarity];
      const rn = RARITY_NAME[bossDrop.rarity];
      const old = equip[dropType];
      equip[dropType] = bossDrop;
      maxHp = getMaxHp();
      addLog(`${bossDrop.icon} BOSS掉落：${bossDrop.name}`);

      floor++;
      hp = Math.min(maxHp, hp + Math.round(maxHp * 0.3));
      addLog(`🚩 进入第${floor}层！回血30%`);

      const statText = dropWeapon ? `ATK +${bossDrop.atk}` : `DEF +${bossDrop.def}  HP +${bossDrop.hp}`;
      popup(`<div style="font-size:32px">🎉</div>
        <h4>击败${boss.name}！进入第${floor}层</h4>
        <div style="margin:10px 0;padding:10px;background:#fffde7;border-radius:10px;border:1.5px solid ${rc}">
          <div style="font-size:28px">${bossDrop.icon}</div>
          <div style="font-size:11px;color:${rc};font-weight:700">${rn}装备掉落！</div>
          <div style="font-size:14px;font-weight:700;margin:2px 0">${bossDrop.name}</div>
          <div style="font-size:12px;color:#666">${statText}</div>
          ${old ? `<div style="font-size:11px;color:#999">（替换 ${old.icon}${old.name}）</div>` : ''}
        </div>
        <p id="dg-countdown" style="font-size:12px;color:#999;margin:4px 0">3秒后自动进入下一层…</p>
        <button class="btn btn-primary" style="width:100%;margin-top:4px" onclick="window._dgOk2()">立即进入！</button>`);
      let cd = 3;
      const cdTimer = setInterval(() => {
        cd--;
        const el = document.getElementById('dg-countdown');
        if (el) el.textContent = cd > 0 ? `${cd}秒后自动进入下一层…` : '正在进入…';
        if (cd <= 0) { clearInterval(cdTimer); window._dgOk2(); }
      }, 1000);
      window._dgOk2 = () => { clearInterval(cdTimer); closePopup(); genMap(); render(); resolve(); };
    }

    runBossFight().catch(e => {
      console.error('[dungeon] boss fight error:', e);
      // 出错时强制进入下一层，不卡死
      floor++;
      hp = Math.min(maxHp, hp + Math.round(maxHp * 0.3));
      closePopup();
      genMap();
      render();
      resolve();
    });
  });
}

// 出口（直接找BOSS，不用出口了——BOSS就是过关条件）
async function doExit() {
  // 出口只在非最终层出现，走到这里直接进下一层
  floor++;
  hp=Math.min(maxHp,hp+Math.round(maxHp*0.2));
  addLog(`🚩 发现暗道！进入第${floor}层 回血20%`);
  genMap();
  render();
}

// ===== 结束 =====
// 主动结算（玩家点击结束按钮）
function quitDungeon() {
  popup(`<div style="font-size:36px">🏳️</div>
    <h4>确认结束探险？</h4>
    <p style="font-size:12px;color:var(--text-light);margin:6px 0">当前第 <b>${floor}</b> 层，将按当前进度结算奖励</p>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-primary" style="flex:1;background:linear-gradient(135deg,#ef5350,#c62828)" onclick="window._dgQuitOk()">确认结算</button>
      <button class="btn" style="flex:1;background:#f5f5f5;color:#333;border:none" onclick="window._dgQuitCancel()">继续探险</button>
    </div>`);
  window._dgQuitOk    = () => { closePopup(); endDungeon(); };
  window._dgQuitCancel = () => { closePopup(); };
}

function endDungeon() {
  active = false;
  saveBestFloor(floor); // 记录历史最深层，用于下次扫荡
  // 奖励按层数递增：金币取探险累计×50%，抽卡积分 = 层数×4 + 基础8
  const gold  = Math.max(1, Math.floor(coins * 0.35));
  const gacha = 4 + floor * 2;
  if (gold  > 0) gameState.addGold(gold);
  if (gacha > 0) gameState.addGachaCoins(gacha);
  gameState.recordDungeonRun(floor);

  // 层数评级
  const rank = floor >= 20 ? '👑 传奇' : floor >= 10 ? '🥇 英雄' : floor >= 5 ? '🥈 勇士' : '🥉 新兵';

  popup(`<div style="font-size:40px">💀</div>
    <h3>探险结束</h3>
    <div style="font-size:22px;font-weight:800;margin:6px 0">${rank}</div>
    <div style="margin:12px 0;padding:10px;background:#f5f5f5;border-radius:10px;font-size:13px;text-align:left">
      <div>📍 最深到达第 <b>${floor}</b> 层 · 探险Lv${dgLv}</div>
      <div>💰 探险金币: ${coins}</div>
      ${equip.weapon ? `<div>${equip.weapon.icon} 武器: ${equip.weapon.name} (ATK+${equip.weapon.atk})</div>` : ''}
      ${equip.armor  ? `<div>${equip.armor.icon}  防具: ${equip.armor.name}  (DEF+${equip.armor.def} HP+${equip.armor.hp})</div>` : ''}
      <div>✨ Buff: ${buffs.length}个</div>
    </div>
    <div style="padding:10px;background:#fff8e1;border-radius:10px;margin-bottom:12px">
      <p style="font-size:16px;font-weight:700;color:#f5a623">💰+${gold}金币 &nbsp; 💎+${gacha}抽卡积分</p>
      <p style="font-size:11px;color:#999">层数越深，下次奖励越多！</p>
    </div>
    <button class="btn btn-primary" style="width:100%" onclick="window._dgOk()">返回</button>`);
  window._dgOk = () => { closePopup(); renderLobby(); };
}

// ===== 辅助 =====
function rBuff(){
  const p=[{n:'锋刃',e:'atk',v:15,i:'⚔️'},{n:'铁壁',e:'def',v:10,i:'🛡️'},{n:'鹰眼',e:'crit',v:8,i:'🎯'},{n:'疾风',e:'spd',v:12,i:'💨'}];
  return p[Math.floor(Math.random()*p.length)];
}
function addLog(m){logs.unshift(m);if(logs.length>20)logs.pop()}
function el(id){return document.getElementById(id)}
function popup(h){closePopup();const d=document.createElement('div');d.id='dg-pop';d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:500;padding:20px';d.innerHTML=`<div style="background:white;border-radius:20px;padding:20px;max-width:340px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2)">${h}</div>`;document.body.appendChild(d)}
function closePopup(){const p=document.getElementById('dg-pop');if(p)p.remove()}
