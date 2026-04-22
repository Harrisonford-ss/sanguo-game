// 三国志探险 - 三国大富翁（三方势力版）v45
// 刘备(玩家) vs 曹操(AI) vs 孙权(AI)，占城需答3题中2题且花费金币

import { gameState } from './state.js';
import { monopolyQuizBank } from '../data/monopoly-quiz.js';

// ===== 棋盘：扩容至~72格，城池遍布全图 =====
// 图结构棋盘：每格含 next 数组，分叉口随机选路
// 4个分叉口：洛阳(04)、兖州(12)、柴桑(22)、荆州(51)
const BOARD = [
  // ===== 外圈顺时针 (00-38) =====
  /* 00 */ { type:'city',  id:'changan',  name:'长安',  k:'wei', desc:'西汉旧都，关中重镇',     major:true,  x:18, y:22, next:[1]      },
  /* 01 */ { type:'empty', x:23, y:15, next:[2]      },
  /* 02 */ { type:'city',  id:'jinyang',  name:'晋阳',  k:'wei', desc:'并州重镇，抵御北方外族', major:false, x:28, y:9,  next:[3]      },
  /* 03 */ { type:'empty', x:37, y:7,  next:[4]      },
  /* 04 */ { type:'city',  id:'luoyang',  name:'洛阳',  k:'wei', desc:'东汉都城，天下之中',     major:false, x:45, y:7,  next:[5,39]   }, // ✦分叉：外圈→邺城 | 捷径→官渡
  /* 05 */ { type:'empty', x:55, y:7,  next:[6]      },
  /* 06 */ { type:'city',  id:'yecheng',  name:'邺城',  k:'wei', desc:'铜雀台所在，袁绍旧地',   major:false, x:63, y:8,  next:[7]      },
  /* 07 */ { type:'empty', x:72, y:10, next:[8]      },
  /* 08 */ { type:'city',  id:'qingzhou', name:'青州',  k:'wei', desc:'海岱之要，袁谭据守之地', major:false, x:81, y:14, next:[9]      },
  /* 09 */ { type:'event', icon:'📜',     x:88, y:19, next:[10]     },
  /* 10 */ { type:'city',  id:'xiapi',    name:'下邳',  k:'wei', desc:'吕布白门楼殒命处',       major:false, x:93, y:26, next:[11]     },
  /* 11 */ { type:'empty', x:93, y:33, next:[12]     },
  /* 12 */ { type:'city',  id:'yanzhou',  name:'兖州',  k:'wei', desc:'曹操早期根据地',         major:false, x:92, y:40, next:[13,44]  }, // ✦分叉：外圈→寿春 | 捷径→许昌
  /* 13 */ { type:'event', icon:'⚔️',     x:91, y:47, next:[14]     },
  /* 14 */ { type:'city',  id:'shouchun', name:'寿春',  k:'wei', desc:'袁术称帝处，淮南重镇',   major:false, x:90, y:54, next:[15]     },
  /* 15 */ { type:'empty', x:91, y:60, next:[16]     },
  /* 16 */ { type:'city',  id:'hefei',    name:'合肥',  k:'wei', desc:'张辽威震逍遥津',         major:false, x:92, y:65, next:[17]     },
  /* 17 */ { type:'empty', x:89, y:70, next:[18]     },
  /* 18 */ { type:'city',  id:'jianye',   name:'建业',  k:'wu',  desc:'东吴都城（今南京）',     major:true,  x:85, y:75, next:[19]     },
  /* 19 */ { type:'empty', x:81, y:81, next:[20]     },
  /* 20 */ { type:'city',  id:'kuaiji',   name:'会稽',  k:'wu',  desc:'孙策奠基之地，东吴腹地', major:false, x:76, y:86, next:[21]     },
  /* 21 */ { type:'event', icon:'🌊',     x:68, y:90, next:[22]     },
  /* 22 */ { type:'city',  id:'chaisang', name:'柴桑',  k:'wu',  desc:'周瑜出兵赤壁之地',       major:false, x:59, y:92, next:[23,52]  }, // ✦分叉：外圈→长沙 | 捷径→江夏
  /* 23 */ { type:'empty', x:50, y:93, next:[24]     },
  /* 24 */ { type:'city',  id:'changsha', name:'长沙',  k:'wu',  desc:'黄忠老将镇守之地',       major:false, x:41, y:92, next:[25]     },
  /* 25 */ { type:'empty', x:32, y:90, next:[26]     },
  /* 26 */ { type:'city',  id:'wuchang',  name:'武昌',  k:'wu',  desc:'孙权称帝之地',           major:false, x:26, y:88, next:[27]     },
  /* 27 */ { type:'empty', x:21, y:85, next:[28]     },
  /* 28 */ { type:'city',  id:'chibi',    name:'赤壁',  k:'wu',  desc:'火烧赤壁，三分天下',     major:true,  x:17, y:83, next:[29]     },
  /* 29 */ { type:'empty', x:10, y:78, next:[30]     },
  /* 30 */ { type:'city',  id:'yiling',   name:'夷陵',  k:'wu',  desc:'火烧连营七百里，刘备大败', major:false, x:7, y:73, next:[31]   },
  /* 31 */ { type:'event', icon:'⚡',      x:5,  y:66, next:[32]     },
  /* 32 */ { type:'empty', x:5,  y:59, next:[33]     },
  /* 33 */ { type:'city',  id:'yongan',   name:'永安',  k:'shu', desc:'蜀吴边境，刘备托孤前哨', major:false, x:5,  y:52, next:[34]     },
  /* 34 */ { type:'empty', x:5,  y:45, next:[35]     },
  /* 35 */ { type:'city',  id:'chengdu',  name:'成都',  k:'shu', desc:'蜀汉都城，天府之国',     major:true,  x:5,  y:38, next:[36]     },
  /* 36 */ { type:'event', icon:'🌾',     x:6,  y:31, next:[37]     },
  /* 37 */ { type:'city',  id:'luocheng', name:'雒城',  k:'shu', desc:'庞统中箭陨落之地',       major:false, x:7,  y:24, next:[38]     },
  /* 38 */ { type:'empty', x:12, y:23, next:[0]      }, // → 长安

  // ===== 捷径B：洛阳 → 长安 (39-43) =====
  /* 39 */ { type:'empty', x:42, y:12, next:[40]     },
  /* 40 */ { type:'city',  id:'guandu',   name:'官渡',  k:'wei', desc:'官渡之战奠定北方霸权',   major:false, x:37, y:18, next:[41]     },
  /* 41 */ { type:'event', icon:'📜',     x:31, y:23, next:[42]     },
  /* 42 */ { type:'city',  id:'jiameng',  name:'葭萌',  k:'shu', desc:'刘备入蜀的落脚点',       major:false, x:25, y:32, next:[43]     },
  /* 43 */ { type:'empty', x:21, y:27, next:[0]      }, // → 长安

  // ===== 捷径C：兖州 → 荆州 (44-50) =====
  /* 44 */ { type:'empty', x:82, y:38, next:[45]     },
  /* 45 */ { type:'city',  id:'xuchang',  name:'许昌',  k:'wei', desc:'曹操挟天子以令诸侯',     major:false, x:68, y:38, next:[46]     },
  /* 46 */ { type:'empty', x:64, y:33, next:[47]     },
  /* 47 */ { type:'city',  id:'wancheng', name:'宛城',  k:'contested', desc:'张绣据守，曹操受重创', major:false, x:60, y:32, next:[48] },
  /* 48 */ { type:'empty', x:56, y:28, next:[49]     },
  /* 49 */ { type:'city',  id:'runan',    name:'汝南',  k:'wei', desc:'豫州粮仓，袁绍故地',     major:false, x:52, y:26, next:[50]     },
  /* 50 */ { type:'event', icon:'⚔️',     x:52, y:42, next:[51]     }, // → 荆州

  // ===== 荆州枢纽 (51) =====
  /* 51 */ { type:'city',  id:'jingzhou', name:'荆州',  k:'contested', desc:'兵家必争，三国交汇枢纽', major:true, x:52, y:60, next:[55] },

  // ===== 捷径D：柴桑 → 荆州 (52-54) =====
  /* 52 */ { type:'event', icon:'🌊',     x:67, y:82, next:[53]     },
  /* 53 */ { type:'city',  id:'jiangxia', name:'江夏',  k:'wu',  desc:'刘表旧地，水军要塞',     major:false, x:63, y:68, next:[54]     },
  /* 54 */ { type:'empty', x:57, y:64, next:[51]     }, // → 荆州

  // ===== 捷径E：荆州 → 成都 (55-63) =====
  /* 55 */ { type:'empty', x:44, y:65, next:[56]     },
  /* 56 */ { type:'city',  id:'xinye',    name:'新野',  k:'shu', desc:'刘备起兵之地，火烧新野', major:false, x:42, y:68, next:[57]     },
  /* 57 */ { type:'empty', x:36, y:63, next:[58]     },
  /* 58 */ { type:'city',  id:'shangyong',name:'上庸',  k:'contested', desc:'孟达据守，地处要冲', major:false, x:33, y:58, next:[59]   },
  /* 59 */ { type:'empty', x:28, y:54, next:[60]     },
  /* 60 */ { type:'city',  id:'hanzhong', name:'汉中',  k:'shu', desc:'北伐基地，定军山之战',   major:false, x:26, y:50, next:[61]     },
  /* 61 */ { type:'event', icon:'🌾',     x:20, y:47, next:[62]     },
  /* 62 */ { type:'city',  id:'jiange',   name:'剑阁',  k:'shu', desc:'一夫当关，万夫莫开',     major:false, x:15, y:44, next:[63]     },
  /* 63 */ { type:'empty', x:10, y:41, next:[35]     }, // → 成都
];

const N = BOARD.length;
const KC = { wei:'#4a90d9', shu:'#4caf50', wu:'#ef5350', contested:'#ff9800' };
const WIN_CITIES = 12;

// 占领城池花费（major城多一些）
const CITY_COST = { major: 10, minor: 5 };

const EVENTS = [
  { text:'🌾 丰收！+5金', fn: p => p.coins += 5 },
  { text:'🏥 瘟疫！-3金', fn: p => p.coins = Math.max(0, p.coins - 3) },
  { text:'🐴 良马！再掷一次骰子', fn: p => p.extraRoll = true },
  { text:'📜 兵书！+8金', fn: p => p.coins += 8 },
  { text:'💰 商队！+10金', fn: p => p.coins += 10 },
  { text:'🎯 神射手！对战+5', fn: p => p.buff += 5 },
  { text:'🔥 借东风！免费占下一座空城', fn: p => p.freeCity = true },
  { text:'🕊️ 太平！每座己城+2金', fn: p => p.coins += p.cities.length * 2 },
  { text:'💂 征兵！+5兵力', fn: p => { p.troops = Math.min(MAX_TROOPS, p.troops + 5); } },
  { text:'💂 大征兵！+8兵力', fn: p => { p.troops = Math.min(MAX_TROOPS, p.troops + 8); } },
];

// ===== 谋士卡池 =====
const ADVISOR_POOL = [
  { id:'zhugeliang', name:'诸葛亮', icon:'🪭', desc:'每回合收税+2金', effect:'tax+2' },
  { id:'simayi',     name:'司马懿', icon:'🦊', desc:'攻守骰子各+3',   effect:'combat+3' },
  { id:'zhouyu',     name:'周瑜',   icon:'🎵', desc:'攻城必胜一次',   effect:'sureWin' },
  { id:'xunyu',      name:'荀彧',   icon:'📋', desc:'占城额外+5金',   effect:'cityBonus+5' },
  { id:'pangtong',   name:'庞统',   icon:'🦅', desc:'每回合移动+1步', effect:'move+1' },
  { id:'jiaxu',      name:'贾诩',   icon:'🎭', desc:'使对方下回合-2骰', effect:'debuff' },
];
const MAX_ADVISORS = 2;
const SAVE_KEY = 'monopoly_save_v6';
const MAX_GARRISON = 20;  // 每城最多驻兵
const MAX_TROOPS   = 30;  // 兵力上限
const TROOP_REGEN  = 2;   // 每回合自动补充兵力
let garrison = {};        // { cityId: number } 各城驻兵数
// 升级费用：minor 6/10，major 10/14
const UPGRADE_COST_MAJOR = [0, 10, 14];
const UPGRADE_COST_MINOR = [0,  6, 10];
// 各等级城池基础税收：[Lv1, Lv2, Lv3]
const TAX_MINOR = [0,  5, 10, 15];
const TAX_MAJOR = [0, 10, 15, 20];
const UPGRADE_DEF  = [0,  0,  2,  3];
const UPGRADE_TAX  = [0,  0,  2,  4];  // 城池升级后过路税额外加成
// 城池变量事件：{ cityId: { type:'locust'|'harvest', rounds } }
let cityEvents = {};

// ===== 天灾事件 =====
const DISASTERS = [
  { name:'瘟疫', icon:'☠️', desc:'某城暴发瘟疫，失去占领2回合' },
  { name:'洪水', icon:'🌊', desc:'洪水冲毁城池，失去占领2回合' },
  { name:'火灾', icon:'🔥', desc:'大火烧毁城楼，失去占领1回合' },
];

// 玩家颜色：roof=屋顶亮色, eave=檐部中色, body=城墙深色, flag=旗帜色
const PLAYER_COLORS = {
  player: { roof:'#a5d6a7', eave:'#43a047', body:'#1b5e20', flag:'#f9fbe7', border:'#66bb6a', glow:'#69f0ae', label:'rgba(27,94,32,0.95)'  },
  ai:     { roof:'#90caf9', eave:'#1e88e5', body:'#0d47a1', flag:'#fff9c4', border:'#64b5f6', glow:'#40c4ff', label:'rgba(13,71,161,0.95)'  },
  ai2:    { roof:'#ffab91', eave:'#e53935', body:'#b71c1c', flag:'#fff8e1', border:'#ff5252', glow:'#ff5252', label:'rgba(183,28,28,0.95)'  },
};

let active = false, turn = 'player', rolling = false;
let round = 1, logs = [], ownership = {};
let P = {}, AI = {}, SQ = {};
let eliminated = new Set(); // 已破产退出的AI：'ai'|'ai2'
let cityLevels = {};
let disasterCities = {};
let movingPiece = null; // 'player'|'ai'|'ai2'|null，移动中的棋子

export function initMonopoly() {
  window.monopolyModule = { refresh, startGame, rollDice, settle, leaveGame };
  refresh();
}

function refresh() {
  const saved = loadSave();
  if (saved) {
    ({ P, AI, SQ, ownership, cityLevels, disasterCities, garrison, cityEvents, round, logs } = saved);
  garrison = garrison || {};
  cityEvents = cityEvents || {};
    active = true; rolling = false;
    turn = 'player';
    render();
  } else if (!active) {
    showStartScreen();
  } else {
    render();
  }
}

function showStartScreen() {
  const c = $('monopoly-container'); if (!c) return;
  const stamina = gameState.stamina;
  const gold = gameState.gold;
  const hasStamina = stamina >= 3;
  const hasGold = gold >= 30;
  const canStart = hasStamina && hasGold;

  const staminaColor = hasStamina ? '#52c41a' : '#ff4d4f';
  const goldColor    = hasGold    ? '#faad14' : '#ff4d4f';
  const btnBg = canStart
    ? 'linear-gradient(135deg,#f5a623 0%,#e8850a 100%)'
    : 'linear-gradient(135deg,#bbb 0%,#999 100%)';

  c.innerHTML = `
    <div style="min-height:100%;background:linear-gradient(160deg,#1a0a00 0%,#2d1200 40%,#1a0a00 100%);display:flex;flex-direction:column;overflow-y:auto">

      <!-- 顶部英雄区 -->
      <div style="position:relative;padding:28px 16px 20px;text-align:center;overflow:hidden;flex-shrink:0">
        <!-- 背景装饰圆 -->
        <div style="position:absolute;top:-30px;left:50%;transform:translateX(-50%);width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(245,166,35,0.18) 0%,transparent 70%);pointer-events:none"></div>
        <div style="position:relative;z-index:1">
          <div style="font-size:52px;line-height:1;filter:drop-shadow(0 4px 12px rgba(245,166,35,0.6))">🎲</div>
          <div style="margin-top:10px;font-size:24px;font-weight:900;color:#ffe082;letter-spacing:3px;text-shadow:0 2px 8px rgba(0,0,0,0.6)">三国大富翁</div>
          <div style="margin-top:4px;font-size:12px;color:rgba(255,224,130,0.55);letter-spacing:2px">三方争霸 · 占城称雄</div>
          <!-- 三方势力标签 -->
          <div style="display:flex;justify-content:center;gap:8px;margin-top:12px">
            <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(74,144,217,0.2);border:1px solid rgba(74,144,217,0.5);color:#90caf9">⚡ 曹魏</span>
            <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(76,175,80,0.2);border:1px solid rgba(76,175,80,0.5);color:#a5d6a7">🌟 蜀汉</span>
            <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(239,83,80,0.2);border:1px solid rgba(239,83,80,0.5);color:#ef9a9a">🔥 东吴</span>
          </div>
        </div>
      </div>

      <!-- 规则卡片 -->
      <div style="margin:0 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,224,130,0.2);border-radius:14px;padding:14px;flex-shrink:0">
        <div style="font-size:13px;font-weight:700;color:rgba(255,224,130,0.85);letter-spacing:1px;margin-bottom:10px">📖 游戏规则</div>
        <div style="display:flex;flex-direction:column;gap:7px">
          <div style="display:flex;align-items:flex-start;gap:8px">
            <span style="font-size:14px;flex-shrink:0;margin-top:1px">🎲</span>
            <span style="font-size:11.5px;color:rgba(255,255,255,0.75);line-height:1.5">每回合掷骰子在地图行军，随机触发事件</span>
          </div>
          <div style="display:flex;align-items:flex-start;gap:8px">
            <span style="font-size:14px;flex-shrink:0;margin-top:1px">🏰</span>
            <span style="font-size:11.5px;color:rgba(255,255,255,0.75);line-height:1.5">落在空城答题并花金币可占领（大城10金·小城5金）</span>
          </div>
          <div style="display:flex;align-items:flex-start;gap:8px">
            <span style="font-size:14px;flex-shrink:0;margin-top:1px">⚔️</span>
            <span style="font-size:11.5px;color:rgba(255,255,255,0.75);line-height:1.5">落在敌城掷骰对战，胜者掠夺金币并可夺城</span>
          </div>
          <div style="display:flex;align-items:flex-start;gap:8px">
            <span style="font-size:14px;flex-shrink:0;margin-top:1px">💰</span>
            <span style="font-size:11.5px;color:rgba(255,255,255,0.75);line-height:1.5">落在己城自动收税，升级城池提升税收</span>
          </div>
          <div style="display:flex;align-items:flex-start;gap:8px">
            <span style="font-size:14px;flex-shrink:0;margin-top:1px">📊</span>
            <span style="font-size:11.5px;color:rgba(255,255,255,0.75);line-height:1.5">结算时所有资产均可折算为积分</span>
          </div>
        </div>
      </div>

      <!-- 费用卡片 -->
      <div style="margin:10px 14px 0;background:rgba(255,255,255,0.05);border:1px solid rgba(255,224,130,0.2);border-radius:14px;padding:14px;flex-shrink:0">
        <div style="font-size:11px;font-weight:700;color:rgba(255,224,130,0.7);letter-spacing:1px;margin-bottom:10px">💸 开局费用</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:rgba(0,0,0,0.25);border-radius:10px;padding:10px;text-align:center;border:1px solid ${hasStamina?'rgba(82,196,26,0.35)':'rgba(255,77,79,0.35)'}">
            <div style="font-size:22px;font-weight:900;color:${staminaColor}">${stamina}<span style="font-size:11px;font-weight:400;color:rgba(255,255,255,0.4)"> / ${gameState.staminaMax}</span></div>
            <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:3px">当前体力</div>
            <div style="margin-top:5px;display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:${hasStamina?'rgba(82,196,26,0.15)':'rgba(255,77,79,0.15)'};color:${staminaColor}">
              ${hasStamina ? '消耗 -3 ✓' : '不足！'}
            </div>
          </div>
          <div style="background:rgba(0,0,0,0.25);border-radius:10px;padding:10px;text-align:center;border:1px solid ${hasGold?'rgba(250,173,20,0.35)':'rgba(255,77,79,0.35)'}">
            <div style="font-size:22px;font-weight:900;color:${goldColor}">${gold}<span style="font-size:11px;font-weight:400;color:rgba(255,255,255,0.4)"> 金</span></div>
            <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:3px">当前金币</div>
            <div style="margin-top:5px;display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:${hasGold?'rgba(250,173,20,0.15)':'rgba(255,77,79,0.15)'};color:${goldColor}">
              ${hasGold ? '消耗 -30 ✓' : '不足！'}
            </div>
          </div>
        </div>
        ${!hasGold ? `
        <div style="margin-top:10px;padding:7px 10px;background:rgba(255,152,0,0.12);border-radius:8px;display:flex;align-items:center;gap:6px">
          <span style="font-size:14px">💡</span>
          <span style="font-size:10.5px;color:rgba(255,193,7,0.85)">获取金币：完成每日任务 · 答题奖励 · 地图探险</span>
        </div>` : ''}
      </div>

      <!-- 底部按钮 -->
      <div style="display:flex;gap:10px;padding:14px 14px 20px;margin-top:auto;flex-shrink:0">
        <button style="flex:1;height:46px;border-radius:12px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.7);font-size:14px;cursor:pointer"
          onclick="window.app.navigate('home')">返回</button>
        <button style="flex:2.5;height:46px;border-radius:12px;border:none;background:${btnBg};color:${canStart?'#fff':'rgba(255,255,255,0.5)'};font-size:16px;font-weight:800;cursor:${canStart?'pointer':'not-allowed'};letter-spacing:1px;box-shadow:${canStart?'0 4px 16px rgba(245,166,35,0.45)':'none'}"
          onclick="${canStart?'window.monopolyModule.startGame()':'void 0'}">
          ${canStart ? '出征！🎲' : (!hasStamina ? '体力不足' : '金币不足')}
        </button>
      </div>
    </div>`;
}

function loadSave() {
  try {
    const s = localStorage.getItem(SAVE_KEY);
    if (!s) return null;
    const d = JSON.parse(s);
    if (!d.P || !d.AI || !d.SQ || !d.ownership) { clearSave(); return null; }
    d.P.advisors = d.P.advisors || [];
    d.AI.advisors = d.AI.advisors || [];
    d.SQ.advisors = d.SQ.advisors || [];
    d.P.extraRoll = d.P.extraRoll || false;
    d.AI.extraRoll = d.AI.extraRoll || false;
    d.SQ.extraRoll = d.SQ.extraRoll || false;
    d.P.troops  = d.P.troops  ?? 10;
    d.AI.troops = d.AI.troops ?? 10;
    d.SQ.troops = d.SQ.troops ?? 10;
    d.cityLevels = d.cityLevels || {};
    d.disasterCities = d.disasterCities || {};
    d.garrison = d.garrison || {};
    d.cityEvents = d.cityEvents || {};
    d.logs = d.logs || [];
    d.round = d.round || 1;
    return d;
  } catch { clearSave(); return null; }
}

function writeSave() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ P, AI, SQ, ownership, cityLevels, disasterCities, garrison, cityEvents, round, turn, logs }));
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

function calcTotalAssets(p, cities) {
  let cityValue = 0;
  for (const cid of cities) {
    const tile = TILES.find(t => t.id === cid);
    if (!tile) continue;
    const lv = cityLevels[cid] || 1;
    cityValue += (tile.major ? TAX_MAJOR[lv] : TAX_MINOR[lv]) * 3;
  }
  let totalTroops = p.troops;
  for (const cid of cities) totalTroops += garrison[cid] || 0;
  return p.coins + cityValue + totalTroops * 2;
}

function calcSettleScore() {
  const totalAssets = calcTotalAssets(P, P.cities);
  return Math.max(1, Math.floor(totalAssets / 10));
}

function settle() {
  if (!active) return;
  const won = P.cities.length >= AI.cities.length && P.cities.length >= SQ.cities.length;
  const earned = won ? P.coins : 0;
  if (earned > 0) gameState.addGold(earned);

  // 积分：获胜才计分；若资产非全场第一则减半
  let score = 0;
  let halved = false;
  if (won) {
    const pAssets  = calcTotalAssets(P,  P.cities);
    const aiAssets = calcTotalAssets(AI, AI.cities);
    const sqAssets = calcTotalAssets(SQ, SQ.cities);
    halved = pAssets < aiAssets || pAssets < sqAssets;
    const raw = Math.max(1, Math.floor(pAssets / 10));
    score = halved ? Math.max(1, Math.floor(raw / 2)) : raw;
  }
  gameState.recordMonopolySettle(score, won);
  if (window.authModule?.syncToCloud) window.authModule.syncToCloud().catch(() => {});

  clearSave();
  const scoreLine = score > 0
    ? `<p style="font-size:13px;color:#667eea;font-weight:700;margin:4px 0">+${score} 大富翁积分 · 已上榜${halved ? '（资产非第一，积分减半）' : ''}</p>`
    : `<p style="font-size:11px;color:#aaa;margin:4px 0">失败，本局不计积分</p>`;

  popup(`<div style="font-size:40px">${won ? '🏆' : '💰'}</div>
    <h3 style="margin:6px 0">${won ? '胜利结算！' : '结算'}</h3>
    <p style="font-size:22px;font-weight:700;color:#f5a623">+${earned} 金币</p>
    ${scoreLine}
    <p style="font-size:11px;color:#999;margin:4px 0 12px">城池 ${P.cities.length} 座 · 第${round}回合</p>
    <button class="btn btn-primary" style="width:100%" onclick="window._mc()">返回首页</button>`);
  window._mc = () => { closePopup(); active = false; showStartScreen(); };
}

function leaveGame() {
  writeSave();
  active = false;
  const c = $('monopoly-container'); if (!c) return;
  c.innerHTML = `<div style="padding:32px 20px;text-align:center">
    <div style="font-size:40px">💾</div>
    <h3 style="margin:8px 0">进度已保存</h3>
    <p style="font-size:13px;color:#888">下次进入大富翁时可继续游戏</p>
    <p style="font-size:12px;color:#aaa;margin-top:4px">当前金币 ${P.coins} 💰 · 城池 ${P.cities.length} 座</p>
  </div>`;
}

function startGame() {
  // 如果已有存档，恢复存档而不是开新局（防止刷新重复扣钱）
  const existing = loadSave();
  if (existing) { refresh(); return; }
  // 扣除体力（3点）
  const s1 = gameState.spendStamina();
  const s2 = gameState.spendStamina();
  const s3 = gameState.spendStamina();
  if (!s1 || !s2 || !s3) {
    // 体力不足，退还已扣体力（不太可能，因为开始界面已校验）
    showStartScreen(); return;
  }
  const stake = 30;
  const deducted = gameState.spendGold(stake);
  const startCoins = deducted ? stake : 0;
  active = true; turn = 'player'; rolling = false; round = 1;
  logs = []; ownership = {}; eliminated = new Set();
  P  = { pos:0,  cities:[], coins:startCoins, bonus:0, buff:0, freeCity:false, extraRoll:false, advisors:[], debuff:0, sureWin:false, troops:10 };
  AI = { pos:18, cities:[], coins:30, bonus:0, buff:0, freeCity:false, extraRoll:false, advisors:[], debuff:0, sureWin:false, troops:10 };
  SQ = { pos:35, cities:[], coins:30, bonus:0, buff:0, freeCity:false, extraRoll:false, advisors:[], debuff:0, sureWin:false, troops:10 };
  cityLevels = {};
  disasterCities = {};
  garrison = {};
  cityEvents = {};
  clearSave();
  render();
}

// ===== 主渲染：骨架只建一次 =====
function render() {
  const c = $('monopoly-container'); if (!c) return;

  if (!$('m-board')) {
    c.innerHTML = `
      <div id="m-status" style="height:62px;flex-shrink:0;border-bottom:1px solid rgba(0,0,0,0.06);overflow:hidden"></div>
      <div id="m-board" style="flex-shrink:0;padding:0 4px;width:100%;box-sizing:border-box"></div>
      <div id="m-ctrl" style="height:56px;flex-shrink:0;padding:4px 8px;display:flex;align-items:center;justify-content:center;gap:8px;overflow:hidden"></div>
      <div id="m-log" style="height:38px;flex-shrink:0;padding:2px 10px;overflow:hidden"></div>
      <div id="m-advisors" style="flex-shrink:0"></div>
      <details style="margin:4px 10px 8px;border-radius:10px;overflow:hidden;background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.07);flex-shrink:0">
        <summary style="padding:7px 12px;font-size:11px;font-weight:700;color:#888;cursor:pointer;list-style:none;display:flex;align-items:center;gap:5px">
          <span>📖</span> 游戏规则 <span style="margin-left:auto;font-size:10px;opacity:0.6">点击展开</span>
        </summary>
        <div style="padding:8px 12px 10px;display:grid;grid-template-columns:1fr 1fr;gap:5px;border-top:1px solid rgba(0,0,0,0.06)">
          <div style="font-size:10.5px;color:#555;display:flex;align-items:center;gap:4px"><span>🎲</span> 掷骰子在地图行军</div>
          <div style="font-size:10.5px;color:#555;display:flex;align-items:center;gap:4px"><span>🏰</span> 答3题中2题+花金币占城</div>
          <div style="font-size:10.5px;color:#555;display:flex;align-items:center;gap:4px"><span>⚔️</span> 掷骰对战抢敌城</div>
          <div style="font-size:10.5px;color:#555;display:flex;align-items:center;gap:4px"><span>💰</span> 己城每回合收税</div>
          <div style="font-size:10.5px;color:#e65100;display:flex;align-items:center;gap:4px;grid-column:span 2"><span>👑</span> 小城-5💰 大城-10💰，随时可结算</div>
        </div>
      </details>`;
  }

  renderStatus();
  renderCtrl();
  renderLog();
  renderAdvisors();
  renderBoard();
  // 每次渲染后自动保存，防止刷新丢失进度
  if (active) writeSave();
}

function renderStatus() {
  const el = $('m-status'); if (!el) return;
  const pA = turn==='player', aA = turn==='ai', sA = turn==='ai2';

  // 首次渲染：建立静态结构（头像图片只创建一次，避免重建导致闪烁）
  if (!el.dataset.built) {
    el.dataset.built = '1';
    const players = [
      { key:'p',  label:'刘备', img:'images/characters/liubei.webp',  col:'#4caf50' },
      { key:'ai', label:'曹操', img:'images/characters/caocao.webp',  col:'#4a90d9' },
      { key:'sq', label:'孙权', img:'images/characters/sunquan.webp', col:'#ef5350' },
    ];
    el.innerHTML = `<div id="m-status-inner" style="display:flex;align-items:center;padding:6px 8px;gap:4px;font-size:12px;
      background:linear-gradient(135deg,rgba(102,126,234,0.07),rgba(118,75,162,0.07));height:100%;box-sizing:border-box">
      ${players.map((p, i) => `
        ${i===1 ? `<div style="text-align:center;flex-shrink:0;min-width:20px">
          <div style="font-size:11px">⚔️</div>
          <div id="m-round-label" style="font-size:8px;color:#bbb">${round}回</div>
        </div>` : i===2 ? '<div style="min-width:4px"></div>' : ''}
        <div id="m-slot-${p.key}" data-col="${p.col}" style="flex:1;padding:5px 6px;border-radius:9px;display:flex;align-items:center;gap:6px;
          background:rgba(0,0,0,0.03);border:1.5px solid rgba(0,0,0,0.06);transition:background 0.25s,border-color 0.25s,box-shadow 0.25s">
          <div style="position:relative;flex-shrink:0">
            <img src="${p.img}" width="36" height="36" style="border-radius:50%;border:2px solid ${p.col};display:block;object-fit:cover;
              box-shadow:0 2px 8px rgba(0,0,0,0.15)">
            <div id="m-dot-${p.key}" style="display:none;position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;border-radius:50%;
              background:${p.col};border:1.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>
          </div>
          <div style="min-width:0;flex:1">
            <div style="font-weight:800;font-size:12px;line-height:1.2;white-space:nowrap">${p.label}</div>
            <div id="m-stats-${p.key}" style="font-size:9px;color:#777;margin-top:1px">🏰<b>0</b> &nbsp;💰<b>0</b></div>
          </div>
          <div id="m-badge-${p.key}" style="display:none;font-size:8px;color:white;padding:2px 5px;border-radius:5px;font-weight:700;white-space:nowrap;flex-shrink:0;background:${p.col}">行动中</div>
        </div>`).join('')}
    </div>`;
  }

  // 增量更新：只修改样式和数据，不重建DOM（避免图片闪烁）
  const configs = [
    { key:'p',  active:pA, col:'#4caf50', rgb:'76,175,80',   cities:P.cities.length,  coins:P.coins,  troops:P.troops  },
    { key:'ai', active:aA, col:'#4a90d9', rgb:'74,144,217',  cities:AI.cities.length, coins:AI.coins, troops:AI.troops },
    { key:'sq', active:sA, col:'#ef5350', rgb:'239,83,80',   cities:SQ.cities.length, coins:SQ.coins, troops:SQ.troops },
  ];
  for (const c of configs) {
    const slot  = document.getElementById(`m-slot-${c.key}`);
    const dot   = document.getElementById(`m-dot-${c.key}`);
    const badge = document.getElementById(`m-badge-${c.key}`);
    const stats = document.getElementById(`m-stats-${c.key}`);
    if (!slot) continue;
    if (c.active) {
      slot.style.background  = `rgba(${c.rgb},0.12)`;
      slot.style.border      = `1.5px solid ${c.col}`;
      slot.style.boxShadow   = `0 0 8px rgba(${c.rgb},0.2)`;
    } else {
      slot.style.background  = 'rgba(0,0,0,0.03)';
      slot.style.border      = '1.5px solid rgba(0,0,0,0.06)';
      slot.style.boxShadow   = 'none';
    }
    if (dot)   dot.style.display   = c.active ? 'block' : 'none';
    if (badge) badge.style.display = c.active ? 'block' : 'none';
    if (stats) stats.innerHTML = `🏰<b>${c.cities}</b> &nbsp;💰<b>${c.coins}</b> &nbsp;⚔️<b>${c.troops}</b>`;
  }
  const roundLabel = document.getElementById('m-round-label');
  if (roundLabel) roundLabel.textContent = `${round}回`;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function renderCtrl() {
  const el = $('m-ctrl'); if (!el) return;
  const pActive = turn==='player', npc = turn==='ai'||turn==='ai2';
  el.innerHTML = pActive && !rolling ? `
    <button onclick="window.monopolyModule.rollDice()" style="
      padding:10px 16px;font-size:17px;border:none;border-radius:12px;cursor:pointer;
      background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-weight:700;
      box-shadow:0 3px 12px rgba(102,126,234,0.35);font-family:inherit">🎲 掷骰子</button>
    <button onclick="window.monopolyModule.settle()" style="
      padding:10px 10px;font-size:13px;border:none;border-radius:12px;cursor:pointer;
      background:linear-gradient(135deg,#f5a623,#e67e00);color:white;font-weight:700;
      box-shadow:0 3px 10px rgba(245,166,35,0.35);font-family:inherit;white-space:nowrap">💰 结算</button>
    <button onclick="window.monopolyModule.leaveGame()" style="
      padding:10px 10px;font-size:13px;border:none;border-radius:12px;cursor:pointer;
      background:rgba(0,0,0,0.08);color:#666;font-weight:700;
      font-family:inherit;white-space:nowrap">💾 离开</button>`
  : `<span style="color:#bbb;font-size:12px">${turn==='ai'?'🐴 曹操行动中...':turn==='ai2'?'👑 孙权行动中...':'⏳'}</span>`;
}

function renderLog() {
  const el = $('m-log'); if (!el) return;
  el.innerHTML = logs.length
    ? logs.slice(0,3).map(m=>`<div style="font-size:10px;color:#aaa;padding:1px 0">${m}</div>`).join('')
    : '<div style="font-size:10px;color:#ccc;padding:1px 0">游戏开始，轮到你行动！</div>';
}

function renderAdvisors() {
  const el = $('m-advisors'); if (!el) return;
  el.innerHTML = P.advisors.length ? `<div style="padding:3px 10px;display:flex;gap:5px;flex-wrap:wrap">
    ${P.advisors.map(a=>`<span style="font-size:10px;background:linear-gradient(135deg,#fff8e1,#ffe082);border:1px solid #ffb300;border-radius:6px;padding:2px 6px;font-weight:700" title="${a.desc}">${a.icon}${a.name}</span>`).join('')}
  </div>` : '';
}

// ===== 地图棋盘：分层渲染 =====
let boardInitDone = false;

function renderBoard() {
  const el = $('m-board'); if (!el) return;
  if (!boardInitDone || !$('m-board-wrap')) {
    _buildBoardBase(el);
    boardInitDone = true;
  }
  _renderCities();
  _renderPieces();
}

function _buildBoardBase(el) {
  let svg = '';
  // 路线（按图结构 next 连接绘制，避免重复）
  const _drawnEdges = new Set();
  BOARD.forEach((a, i) => {
    (a.next || []).forEach(j => {
      const key = `${Math.min(i,j)}-${Math.max(i,j)}`;
      if (_drawnEdges.has(key)) return;
      _drawnEdges.add(key);
      const b = BOARD[j];
      svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="white" stroke-width="2.8" opacity="0.5" stroke-linecap="round"/>`;
      svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#8d6e4a" stroke-width="1.4" stroke-dasharray="3,3" opacity="0.72" stroke-linecap="round"/>`;
    });
  });

  // 静态格子：事件格 + 空白格
  let staticHtml = '';
  BOARD.forEach(t => {
    if (t.type === 'event') {
      // 不同事件类型配不同风格
      const eventStyles = {
        '📜': { bg:'linear-gradient(135deg,#fff8e1,#ffe082)', border:'#f9a825', shadow:'rgba(249,168,37,0.45)', shape:'4px' },
        '⚔️': { bg:'linear-gradient(135deg,#ffcdd2,#ef5350)', border:'#b71c1c', shadow:'rgba(183,28,28,0.45)', shape:'3px' },
        '🌊': { bg:'linear-gradient(135deg,#b3e5fc,#0288d1)', border:'#01579b', shadow:'rgba(1,87,155,0.4)',  shape:'50%' },
        '⚡': { bg:'linear-gradient(135deg,#fff9c4,#ffd600)', border:'#f57f17', shadow:'rgba(245,127,23,0.4)', shape:'0 8px 0 8px' },
        '🌾': { bg:'linear-gradient(135deg,#dcedc8,#7cb342)', border:'#33691e', shadow:'rgba(51,105,30,0.4)',  shape:'6px' },
      };
      const es = eventStyles[t.icon] || { bg:'linear-gradient(135deg,#fff9c4,#ffe082)', border:'#ffb300', shadow:'rgba(0,0,0,0.18)', shape:'50%' };
      staticHtml += `<div style="position:absolute;left:${t.x}%;top:${t.y}%;transform:translate(-50%,-50%);z-index:2;
        width:26px;height:26px;border-radius:${es.shape};
        background:${es.bg};
        border:2px solid ${es.border};
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px ${es.shadow},inset 0 1px 2px rgba(255,255,255,0.6)">
        <span style="font-size:13px;line-height:1;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.25))">${t.icon}</span>
      </div>`;
    } else if (t.type === 'empty') {
      staticHtml += `<div style="position:absolute;left:${t.x}%;top:${t.y}%;transform:translate(-50%,-50%) rotate(45deg);z-index:1;
        width:10px;height:10px;border-radius:2px;
        background:rgba(160,130,80,0.75);
        border:1.5px solid rgba(120,90,40,0.9);
        box-shadow:0 1px 3px rgba(0,0,0,0.25)">
      </div>`;
    }
  });

  el.innerHTML = `<div id="m-board-wrap" style="position:relative;width:100%;padding-top:75%;
    background:url('images/monopoly_map_bg.webp') center/cover;
    border-radius:14px;overflow:visible;box-shadow:0 4px 16px rgba(0,0,0,0.12);
    transform:translateZ(0);isolation:isolate">
    <div style="position:absolute;inset:0;border-radius:14px;background:rgba(255,248,225,0.32)"></div>
    <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" viewBox="0 0 100 100" preserveAspectRatio="none">${svg}</svg>
    ${staticHtml}
    <div id="m-board-cities" style="position:absolute;inset:0;pointer-events:none"></div>
    <div id="m-board-pieces" style="position:absolute;inset:0;pointer-events:none"></div>
  </div>`;
}

function _cityTileSvg(t) {
  const rawOwn = t.id ? ownership[t.id] : null;
  const own = rawOwn === 'disaster' ? null : rawOwn;
  const isDisaster = rawOwn === 'disaster';
  const sz = t.major ? 50 : 34;
  const lv = cityLevels[t.id] || 1;

  // 颜色体系：roof=屋顶亮色 eave=檐部中色 body=城墙深色 flag=旗色
  let roof, eave, body, flag, labelBg, glowColor;
  if (isDisaster) {
    roof='#e040fb'; eave='#8e24aa'; body='#4a148c'; flag='#fff'; labelBg='rgba(74,20,140,0.95)'; glowColor='#e040fb';
  } else if (own) {
    const c = PLAYER_COLORS[own];
    roof=c.roof; eave=c.eave; body=c.body; flag=c.flag; labelBg=c.label; glowColor=c.glow;
  } else {
    roof='#e8e8e8'; eave='#bdbdbd'; body='#9e9e9e'; flag='#f5f5f5'; labelBg='rgba(80,80,80,0.75)'; glowColor=null;
  }

  const glowStyle = '';
  const lvStars = lv > 1 ? '⭐'.repeat(lv-1) : '';
  const cost = t.major ? CITY_COST.major : CITY_COST.minor;

  // 阴影色（body加深）
  const shadow = 'rgba(0,0,0,0.32)';

  const pw = 40, ph = 50;
  const factionChar = own === 'player' ? '蜀' : own === 'ai' ? '魏' : own === 'ai2' ? '吴' : '';
  const flagColor = own ? eave : '#ccc';
  const citySvg = `<svg width="${sz}" height="${Math.round(sz*ph/pw)}" viewBox="0 0 ${pw} ${ph}" xmlns="http://www.w3.org/2000/svg" style="${glowStyle}">
    <!-- 旗杆+旗帜 -->
    <line x1="20" y1="0" x2="20" y2="16" stroke="#777" stroke-width="1.5" opacity="0.9"/>
    ${own ? `<polygon points="20,0 35,6 20,12" fill="${flagColor}" opacity="0.97"/>
    <text x="27.5" y="9.5" font-size="7" font-weight="bold" fill="white" text-anchor="middle" font-family="serif" opacity="0.97">${factionChar}</text>` : `<polygon points="20,1 30,5 20,9" fill="${flagColor}" opacity="0.6"/>`}
    <!-- 顶层屋顶（亮色） -->
    <polygon points="10,17 20,8 30,17" fill="${roof}"/>
    <path d="M8,17 Q20,13 32,17" fill="${eave}" opacity="0.85"/>
    <!-- 顶层墙身 -->
    <rect x="14" y="17" width="12" height="5" fill="${body}" rx="0.5"/>
    <!-- 中层屋顶（亮色，略大） -->
    <polygon points="4,26 20,16 36,26" fill="${roof}"/>
    <path d="M2,26 Q20,21 38,26" fill="${eave}" opacity="0.8"/>
    <!-- 中层雉堞（城垛）-->
    <rect x="6"  y="23" width="4.5" height="4" fill="${body}" rx="0.5"/>
    <rect x="13" y="23" width="4.5" height="4" fill="${body}" rx="0.5"/>
    <rect x="22" y="23" width="4.5" height="4" fill="${body}" rx="0.5"/>
    <rect x="29" y="23" width="4.5" height="4" fill="${body}" rx="0.5"/>
    <!-- 中层墙身 -->
    <rect x="6" y="26" width="28" height="5" fill="${body}" rx="0.5" opacity="0.9"/>
    <!-- 主城楼 -->
    <rect x="4" y="31" width="32" height="13" fill="${body}" rx="1.5"/>
    <!-- 城楼高光（顶部一条亮线增加立体感） -->
    <rect x="4" y="31" width="32" height="2" fill="${eave}" rx="1" opacity="0.5"/>
    <!-- 拱门 -->
    <path d="M15,44 L15,36 Q20,32 25,36 L25,44 Z" fill="${shadow}"/>
    <!-- 城门砖纹 -->
    <line x1="15" y1="38" x2="25" y2="38" stroke="${eave}" stroke-width="0.5" opacity="0.3"/>
    <!-- 窗洞（左右各一） -->
    <rect x="7"  y="34" width="5" height="4" fill="${eave}" rx="1" opacity="0.6"/>
    <rect x="28" y="34" width="5" height="4" fill="${eave}" rx="1" opacity="0.6"/>
    <!-- 城墙底座阴影 -->
    <rect x="2" y="44" width="36" height="3" fill="${shadow}" rx="1"/>
  </svg>`;

  // 名称标签：占领状态用彩色徽章，空城用半透明深色
  const nameStyle = own
    ? `background:${labelBg};color:#fff;border:1px solid ${roof};box-shadow:0 1px 6px ${glowColor}50`
    : isDisaster
      ? `background:${labelBg};color:#f8bff8;border:1px solid #e040fb`
      : `background:rgba(40,25,10,0.78);color:#f5deb3;border:1px solid rgba(120,80,30,0.5)`;

  const costTag = !own && !isDisaster
    ? `<span style="font-size:7px;color:#ffe082;background:rgba(0,0,0,0.5);border-radius:3px;padding:0 3px;letter-spacing:0.2px">-${cost}💰</span>`
    : '';
  const g = getGarrison(t.id);
  const garTag = own && g > 0
    ? `<span style="font-size:7px;color:#fff;background:rgba(0,0,0,0.45);border-radius:3px;padding:0 3px">⚔️${g}</span>`
    : '';
  const ce = cityEvents[t.id];
  const ceTag = ce
    ? `<span style="font-size:8px;background:${ce.type==='locust'?'#bf360c':'#1b5e20'};color:#fff;border-radius:3px;padding:0 3px">${ce.type==='locust'?'🦗':'🌾'}${ce.rounds}</span>`
    : '';

  return `<div style="position:absolute;left:${t.x}%;top:${t.y}%;transform:translate(-50%,-50%);z-index:${t.major?5:3};
    display:flex;flex-direction:column;align-items:center;gap:1px">
    ${citySvg}
    <span style="font-size:${t.major?9:7.5}px;font-weight:800;white-space:nowrap;
      padding:1px 5px;border-radius:4px;letter-spacing:0.3px;line-height:1.6;
      ${nameStyle}">
      ${isDisaster?'☠️':''}${t.name}${lvStars}
    </span>
    ${costTag}${garTag}${ceTag}
  </div>`;
}

let _lastCitySnapshot = '';
function _renderCities() {
  const el = $('m-board-cities'); if (!el) return;
  // 用 ownership + cityLevels 快照做变化检测，无变化则跳过重建
  const snap = JSON.stringify(ownership) + JSON.stringify(cityLevels) + JSON.stringify(disasterCities) + JSON.stringify(garrison) + JSON.stringify(cityEvents);
  if (snap === _lastCitySnapshot && el.children.length > 0) return;
  _lastCitySnapshot = snap;
  let html = '';
  BOARD.forEach(t => { if (t.type === 'city') html += _cityTileSvg(t); });
  el.innerHTML = html;
}


function _renderPieces() {
  const el = $('m-board-pieces'); if (!el) return;

  // 计算各棋子目标位置
  const positions = {};
  BOARD.forEach((t, i) => {
    const isP = P.pos===i, isA = AI.pos===i, isS = SQ.pos===i;
    if (!isP && !isA && !isS) return;
    const count = (isP?1:0)+(isA?1:0)+(isS?1:0);
    const spread = count === 3 ? 5 : count === 2 ? 4 : 0;
    const offsets = count === 3 ? [-spread, 0, spread] : count === 2 ? [-spread, spread] : [0];
    let idx = 0;
    if (isP) positions['player'] = { x: t.x + offsets[idx++], y: t.y };
    if (isA) positions['ai']     = { x: t.x + offsets[idx++], y: t.y };
    if (isS) positions['ai2']    = { x: t.x + offsets[idx++], y: t.y };
  });

  // 初次或数量变化时重建，否则只更新位置/动画（防止img闪烁）
  const existing = { player: $('piece-player'), ai: $('piece-ai'), ai2: $('piece-ai2') };
  for (const who of ['player','ai','ai2']) {
    const pos = positions[who];
    let dom = existing[who];
    if (!pos) { if (dom) dom.remove(); continue; }
    if (!dom) {
      el.insertAdjacentHTML('beforeend', _makePieceHtml(who));
      dom = $('piece-'+who);
    }
    // 更新位置
    dom.style.left = pos.x + '%';
    dom.style.top  = pos.y + '%';
    // 已淘汰：保持变灰静止
    if (eliminated.has(who)) {
      dom.style.filter = 'grayscale(1) opacity(0.45)';
      dom.style.animation = 'none';
      const ring2 = dom.querySelector('.piece-ring');
      if (ring2) ring2.style.display = 'none';
      continue;
    }
    // 更新动画状态
    const isMoving = movingPiece === who;
    dom.style.animation = isMoving ? 'pieceMoving 0.22s ease infinite' : 'pieceBob 2.4s ease-in-out infinite';
    const ring = dom.querySelector('.piece-ring');
    if (ring) ring.style.animation = `pieceRing ${isMoving?'0.4':'2'}s ease-in-out infinite`;
    const shadow = dom.querySelector('.piece-shadow');
    if (shadow) {
      shadow.style.width  = (isMoving ? 18 : 28) + 'px';
      shadow.style.height = (isMoving ? 3  : 5)  + 'px';
      shadow.style.opacity = isMoving ? '0.15' : '0.28';
    }
    const arrow = dom.querySelector('.piece-arrow');
    if (arrow) arrow.style.display = isMoving ? 'block' : 'none';
  }
}

function _makePieceHtml(who) {
  const cfg = {
    player: { img:'images/characters/liubei.webp', name:'刘备', border:'#4caf50', shadow:'76,175,80',  badge:'#2e7d32' },
    ai:     { img:'images/characters/caocao.webp',  name:'曹操', border:'#4a90d9', shadow:'74,144,217', badge:'#1565c0' },
    ai2:    { img:'images/characters/sunquan.webp', name:'孙权', border:'#ef5350', shadow:'239,83,80',  badge:'#b71c1c' },
  }[who];
  return `<div id="piece-${who}" style="position:absolute;z-index:22;text-align:center;transform:translate(-50%,-50%);transform-origin:bottom center;animation:pieceBob 2.4s ease-in-out infinite" class="mono-piece">
    <div style="position:relative;display:inline-block">
      <div class="piece-ring" style="position:absolute;inset:-5px;border-radius:50%;border:2.5px solid ${cfg.border};opacity:0.5;animation:pieceRing 2s ease-in-out infinite"></div>
      <div class="piece-arrow" style="display:none;position:absolute;top:-16px;left:50%;transform:translateX(-50%);font-size:12px;animation:pieceBob 0.3s ease-in-out infinite">▲</div>
      <div style="width:36px;height:36px;border-radius:50%;border:2.5px solid ${cfg.border};overflow:hidden;
        box-shadow:0 0 10px rgba(${cfg.shadow},0.6),0 3px 8px rgba(0,0,0,0.5);background:#fff;flex-shrink:0">
        <img src="${cfg.img}" width="36" height="36" style="display:block;border-radius:50%;width:36px;height:36px;object-fit:cover">
      </div>
    </div>
    <div style="margin-top:3px;font-size:8.5px;font-weight:800;color:#fff;white-space:nowrap;
      background:${cfg.badge};padding:1px 5px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.4);letter-spacing:0.5px">${cfg.name}</div>
    <div class="piece-shadow" style="width:28px;height:5px;border-radius:50%;background:rgba(0,0,0,0.28);margin:2px auto 0;filter:blur(2px);transition:all 0.2s ease"></div>
  </div>`;
}

// ===== 辅助 =====
function $(id) { return document.getElementById(id); }
function log(m) { logs.unshift(m); if (logs.length > 20) logs.pop(); renderLog(); }
function popup(html) {
  closePopup();
  const d = document.createElement('div');
  d.id = 'm-pop';
  d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:300;padding:20px';
  d.innerHTML = `<div style="background:white;border-radius:20px;padding:24px;max-width:340px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.15);animation:fadeIn 0.3s ease">${html}</div>`;
  document.body.appendChild(d);
}
function closePopup() { const p=$('m-pop'); if(p) p.remove(); }
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

// 打乱题目选项，使正确答案随机出现在 A/B/C/D 任意位置
function shuffleQuestion(q) {
  const correct = q.opts[q.ans];
  const shuffled = [...q.opts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { ...q, opts: shuffled, ans: shuffled.indexOf(correct) };
}

// ===== 掷骰子 =====
function _drawDice(canvas, n) {
  const s = canvas.width, r = s * 0.14, p = s * 0.26, m = s / 2;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, s, s);
  // 骰子体
  const g = ctx.createLinearGradient(0, 0, s, s);
  g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d8d8d8');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(2, 2, s-4, s-4, r); ctx.fill();
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(2, 2, s-4, s-4, r); ctx.stroke();
  // 高光
  const hl = ctx.createLinearGradient(0, 0, 0, s*0.5);
  hl.addColorStop(0, 'rgba(255,255,255,0.7)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.beginPath(); ctx.roundRect(6, 6, s-12, s*0.45, r*0.6); ctx.fill();
  // 点
  const dots = {
    1:[[m,m]],
    2:[[p,p],[s-p,s-p]],
    3:[[p,p],[m,m],[s-p,s-p]],
    4:[[p,p],[s-p,p],[p,s-p],[s-p,s-p]],
    5:[[p,p],[s-p,p],[m,m],[p,s-p],[s-p,s-p]],
    6:[[p,p],[s-p,p],[p,m],[s-p,m],[p,s-p],[s-p,s-p]],
  }[n] || [];
  const dr = s * 0.09;
  dots.forEach(([x,y]) => {
    const dg = ctx.createRadialGradient(x-dr*0.3, y-dr*0.3, 0, x, y, dr);
    dg.addColorStop(0, '#444'); dg.addColorStop(1, '#111');
    ctx.fillStyle = dg;
    ctx.beginPath(); ctx.arc(x, y, dr, 0, Math.PI*2); ctx.fill();
  });
}

async function rollDice() {
  if (rolling || turn !== 'player') return;
  rolling = true;

  try {
    const dice = Math.min(Math.floor(Math.random()*6)+1 + P.bonus, 6);
    P.bonus = 0;

    // 在棋盘容器正中央浮出骰子
    const wrap = $('m-board-wrap');
    const el = document.createElement('div');
    el.id = 'dice-popup';
    el.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(0.4);
      z-index:60;text-align:center;pointer-events:none;
      transition:transform 0.25s cubic-bezier(.34,1.56,.64,1),opacity 0.2s`;
    const cv = document.createElement('canvas');
    cv.width = cv.height = 96;
    cv.style.cssText = 'display:block;filter:drop-shadow(0 6px 16px rgba(0,0,0,0.4))';
    el.appendChild(cv);
    if (wrap) wrap.appendChild(el);

    // 弹入
    await wait(20);
    el.style.transform = 'translate(-50%,-50%) scale(1)';

    // 快速随机滚动（先快后慢）
    const frames = [60,60,70,80,90,110,130,160];
    for (const ms of frames) {
      _drawDice(cv, Math.floor(Math.random()*6)+1);
      await wait(ms);
    }

    // 定格 + 弹跳
    _drawDice(cv, dice);
    el.style.transform = 'translate(-50%,-50%) scale(1.18)';
    await wait(120);
    el.style.transform = 'translate(-50%,-50%) scale(1)';

    log(`🎲 你掷出 ${dice}`);
    await wait(500);

    // 淡出
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%,-50%) scale(0.6)';
    await wait(200);
    el.remove();

    await move('player', dice);
  } catch(e) {
    console.error('[monopoly] rollDice error:', e);
    $('dice-popup')?.remove();
  }
  rolling = false;
}

function getPlayer(who) {
  return who==='player' ? P : who==='ai' ? AI : SQ;
}

function getEnemies(who) {
  if (who==='player') return ['ai','ai2'];
  if (who==='ai')     return ['player','ai2'];
  return ['player','ai'];
}

function whoOwns(cityId) {
  return ownership[cityId] || null;
}

async function move(who, steps) {
  const p = getPlayer(who);
  movingPiece = who;
  for (let i = 0; i < steps; i++) {
    const nexts = BOARD[p.pos].next;
    const isJunction = nexts.length > 1;
    // 洛阳(pos 4)分叉：80%→邺城(5)，20%→官渡捷径(39)
    const chosen = (p.pos === 4 && nexts.length === 2)
      ? (Math.random() < 0.80 ? nexts[0] : nexts[1])
      : nexts[Math.floor(Math.random() * nexts.length)];
    // 分叉路口提示（仅最后一步前或中途遇到时显示）
    if (isJunction && who === 'player') {
      _showJunctionHint(p.pos, chosen);
      await wait(600);
    }
    p.pos = chosen;
    _renderPieces();
    await wait(who==='player' ? 200 : 100);
  }
  movingPiece = null;
  _renderCities();
  _renderPieces();
  await land(who);
}

function _showJunctionHint(fromIdx, chosenIdx) {
  const from = BOARD[fromIdx];
  const to   = BOARD[chosenIdx];
  const toName = to.type === 'city' ? to.name : to.type === 'event' ? '事件格' : '路径';
  // 在棋盘容器上临时弹出提示气泡
  const wrap = $('m-board-wrap'); if (!wrap) return;
  const old = wrap.querySelector('.junction-hint'); if (old) old.remove();
  const hint = document.createElement('div');
  hint.className = 'junction-hint';
  hint.style.cssText = `position:absolute;left:${from.x}%;top:${from.y}%;transform:translate(-50%,-160%);
    z-index:50;background:rgba(20,10,5,0.88);color:#ffe082;border:1.5px solid #ffb300;
    border-radius:8px;padding:4px 10px;font-size:10px;font-weight:700;white-space:nowrap;
    box-shadow:0 2px 10px rgba(0,0,0,0.5);pointer-events:none;
    animation:junctionPop 0.6s ease forwards`;
  hint.textContent = `⑂ 分叉！→ ${toName}`;
  wrap.appendChild(hint);
  setTimeout(() => hint.remove(), 900);
  // 注入动画（只注入一次）
  if (!document.getElementById('junction-style')) {
    const s = document.createElement('style');
    s.id = 'junction-style';
    s.textContent = `@keyframes junctionPop{0%{opacity:0;transform:translate(-50%,-130%)}40%{opacity:1;transform:translate(-50%,-165%)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-175%)}}`;
    document.head.appendChild(s);
  }
}


// ===== 落地处理 =====
// ===== 掠夺：同格触发，按兵力差抢金 =====
async function checkPlunder(who) {
  const p = getPlayer(who);
  const pos = p.pos;

  // 找同格的其他棋子（已退场的不参与掠夺）
  const others = ['player','ai','ai2'].filter(w => w !== who && !eliminated.has(w) && getPlayer(w).pos === pos);
  if (others.length === 0) return;

  for (const other of others) {
    const opp = getPlayer(other);
    const diff = p.troops - opp.troops;

    // 兵力相同：相安无事
    if (diff === 0) {
      if (who === 'player' || other === 'player') {
        const tileName = BOARD[pos].name || '路途';
        await new Promise(resolve => {
          popup(`<div style="font-size:30px">🤝</div>
            <h4 style="margin:4px 0">遭遇！势均力敌</h4>
            <p style="font-size:12px;color:#666;margin:6px 0">${tileName} · 双方兵力相当，相安无事</p>
            <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._mc()">继续</button>`);
          window._mc = () => { closePopup(); resolve(); };
        });
      } else {
        const whoLabel = who==='ai'?'🐴曹操':'👑孙权';
        const otherLabel = other==='ai'?'曹操':'孙权';
        log(`🤝 ${whoLabel}与${otherLabel}遭遇，势均力敌，相安无事`);
      }
      continue;
    }

    const winner   = diff > 0 ? who   : other;
    const loser    = diff > 0 ? other : who;
    const winP     = getPlayer(winner);
    const loseP    = getPlayer(loser);
    const absDiff  = Math.abs(p.troops - opp.troops); // 显示真实兵力差
    const plunder  = Math.max(3, Math.min(absDiff * 5 + 5, Math.floor(loseP.coins * 0.3)));

    winP.coins  += plunder;
    loseP.coins -= plunder;

    // 遭遇战兵力互损：兵力相等时无损耗，否则按差值比例损失
    let lossLoser = 0, lossWinner = 0;
    if (absDiff > 0) {
      const totalTroops = p.troops + opp.troops || 1;
      const loserRate  = Math.min(0.5, Math.max(0.05, winP.troops / totalTroops));
      const winnerRate = Math.min(0.3, Math.max(0.03, loseP.troops / totalTroops));
      lossLoser  = loseP.troops > 0 ? Math.max(1, Math.ceil(loseP.troops * loserRate))  : 0;
      lossWinner = winP.troops  > 0 ? Math.max(1, Math.ceil(winP.troops  * winnerRate)) : 0;
      loseP.troops = Math.max(0, loseP.troops - lossLoser);
      winP.troops  = Math.max(0, winP.troops  - lossWinner);
    }

    const winLabel  = winner==='player'?'🏇刘备':winner==='ai'?'🐴曹操':'👑孙权';
    const loseLabel = loser ==='player'?'刘备'  :loser ==='ai'?'曹操'  :'孙权';
    const tileName  = BOARD[pos].name || '路途';
    const tieStr    = absDiff === 0 ? '（势均力敌，随机决胜）' : `兵力多${absDiff}，`;
    log(`⚔️ 遭遇！${winLabel}${tieStr}掠夺${loseLabel} +${plunder}💰（双方各损兵 -${lossWinner}/-${lossLoser}）`);
    renderStatus();

    if (who === 'player' || other === 'player') {
      const isWinner = winner === 'player';
      const isTie = absDiff === 0;
      await new Promise(resolve => {
        popup(`
          <div style="font-size:30px">${isWinner ? '⚔️' : '😱'}</div>
          <h4 style="margin:4px 0">遭遇战！${isTie ? '势均力敌' : ''}</h4>
          <p style="font-size:12px;color:#666;margin:6px 0">${tileName} · 双方棋子相遇</p>
          <div style="background:#f5f5f5;border-radius:9px;padding:8px 12px;margin:8px 0;font-size:12px;text-align:left">
            <div>刘备兵力 <b>${who==='player'?p.troops:opp.troops}</b> &nbsp;vs&nbsp; ${loseLabel==='刘备'?winLabel:loseLabel}兵力 <b>${who==='player'?opp.troops:p.troops}</b></div>
            <div style="margin-top:4px">${isTie ? '随机决胜' : `兵力差 <b>${absDiff}</b>`} → 掠夺 <b>${plunder}</b>💰</div>
          </div>
          ${isWinner
            ? `<p style="font-size:15px;font-weight:700;color:#4caf50">掠夺 +${plunder}💰</p>`
            : `<p style="font-size:15px;font-weight:700;color:#ef5350">被掠夺 -${plunder}💰</p>`}
          <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._mc()">继续</button>`);
        window._mc = () => { closePopup(); resolve(); };
      });
    }
  }
}

async function land(who) {
  const p = getPlayer(who);
  const tile = BOARD[p.pos];

  try {
    if (tile.type === 'empty') {
      // 空白路径格
    } else if (tile.type === 'event') {
      await doEvent(who);
    } else {
      const own = ownership[tile.id];
      if (!own) await doEmpty(who, tile);
      else if (own === who) await doTax(who, tile);
      else if (own !== 'disaster') {
        if (who === 'player') await doLandEnemy(tile, own);
        else await doAiLandEnemy(who, tile, own);
      }
    }
  } catch(e) {
    console.error('[monopoly] land error:', e);
  }

  // 掠夺检测：在 try-catch 外执行，确保城市处理异常不会跳过掠夺
  try {
    await checkPlunder(who);
  } catch(e) {
    console.error('[monopoly] checkPlunder error:', e);
  }

  writeSave();

  // 胜利检测：一方占领全部城池
  if (await checkWin()) return;

  // 良马：再掷一次
  if (p.extraRoll) {
    p.extraRoll = false;
    const whoLabel = who==='player'?'你':who==='ai'?'曹操':'孙权';
    log(`🐴 良马发动！${whoLabel}再掷一次！`);
    if (who === 'player') {
      rolling = false;
      render();
      return;
    } else {
      const dice2 = Math.floor(Math.random()*6)+1;
      log(`🐴 ${who==='ai'?'曹操':'孙权'}再掷 ${dice2}`);
      await move(who, dice2);
      return;
    }
  }

  // 切换回合：player → ai → ai2 → player
  if (who === 'player') {
    turn = 'ai'; rolling = false;
    render();
    await wait(300);
    await aiTurn('ai');
  } else if (who === 'ai') {
    turn = 'ai2'; rolling = false;
    render();
    await wait(200);
    await aiTurn('ai2');
  } else {
    // ai2 结束回合：天灾恢复，回合+1，兵力补充
    round++;
    // 每回合所有玩家补充兵力
    for (const [p, label] of [[P,'刘备'],[AI,'曹操'],[SQ,'孙权']]) {
      const before = p.troops;
      p.troops = Math.min(MAX_TROOPS, p.troops + TROOP_REGEN);
      const gained = p.troops - before;
      if (gained > 0) log(`💂 ${label}补充兵力+${gained}（共${p.troops}）`);
    }
    for (const [cityId, info] of Object.entries(disasterCities)) {
      info.rounds--;
      if (info.rounds <= 0) {
        delete disasterCities[cityId];
        if (ownership[cityId] === 'disaster') {
          ownership[cityId] = info.prevOwner;
          const restored = BOARD.find(t=>t.id===cityId);
          const prevP = getPlayer(info.prevOwner);
          prevP.cities.push(cityId);
          log(`🌅 ${restored?.name||cityId}天灾结束，恢复占领`);
        }
      }
    }
    // 城池变量事件倒计时
    for (const [cityId, ev] of Object.entries(cityEvents)) {
      ev.rounds--;
      if (ev.rounds <= 0) {
        const tile = BOARD.find(t=>t.id===cityId);
        log(`🔄 ${tile?.name||cityId}${ev.type==='locust'?'蝗灾结束':'丰收结束'}，恢复正常税收`);
        delete cityEvents[cityId];
      }
    }
    turn = 'player'; rolling = false;
    render();
  }
}

// ===== 占领空城：3题中2题 + 花费金币 =====
async function doEmpty(who, tile) {
  const p = getPlayer(who);
  const cost = tile.major ? CITY_COST.major : CITY_COST.minor;

  if (who !== 'player') {
    // AI：模拟3题，每题72%答对，需2/3（占城成功率约80%）
    if (p.freeCity) {
      ownership[tile.id]=who; p.cities.push(tile.id); p.freeCity=false;
      const label = who==='ai'?'曹操':'孙权';
      log(`🐴 ${label}免费占领${tile.name}!`);
      renderBoard(); return;
    }
    const correct = [Math.random()<0.72, Math.random()<0.72, Math.random()<0.72].filter(Boolean).length;
    const ok = correct >= 2;
    if (ok && p.coins >= cost) {
      p.coins -= cost;
      ownership[tile.id]=who; p.cities.push(tile.id);
      p.troops = Math.min(MAX_TROOPS, p.troops + 2);
      // 占城后自动驻入部分兵力
      if (p.troops > 0) {
        const send = Math.min(MAX_GARRISON, Math.ceil(p.troops * (0.3 + Math.random() * 0.3)));
        garrison[tile.id] = send;
        p.troops = Math.max(0, p.troops - send);
      }
      const label = who==='ai'?'曹操':'孙权';
      log(`🐴 ${label}占领${tile.name}(-${cost}💰，驻兵${garrison[tile.id]||0})!`);
    } else {
      const label = who==='ai'?'曹操':'孙权';
      log(`🐴 ${label}攻城失败(${correct}/3题)`);
    }
    renderBoard(); return;
  }

  // 玩家：借东风直接占
  if (P.freeCity) {
    ownership[tile.id]='player'; P.cities.push(tile.id); P.freeCity=false;
    log(`✅ 借东风免费占领${tile.name}!`);
    renderBoard();
    if(window.effects) window.effects.flashPulse('rgba(76,175,80,0.3)');
    return;
  }

  // 检查金币是否足够
  if (P.coins < cost) {
    return new Promise(resolve => {
      popup(`<div style="font-size:32px">😅</div>
        <h4>金币不足！</h4>
        <p style="font-size:13px;color:#666;margin:8px 0">占领${tile.name}需要 ${cost}💰<br>你只有 ${P.coins}💰</p>
        <button class="btn btn-primary" style="width:100%;margin-top:10px" onclick="window._mc()">继续</button>`);
      window._mc = () => { closePopup(); resolve(); };
    });
  }

  // 3题答题流程
  return new Promise(resolve => {
    const questions = [];
    const pool = [...monopolyQuizBank];
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      questions.push(shuffleQuestion(pool.splice(idx, 1)[0]));
    }
    let qIndex = 0, correct = 0;
    const results = []; // 每题对错：true/false

    function showQuestion() {
      if (qIndex >= 3) { finalize(); return; }
      const q = questions[qIndex];
      popup(`
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div style="font-size:20px">🏰</div>
          <div style="text-align:left">
            <div style="font-weight:800;font-size:13px">${tile.name} <span style="font-size:10px;color:${KC[tile.k]||'#999'}">（${({wei:'魏',shu:'蜀',wu:'吴',contested:'争'})[tile.k]}）</span></div>
            <div style="font-size:10px;color:#999">${tile.desc}</div>
          </div>
        </div>
        <div style="background:#f0f4ff;border-radius:8px;padding:5px 8px;margin-bottom:8px">
          <span style="font-size:10px;color:#667eea;font-weight:700">第 ${qIndex+1}/3 题 · 需答对2题 · 花费${cost}💰</span>
          <div style="display:flex;gap:3px;margin-top:3px">
            ${[0,1,2].map(i=>`<div style="flex:1;height:4px;border-radius:2px;background:${i<results.length?(results[i]?'#4caf50':'#ef5350'):'#ddd'}"></div>`).join('')}
          </div>
        </div>
        <p style="font-size:13px;font-weight:600;text-align:left;margin-bottom:8px">${q.q}</p>
        <div style="display:flex;flex-direction:column;gap:5px">
          ${q.opts.map((o,i)=>`<button class="mono-quiz-opt" onclick="window._ma(${i})">${'ABCD'[i]}. ${o}</button>`).join('')}
        </div>`);

      window._ma = idx => {
        const ok = idx === q.ans;
        if (ok) correct++;
        results.push(ok);
        qIndex++;
        // 短暂显示结果色
        const opts = document.querySelectorAll('.mono-quiz-opt');
        opts.forEach((b,i) => {
          if(i===q.ans) b.style.background='#e8f5e9';
          else if(i===idx&&!ok) b.style.background='#ffebee';
          b.disabled = true;
        });
        setTimeout(() => showQuestion(), 600);
      };
    }

    function finalize() {
      const success = correct >= 2;
      if (success) {
        P.coins -= cost;
        ownership[tile.id]='player'; P.cities.push(tile.id);
        const bonusAdv = P.advisors.filter(a=>a.effect==='cityBonus+5').length;
        if (bonusAdv > 0) P.coins += bonusAdv * 5;
        P.troops = Math.min(MAX_TROOPS, P.troops + 2); // 占城奖励+2兵
        log(`✅ 占领${tile.name}(${correct}/3题) -${cost}💰 +2⚔️`);
        renderBoard();
        if(window.effects) window.effects.flashPulse('rgba(76,175,80,0.3)');
      } else {
        log(`❌ ${tile.name}占领失败(${correct}/3题)`);
        if(window.effects) window.effects.screenShake(3,200);
      }
      popup(`<div style="font-size:32px">${success?'🏰':'❌'}</div>
        <h4>${success?'占领成功！':'攻城失败！'}</h4>
        <p style="font-size:13px;color:#666;margin:6px 0">答对 ${correct}/3 题${success?`<br>花费 ${cost}💰`:'，需至少答对2题'}</p>
        <div style="display:flex;gap:5px;justify-content:center;margin:6px 0">
          ${[0,1,2].map(i=>`<span style="font-size:18px">${i<results.length?(results[i]?'✅':'❌'):'⬜'}</span>`).join('')}
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:10px" onclick="window._mc()">${success?'派兵驻守 →':'继续'}</button>`);
      window._mc = async () => {
        closePopup();
        if (success) await showGarrisonPopup(tile);
        resolve();
      };
    }

    showQuestion();
  });
}

// 计算某城当前税收（含事件加成）
function calcTax(tileId, lv, isMajor, advisorBonus = 0) {
  const base = (isMajor ? TAX_MAJOR : TAX_MINOR)[lv];
  const ev = cityEvents[tileId];
  let tax = base + advisorBonus;
  if (ev?.type === 'locust')  tax = 0;
  if (ev?.type === 'harvest') tax = base * 2 + advisorBonus;
  return tax;
}

// 己城：收税 + 可升级
async function doTax(who, tile) {
  const p = getPlayer(who);
  const lv = cityLevels[tile.id] || 1;
  const advisorBonus = p.advisors.filter(a=>a.effect==='tax+2').length * 2;
  const tax = calcTax(tile.id, lv, tile.major, advisorBonus);
  p.coins += tax;
  const whoLabel = who==='player'?'🏇':who==='ai'?'🐴':'👑';
  const lvStr = lv > 1 ? ` Lv${lv}` : '';
  const ev = cityEvents[tile.id];
  const evStr = ev ? (ev.type==='locust'?'🦗蝗灾！':ev.type==='harvest'?'🌾丰收！':'') : '';
  log(`${whoLabel} ${tile.name}${lvStr}${evStr}收税+${tax}💰`);
  if (who !== 'player') {
    // AI驻兵：停留在己城时，将部分兵力驻入该城
    if (p.troops > 0) {
      const space = MAX_GARRISON - getGarrison(tile.id);
      if (space > 0) {
        const ratio = 0.3 + Math.random() * 0.4; // 30%~70%
        const send = Math.min(space, Math.ceil(p.troops * ratio), p.troops);
        garrison[tile.id] = (garrison[tile.id] || 0) + send;
        p.troops -= send;
        const whoLabel = who==='ai'?'曹操':'孙权';
        log(`⚔️ ${whoLabel}向${tile.name}驻兵+${send}`);
      }
    }
    return;
  }
  if (who === 'player') {
    const canUpgrade = lv < 3;
    const upgCost = canUpgrade ? (tile.major ? UPGRADE_COST_MAJOR : UPGRADE_COST_MINOR)[lv] : 0;
    await new Promise(resolve => {
      function redraw() {
        const g = getGarrison(tile.id);
        const canAfford = P.coins >= upgCost;
        popup(`
          <div style="font-size:24px">${cityEvents[tile.id]?.type==='locust'?'🦗':cityEvents[tile.id]?.type==='harvest'?'🌾':'🏰'}</div>
          <h4 style="margin:4px 0">${tile.name} <span style="color:#888;font-size:12px">Lv${lv} · ${tile.major?'大城':'小城'}</span></h4>
          ${cityEvents[tile.id]?.type==='locust'?`<p style="font-size:11px;color:#e65100;font-weight:700;margin:2px 0">🦗 蝗灾！税收为0（剩${cityEvents[tile.id].rounds}回合）</p>`:''}
          ${cityEvents[tile.id]?.type==='harvest'?`<p style="font-size:11px;color:#2e7d32;font-weight:700;margin:2px 0">🌾 大丰收！税收翻倍（剩${cityEvents[tile.id].rounds}回合）</p>`:''}
          <p style="font-size:12px;color:#4caf50;font-weight:700;margin:4px 0">本回合收税 +${tax}💰</p>

          <!-- 驻兵调节器 -->
          <div style="background:#f5f7ff;border-radius:10px;padding:8px 10px;margin:8px 0">
            <div style="font-size:10px;color:#888;margin-bottom:6px;font-weight:600">⚔️ 兵力分配 &nbsp;·&nbsp; 可用兵力：<b id="tax-troops">${P.troops}</b></div>
            <div style="display:flex;align-items:center;justify-content:center;gap:10px">
              <button onclick="window._mgr(-1)" style="width:30px;height:30px;border-radius:50%;border:1.5px solid #ddd;
                font-size:16px;cursor:pointer;background:#fff;line-height:1">−</button>
              <div style="text-align:center;min-width:48px">
                <div style="font-size:24px;font-weight:800" id="tax-gar">${g}</div>
                <div style="font-size:9px;color:#aaa">/ ${MAX_GARRISON} 驻兵</div>
              </div>
              <button onclick="window._mgr(1)" style="width:30px;height:30px;border-radius:50%;border:1.5px solid #ddd;
                font-size:16px;cursor:pointer;background:#fff;line-height:1">＋</button>
            </div>
            <div style="font-size:9px;color:#aaa;margin-top:4px;text-align:center">每1驻兵 → 守城战力+1</div>
          </div>

          ${canUpgrade ? `<div style="font-size:10px;color:#666;margin:4px 0">升至Lv${lv+1}：税收${tile.major?TAX_MAJOR[lv+1]:TAX_MINOR[lv+1]}💰，守城+${UPGRADE_DEF[lv+1]}
            ${!canAfford?`<span style="color:#ef5350">（需${upgCost}💰，不足）</span>`:''}</div>` : ''}

          <div style="display:flex;gap:6px;margin-top:10px">
            <button class="btn" style="flex:1" onclick="window._mc()">确认</button>
            ${canUpgrade ? `<button class="btn btn-primary" style="flex:1${!canAfford?';opacity:0.4;pointer-events:none':''}"
              onclick="window._mu('${tile.id}',${lv},${upgCost})">升级(-${upgCost}💰)</button>` : ''}
          </div>`);

        window._mgr = (delta) => {
          const cur = getGarrison(tile.id);
          const newG = Math.max(0, Math.min(MAX_GARRISON, cur + delta));
          const diff = newG - cur;
          if (diff > 0 && P.troops < diff) return;
          garrison[tile.id] = newG;
          P.troops -= diff;
          const elG = document.getElementById('tax-gar');
          const elT = document.getElementById('tax-troops');
          if (elG) elG.textContent = newG;
          if (elT) elT.textContent = P.troops;
          renderStatus();
        };
        window._mu = (id, curLv, c) => {
          cityLevels[id] = curLv + 1;
          P.coins -= c;
          log(`🏗️ ${tile.name}升至Lv${curLv+1}！`);
          renderBoard(); closePopup(); resolve();
        };
        window._mc = () => { closePopup(); renderBoard(); resolve(); };
      }
      redraw();
    });
  }
}

// ===== 变卖城池：金币不足时随机出售己方城池 =====
// 返回 { cityId, cityName, salePrice } 或 null（无城可卖）
function sellRandomCity(who) {
  const p = getPlayer(who);
  const ownedCities = p.cities.filter(id => ownership[id] === who);
  if (ownedCities.length === 0) return null;
  const cityId = ownedCities[Math.floor(Math.random() * ownedCities.length)];
  const tile = BOARD.find(t => t.id === cityId);
  const lv = cityLevels[cityId] || 1;
  const isMajor = tile?.major || false;
  const salePrice = (isMajor ? TAX_MAJOR : TAX_MINOR)[lv] * 3;
  // 释放城池
  p.cities = p.cities.filter(id => id !== cityId);
  delete ownership[cityId];
  delete cityLevels[cityId];
  delete garrison[cityId];
  p.coins += salePrice;
  renderBoard();
  renderStatus();
  return { cityId, cityName: tile?.name || cityId, salePrice };
}

// AI落在敌城：根据兵力和金币自动决策攻城或交税
async function doAiLandEnemy(who, tile, defOwner) {
  const atk = getPlayer(who);
  const def = getPlayer(defOwner);
  const lv = cityLevels[tile.id] || 1;
  const cityGarrison = getGarrison(tile.id);
  const fullTax = Math.max(2, 3 + def.cities.length + UPGRADE_TAX[lv]);
  const whoLabel = who === 'ai' ? '🐴曹操' : '👑孙权';
  const defLabel = defOwner === 'player' ? '刘备' : defOwner === 'ai' ? '曹操' : '孙权';

  // 估算胜率：攻方期望战力 vs 守方期望战力
  const balanceBonus = (def.cities.length - atk.cities.length >= 2) ? 2 : 0; // 落后时有平衡加成
  const atkPower = 3.5 + atk.cities.length + Math.floor(atk.troops / 3) + balanceBonus;
  const defPower = 3.5 + def.cities.length + Math.floor(cityGarrison / 5) + UPGRADE_DEF[lv];

  // 攻城条件：战力不低于对方70%（大幅落后才放弃）
  // 不用 canAffordRisk：不攻也要交税，攻城反而有机会得城
  const powerAdvantage = atkPower > defPower * 0.70;
  const shouldAttack = powerAdvantage;

  if (shouldAttack) {
    // AI战术选择：落后时35%概率强攻，否则15%概率强攻（需有足够金币）
    const isTrailing = atk.cities.length < def.cities.length;
    const blitzChance = isTrailing ? 0.35 : 0.15;
    const blitzCost = 5;
    if (Math.random() < blitzChance && atk.coins >= blitzCost + 5) {
      atk.buff += 3;
      atk.coins -= blitzCost;
      log(`${whoLabel} 🔥强攻${defLabel}的${tile.name}`);
    } else {
      log(`${whoLabel} 攻打${defLabel}的${tile.name}`);
    }
    // 若攻打玩家城池，先弹窗预告
    if (defOwner === 'player') {
      await new Promise(resolve => {
        popup(`<div style="font-size:28px">⚔️</div>
          <h4 style="margin:4px 0;color:#c62828">${whoLabel.replace(/[🐴👑]/g,'')} 攻打你的${tile.name}！</h4>
          <p style="font-size:12px;color:#666;margin:6px 0">Lv${lv} · 驻兵${cityGarrison} · 敌方战力${Math.round(atkPower)} vs 守城${Math.round(defPower)}</p>
          <button class="btn btn-primary" style="width:100%;margin-top:6px" onclick="window._mc()">迎战！</button>`);
        window._mc = () => { closePopup(); resolve(); };
      });
    }
    await doAttack(who, tile);
  } else {
    // 金币不足时变卖随机城池
    if (atk.coins < fullTax) {
      const sold = sellRandomCity(who);
      if (sold) {
        log(`${whoLabel} 金币不足，变卖${sold.cityName}（+${sold.salePrice}💰）以缴过路费`);
        if (defOwner === 'player') {
          await new Promise(resolve => {
            popup(`<div style="font-size:28px">🏚️</div>
              <h4 style="margin:4px 0;color:#e65100">${whoLabel.replace(/[🐴👑]/g,'')} 囊中羞涩</h4>
              <p style="font-size:13px;color:#666;margin:6px 0">被迫变卖 <b>${sold.cityName}</b>（+${sold.salePrice}💰）<br>以缴纳过路费</p>
              <button class="btn btn-primary" style="width:100%;margin-top:6px" onclick="window._mc()">继续</button>`);
            window._mc = () => { closePopup(); resolve(); };
          });
        }
      }
    }
    const taxAmount = Math.min(fullTax, atk.coins);
    atk.coins -= taxAmount;
    def.coins += taxAmount;
    log(`${whoLabel} 缴过路费给${defLabel} -${taxAmount}💰`);
    renderStatus();
    // 若向玩家交税，弹窗通知
    if (defOwner === 'player') {
      await new Promise(resolve => {
        popup(`<div style="font-size:28px">💰</div>
          <h4 style="margin:4px 0">${whoLabel.replace(/[🐴👑]/g,'')} 经过你的${tile.name}</h4>
          <p style="font-size:13px;color:#666;margin:6px 0">缴纳过路费 <b style="color:#4caf50">+${taxAmount}💰</b> 入账</p>
          <button class="btn btn-primary" style="width:100%;margin-top:6px" onclick="window._mc()">收下</button>`);
        window._mc = () => { closePopup(); resolve(); };
      });
    }
  }
}

// 玩家落在敌城：先选攻城或交税，攻城失败或选交税时再处理金币不足
async function doLandEnemy(tile, defOwner) {
  const def = getPlayer(defOwner);
  const lv = cityLevels[tile.id] || 1;
  const defLabel = defOwner === 'ai' ? '曹操' : '孙权';
  const taxAmount = Math.max(2, 3 + def.cities.length + UPGRADE_TAX[lv]);

  // ===== 第一步：先选择攻城还是交税 =====
  const choice = await new Promise(resolve => {
    popup(`
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="font-size:22px">🏴</div>
        <div style="text-align:left">
          <div style="font-weight:800;font-size:14px">${tile.name}</div>
          <div style="font-size:10px;color:#888">${defLabel}领地 Lv${lv} · 驻兵${getGarrison(tile.id)}</div>
        </div>
      </div>
      <p style="font-size:11px;color:#666;margin:0 0 10px">你进入了敌方领地，如何应对？</p>
      <div style="display:flex;flex-direction:column;gap:7px">
        <button onclick="window._ml('attack')" style="text-align:left;padding:9px 12px;border-radius:9px;
          border:1.5px solid #ef5350;background:#fff8f8;cursor:pointer;font-family:inherit">
          <div style="font-weight:700;font-size:12px;color:#c62828">⚔️ 发起攻城</div>
          <div style="font-size:10px;color:#888;margin-top:2px">掷骰对决，胜则占领，败则缴税</div>
        </button>
        <button onclick="window._ml('tax')" style="text-align:left;padding:9px 12px;border-radius:9px;
          border:1.5px solid #ddd;background:#fafafa;cursor:pointer;font-family:inherit">
          <div style="font-weight:700;font-size:12px">💰 直接交税 -${taxAmount}💰</div>
          <div style="font-size:10px;color:#888;margin-top:2px">和平通过，不发生战斗</div>
        </button>
      </div>`);
    window._ml = (c) => { closePopup(); resolve(c); };
  });

  if (choice === 'attack') {
    // 攻城（失败后交税逻辑在 doAttack 内部处理）
    await doAttack('player', tile);
  } else {
    // ===== 选择交税：金币不足则先变卖城池 =====
    await _payTax('player', tile, taxAmount, defOwner, defLabel);
  }
}

// 缴税辅助：金币不足先变卖城池
async function _payTax(who, tile, taxAmount, defOwner, defLabel) {
  const atk = who === 'player' ? P : getPlayer(who);
  const def = getPlayer(defOwner);

  if (atk.coins < taxAmount) {
    const ownedCities = atk.cities.filter(id => ownership[id] === who);
    const hasCities = ownedCities.length > 0;
    await new Promise(resolve => {
      popup(`<div style="font-size:32px">🏚️</div>
        <h4 style="margin:4px 0;color:#c62828">金币不足以缴税！</h4>
        <p style="font-size:13px;color:#666;margin:8px 0">需缴 <b>${taxAmount}💰</b>，当前仅有 <b>${atk.coins}💰</b><br>
        ${hasCities ? '将随机变卖一座己方城池凑足税款' : '城池已尽，将倾尽所有'}</p>
        <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._mc()">确认</button>`);
      window._mc = () => { closePopup(); resolve(); };
    });
    if (hasCities) {
      const sold = sellRandomCity(who);
      if (sold) {
        log(`🏚️ 金币不足，变卖${sold.cityName}获得${sold.salePrice}💰`);
        await new Promise(resolve => {
          popup(`<div style="font-size:32px">🏚️</div>
            <h4 style="margin:4px 0">变卖城池</h4>
            <p style="font-size:13px;color:#666;margin:8px 0">
              <b>${sold.cityName}</b> 已变卖 +${sold.salePrice}💰<br>城池归还为无主之地
            </p>
            <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._mc()">继续</button>`);
          window._mc = () => { closePopup(); resolve(); };
        });
      }
    }
  }

  const actualTax = Math.min(taxAmount, atk.coins);
  atk.coins -= actualTax;
  def.coins += actualTax;
  log(`💰 过路费 ${tile.name} -${actualTax}💰`);
  renderStatus();
  if (who === 'player') {
    await new Promise(resolve => {
      popup(`<div style="font-size:32px">💰</div>
        <h4 style="margin:4px 0">缴纳过路费</h4>
        <p style="font-size:13px;color:#666;margin:8px 0">${tile.name}（${defLabel}）<br>缴税 <b style="color:#ef5350">-${actualTax}💰</b></p>
        <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._mc()">继续</button>`);
      window._mc = () => { closePopup(); resolve(); };
    });
  }
}

// 敌城：对战
async function doAttack(who, tile) {
  const atk = getPlayer(who);
  const defOwner = ownership[tile.id];
  const def = getPlayer(defOwner);
  const lv = cityLevels[tile.id] || 1;

  // 玩家攻城前先选战术
  let tactic = 'normal'; // normal | blitz | raid
  if (who === 'player') {
    const blitzCost = 5;
    const canBlitz = atk.coins >= blitzCost;
    tactic = await new Promise(resolve => {
      const defLabel = defOwner==='ai'?'曹操':'孙权';
      popup(`
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div style="font-size:22px">⚔️</div>
          <div style="text-align:left">
            <div style="font-weight:800;font-size:14px">${tile.name}</div>
            <div style="font-size:10px;color:#888">${defLabel}守城 Lv${lv} · 守军+${def.cities.length+UPGRADE_DEF[lv]+Math.floor(getGarrison(tile.id)/5)}（驻兵${getGarrison(tile.id)}÷5） &nbsp;·&nbsp; 你的兵力+${Math.floor(atk.troops/4)}（${atk.troops}÷4）</div>
          </div>
        </div>
        <p style="font-size:11px;color:#666;margin:0 0 10px">选择进攻战术：</p>
        <div style="display:flex;flex-direction:column;gap:7px">
          <button onclick="window._mt('normal')" style="text-align:left;padding:8px 12px;border-radius:9px;border:1.5px solid #ddd;background:#fafafa;cursor:pointer;font-family:inherit">
            <div style="font-weight:700;font-size:12px">⚔️ 常规进攻</div>
            <div style="font-size:10px;color:#888;margin-top:2px">标准掷骰对决，胜则占城，败则缴税</div>
          </button>
          <button onclick="window._mt('blitz')" style="text-align:left;padding:8px 12px;border-radius:9px;border:1.5px solid ${canBlitz?'#ff9800':'#ddd'};background:${canBlitz?'#fff8f0':'#f5f5f5'};cursor:${canBlitz?'pointer':'not-allowed'};font-family:inherit;opacity:${canBlitz?1:0.5}">
            <div style="font-weight:700;font-size:12px;color:${canBlitz?'#e65100':'#999'}">🔥 强攻 (-${blitzCost}💰)</div>
            <div style="font-size:10px;color:#888;margin-top:2px">消耗${blitzCost}金，攻击+3${canBlitz?'':'（金币不足）'}</div>
          </button>
          <button onclick="window._mt('raid')" style="text-align:left;padding:8px 12px;border-radius:9px;border:1.5px solid #7c4dff;background:#f3f0ff;cursor:pointer;font-family:inherit">
            <div style="font-weight:700;font-size:12px;color:#512da8">🌙 奇袭</div>
            <div style="font-size:10px;color:#888;margin-top:2px">无视城池等级加成，但胜后不获得城市奖励金</div>
          </button>
        </div>`);
      window._mt = (t) => {
        if (t === 'blitz' && !canBlitz) return;
        closePopup(); resolve(t);
      };
    });
  }

  // 战术效果
  if (tactic === 'blitz') { atk.coins -= 5; atk.buff += 3; }

  const atkAdv = atk.advisors.filter(a=>a.effect==='combat+3').length * 3;
  const defAdv = def.advisors.filter(a=>a.effect==='combat+3').length * 3;
  const balanceBonus = (def.cities.length - atk.cities.length >= 2) ? 2 : 0;
  const defLvBonus = tactic === 'raid' ? 0 : UPGRADE_DEF[lv]; // 奇袭无视城防
  const cityGarrison = getGarrison(tile.id); // 城池驻兵加入守方战力
  const troopAtk = Math.floor(atk.troops / 4);   // 兵力折算：每4兵=+1攻击
  const troopDef = Math.floor(cityGarrison / 5);  // 驻兵折算：每5兵=+1守城
  const ar = Math.floor(Math.random()*6)+1+atk.cities.length+troopAtk+atk.buff+atkAdv+balanceBonus - (atk.debuff||0);
  const dr = Math.floor(Math.random()*6)+1+def.cities.length+troopDef+defLvBonus+defAdv;
  atk.buff = 0; atk.debuff = 0;
  const win = atk.sureWin || ar > dr;
  if (atk.sureWin) { atk.sureWin = false; log(`⚡ 必胜发动！`); }

  // ===== 兵力互损：按战力比决定伤亡率（战力差距越大，弱方损失越多）=====
  // atkRate = dr/(ar+dr)，越强则率越低；defRate 反之
  const total = ar + dr;
  const atkRate    = Math.min(0.5, Math.max(0.05, dr / total));
  const defRate    = Math.min(0.5, Math.max(0.05, ar / total));
  const atkTroopsBefore = atk.troops;
  const defTroopsBefore = def.troops;
  const defGarrisonBefore = cityGarrison;
  const atkLoss      = atk.troops   > 0 ? Math.max(1, Math.ceil(atk.troops   * atkRate)) : 0;
  const defTroopLoss = def.troops   > 0 ? Math.max(1, Math.ceil(def.troops   * defRate)) : 0;
  const defLoss      = cityGarrison > 0 ? Math.max(1, Math.ceil(cityGarrison * defRate)) : 0;
  atk.troops = Math.max(0, atk.troops - atkLoss);
  def.troops = Math.max(0, def.troops - defTroopLoss);
  garrison[tile.id] = Math.max(0, cityGarrison - defLoss);

  let tax = 0;
  if (win) {
    def.cities = def.cities.filter(c=>c!==tile.id);
    ownership[tile.id] = who;
    atk.cities.push(tile.id);
    garrison[tile.id] = 0;
    // AI攻下城池后自动驻入部分兵力
    if (who !== 'player' && atk.troops > 0) {
      const send = Math.min(MAX_GARRISON, Math.ceil(atk.troops * (0.2 + Math.random() * 0.3)));
      garrison[tile.id] = send;
      atk.troops = Math.max(0, atk.troops - send);
    }
    if (tactic !== 'raid') {
      const bonusAdv = atk.advisors.filter(a=>a.effect==='cityBonus+5').length;
      if (bonusAdv > 0) atk.coins += bonusAdv * 5;
    }
  } else {
    tax = Math.max(2, 3 + def.cities.length + UPGRADE_TAX[lv]);
    if (tactic === 'blitz') tax = Math.floor(tax * 1.2); // 强攻败了多缴20%
    // 金币不足：先变卖城池（仅玩家需弹窗，AI直接处理）
    if (atk.coins < tax) {
      const ownedCities = atk.cities.filter(id => ownership[id] === who);
      if (ownedCities.length > 0) {
        const sold = sellRandomCity(who);
        if (sold) {
          log(`🏚️ ${who==='player'?'你':who==='ai'?'曹操':'孙权'} 金币不足，变卖${sold.cityName}获得${sold.salePrice}💰`);
          if (who === 'player') {
            await new Promise(resolve => {
              popup(`<div style="font-size:32px">🏚️</div>
                <h4 style="margin:4px 0;color:#c62828">攻城失败！金币不足</h4>
                <p style="font-size:13px;color:#666;margin:8px 0">需缴税 <b>${tax}💰</b>，金币不足<br><b>${sold.cityName}</b> 被迫变卖 +${sold.salePrice}💰</p>
                <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="window._mc()">继续</button>`);
              window._mc = () => { closePopup(); resolve(); };
            });
          }
        }
      }
    }
    tax = Math.min(tax, atk.coins);
    atk.coins -= tax;
    def.coins += tax;
  }

  const tacticStr = tactic==='blitz'?'🔥强攻':tactic==='raid'?'🌙奇袭':'';
  const whoLabel = who==='player'?'🏇你':who==='ai'?'🐴曹操':'👑孙权';
  const balanceStr = balanceBonus > 0 ? `⚖️+${balanceBonus} ` : '';
  const troopStr = atkLoss > 0 ? ` ⚔️攻-${atkLoss}兵` : '';
  log(`${whoLabel}${tacticStr} 攻${tile.name}(${balanceStr}${ar}v${dr})${win?'⚔️占领!':'❌败缴税'+tax+'💰'}${troopStr}`);
  renderStatus();
  renderBoard();

  if (who==='player') {
    return new Promise(resolve => {
      const tacticTag = tactic==='blitz'
        ? `<span style="font-size:10px;background:#ff9800;color:#fff;padding:1px 6px;border-radius:4px;font-weight:700">🔥 强攻</span>`
        : tactic==='raid'
        ? `<span style="font-size:10px;background:#7c4dff;color:#fff;padding:1px 6px;border-radius:4px;font-weight:700">🌙 奇袭</span>`
        : '';
      const troopDetail = (atkLoss > 0 || defTroopLoss > 0 || defLoss > 0)
        ? `<div style="font-size:11px;color:#888;background:#fff8f0;border-radius:7px;padding:5px 8px;margin:6px 0;text-align:left">
            ⚔️ 你的兵力 ${atkTroopsBefore}→<b>${atk.troops}</b>（-${atkLoss}）<br>
            🛡️ 敌方兵力 ${defTroopsBefore}→<b>${def.troops}</b>（-${defTroopLoss}）<br>
            🏰 守城驻兵 ${defGarrisonBefore}→<b>${garrison[tile.id]}</b>（-${defLoss}）
           </div>`
        : '';
      popup(`<div style="font-size:28px">${win?'⚔️':'🛡️'}</div>
        <h4 style="margin:4px 0">${win?`攻城成功！占领${tile.name}`:'攻城失败！'} ${tacticTag}</h4>
        <p style="font-size:11px;color:#666;margin:4px 0">${tile.desc}</p>
        ${balanceBonus>0?`<p style="font-size:10px;color:#ff9800;margin:2px 0">⚖️ 弱者联合 +${balanceBonus}攻击</p>`:''}
        ${atkTroopsBefore>0?`<p style="font-size:10px;color:#4caf50;margin:2px 0">⚔️ 你的兵力 ${atkTroopsBefore}÷4=+${Math.floor(atkTroopsBefore/4)}攻击</p>`:''}
        ${cityGarrison>0?`<p style="font-size:10px;color:#7c4dff;margin:2px 0">🏰 城池驻兵 ${cityGarrison}÷5=+${Math.floor(cityGarrison/5)}守城</p>`:''}
        <p style="margin:6px 0;font-size:15px">⚔️<b>${ar}</b> vs 🛡️<b>${dr}</b></p>
        ${troopDetail}
        ${win?'':` <p style="font-size:14px;font-weight:700;color:#ef5350">缴税 -${tax}💰</p>`}
        <button class="btn btn-primary" style="width:100%;margin-top:6px" onclick="window._mc()">${win?'派兵驻守 →':'继续'}</button>`);
      window._mc = async () => {
        closePopup();
        if (win) await showGarrisonPopup(tile);
        resolve();
      };
    });
  }

  // AI 攻打玩家城池时，弹窗展示战斗结果
  if (defOwner === 'player') {
    const atkLabel = who === 'ai' ? '曹操' : '孙权';
    const troopDetail = (atkLoss > 0 || defTroopLoss > 0 || defLoss > 0)
      ? `<div style="font-size:11px;color:#888;background:#fff8f0;border-radius:7px;padding:5px 8px;margin:6px 0;text-align:left">
          ⚔️ ${atkLabel}兵力 ${atkTroopsBefore}→<b>${atk.troops}</b>（-${atkLoss}）<br>
          🛡️ 你的兵力 ${defTroopsBefore}→<b>${def.troops}</b>（-${defTroopLoss}）<br>
          🏰 守城驻兵 ${defGarrisonBefore}→<b>${garrison[tile.id]}</b>（-${defLoss}）
         </div>`
      : '';
    await new Promise(resolve => {
      popup(`<div style="font-size:28px">${win ? '🏴' : '🛡️'}</div>
        <h4 style="margin:4px 0;color:${win?'#c62828':'#2e7d32'}">${win ? `${atkLabel}占领了你的${tile.name}！` : `${tile.name}守住了！`}</h4>
        <p style="font-size:11px;color:#666;margin:4px 0">⚔️<b>${ar}</b> vs 🛡️<b>${dr}</b></p>
        ${troopDetail}
        ${win ? '' : `<p style="font-size:13px;color:#ef5350;margin:4px 0">${atkLabel}缴税 <b>+${tax}💰</b> 给你</p>`}
        <button class="btn btn-primary" style="width:100%;margin-top:6px" onclick="window._mc()">知道了</button>`);
      window._mc = () => { closePopup(); resolve(); };
    });
  }
}

// 随机事件（含谋士抽取 20% / 天灾 15% / 普通 65%）
async function doEvent(who) {
  const p = getPlayer(who);
  const roll = Math.random();

  if (roll < 0.20) {
    const held = p.advisors.map(a=>a.id);
    const pool = ADVISOR_POOL.filter(a=>!held.includes(a.id));
    if (pool.length === 0 || p.advisors.length >= MAX_ADVISORS) {
      p.coins += 8;
      log(`📋 谋士已满，改获+8💰`);
      if (who==='player') return new Promise(r=>{ popup(`<div style="font-size:32px">📋</div><p>谋士已满，获得+8💰</p><button class="btn btn-primary" style="width:100%;margin-top:10px" onclick="window._mc()">继续</button>`); window._mc=()=>{closePopup();r();}; });
      return;
    }
    const adv = pool[Math.floor(Math.random()*pool.length)];
    p.advisors.push(adv);
    if (adv.effect==='move+1') p.bonus += 1;
    if (adv.effect==='freeCity') p.freeCity = true;
    if (adv.effect==='sureWin') p.sureWin = true;
    if (adv.effect==='debuff') {
      const enemies = getEnemies(who);
      const target = getPlayer(enemies[Math.floor(Math.random()*enemies.length)]);
      target.debuff = (target.debuff||0)+2;
    }
    if (adv.effect==='cityBonus+5') p.coins += 5;
    const whoLabel = who==='player'?'你':who==='ai'?'曹操':'孙权';
    log(`📋 ${whoLabel}获得谋士【${adv.name}】`);
    if (who==='player') {
      return new Promise(r=>{ popup(`<div style="font-size:36px">${adv.icon}</div>
        <h4>获得谋士·${adv.name}</h4>
        <p style="font-size:13px;color:#666;margin:6px 0">${adv.desc}</p>
        <button class="btn btn-primary" style="width:100%;margin-top:10px" onclick="window._mc()">继续</button>`);
        window._mc=()=>{closePopup();r();};
      });
    }
    return;
  }

  if (roll < 0.35) {
    const allCities = Object.keys(ownership).filter(id=>ownership[id]!=='disaster');
    if (allCities.length > 0) {
      const target = allCities[Math.floor(Math.random()*allCities.length)];
      const tile = BOARD.find(t=>t.id===target);
      const dis = DISASTERS[Math.floor(Math.random()*DISASTERS.length)];
      const rounds = dis.name==='火灾' ? 1 : 2;
      const prevOwner = ownership[target];
      const prevP = getPlayer(prevOwner);
      prevP.cities = prevP.cities.filter(c=>c!==target);
      disasterCities[target] = { rounds, prevOwner };
      ownership[target] = 'disaster';
      log(`${dis.icon} 天灾！${tile?.name||target}遭${dis.name}，失守${rounds}回合`);
      renderBoard();
      if (who==='player') {
        return new Promise(r=>{ popup(`<div style="font-size:40px">${dis.icon}</div>
          <h4>天灾·${dis.name}</h4>
          <p style="font-size:13px;color:#666;margin:6px 0">${tile?.name} 失守 ${rounds} 回合</p>
          <button class="btn btn-primary" style="width:100%;margin-top:10px" onclick="window._mc()">继续</button>`);
          window._mc=()=>{closePopup();r();};
        });
      }
    }
    return;
  }

  // 城池变量事件（蝗灾/大丰收）：15%概率
  if (roll < 0.50) {
    const ownedCities = Object.keys(ownership).filter(id => ownership[id] && ownership[id] !== 'disaster');
    if (ownedCities.length > 0) {
      const targetId = ownedCities[Math.floor(Math.random() * ownedCities.length)];
      const tile = BOARD.find(t => t.id === targetId);
      const isLocust = Math.random() < 0.5;
      const evType = isLocust ? 'locust' : 'harvest';
      const evRounds = 6;
      // 已有同类事件则刷新，不叠加
      cityEvents[targetId] = { type: evType, rounds: evRounds };
      renderBoard();
      const ownerLabel = ownership[targetId]==='player'?'你的':ownership[targetId]==='ai'?'曹操的':'孙权的';
      log(`${isLocust?'🦗':'🌾'} ${ownerLabel}${tile?.name}爆发${isLocust?'蝗灾！税收归零':'大丰收！税收翻倍'}，持续${evRounds}回合`);
      if (who === 'player') {
        return new Promise(r => {
          popup(`<div style="font-size:40px">${isLocust?'🦗':'🌾'}</div>
            <h4>${isLocust?'蝗灾爆发！':'大丰收！'}</h4>
            <p style="font-size:13px;color:#666;margin:6px 0">${ownerLabel}${tile?.name}<br>${isLocust?'税收归零':'税收翻倍'}，持续 <b>${evRounds}</b> 回合</p>
            <button class="btn btn-primary" style="width:100%;margin-top:10px" onclick="window._mc()">继续</button>`);
          window._mc = () => { closePopup(); r(); };
        });
      }
    }
    return;
  }

  const ev = EVENTS[Math.floor(Math.random()*EVENTS.length)];
  ev.fn(p);
  log(ev.text);
  if (who==='player') {
    return new Promise(resolve => {
      popup(`<div style="font-size:36px;margin-bottom:6px">${ev.text.split(' ')[0]}</div>
        <p style="font-size:15px;font-weight:600">${ev.text}</p>
        <button class="btn btn-primary" style="width:100%;margin-top:10px" onclick="window._mc()">继续</button>`);
      window._mc = ()=>{ closePopup(); resolve(); };
    });
  }
}

// ===== 驻兵辅助 =====
function getGarrison(cityId) { return garrison[cityId] || 0; }


// 玩家调兵弹窗：落在己城时触发
function showGarrisonPopup(tile) {
  return new Promise(resolve => {
    const g = getGarrison(tile.id);
    const space = MAX_GARRISON - g;
    const canSend = Math.min(space, P.troops);
    const canRecall = g;
    popup(`
      <div style="font-size:26px">🏰</div>
      <h4 style="margin:4px 0">${tile.name} 驻兵管理</h4>
      <p style="font-size:11px;color:#888;margin:4px 0">现有驻兵：<b>${g}</b> / ${MAX_GARRISON} &nbsp;·&nbsp; 你的可用兵力：<b>${P.troops}</b></p>
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin:10px 0">
        <button onclick="window._mgr(-1)" style="width:32px;height:32px;border-radius:50%;border:1.5px solid #ddd;font-size:18px;
          cursor:${canRecall?'pointer':'not-allowed'};background:${canRecall?'#fff':'#f5f5f5'};opacity:${canRecall?1:0.4}">−</button>
        <div style="text-align:center">
          <div style="font-size:28px;font-weight:800" id="gar-num">${g}</div>
          <div style="font-size:9px;color:#aaa">驻兵数</div>
        </div>
        <button onclick="window._mgr(1)" style="width:32px;height:32px;border-radius:50%;border:1.5px solid #ddd;font-size:18px;
          cursor:${canSend?'pointer':'not-allowed'};background:${canSend?'#fff':'#f5f5f5'};opacity:${canSend?1:0.4}">＋</button>
      </div>
      <p style="font-size:10px;color:#888;margin:0 0 8px">每驻1兵 → 守城战力+1</p>
      <button class="btn btn-primary" style="width:100%" onclick="window._mc()">确认</button>`);
    window._mgr = (delta) => {
      const cur = getGarrison(tile.id);
      const newG = Math.max(0, Math.min(MAX_GARRISON, cur + delta));
      const diff = newG - cur;
      if (diff > 0 && P.troops < diff) return;
      garrison[tile.id] = newG;
      P.troops -= diff;
      const el = document.getElementById('gar-num');
      if (el) el.textContent = newG;
      // 动态更新按钮可用状态
      renderStatus();
      // 重新渲染弹窗内状态行
      const info = document.querySelector('#popup-overlay p');
      if (info) info.innerHTML = `现有驻兵：<b>${newG}</b> / ${MAX_GARRISON} &nbsp;·&nbsp; 你的可用兵力：<b>${P.troops}</b>`;
    };
    window._mc = () => { closePopup(); renderBoard(); resolve(); };
  });
}

// AI回合（曹操或孙权）
async function aiTurn(who) {
  // 已破产退出则跳过，直接交回合
  if (eliminated.has(who)) {
    if (who === 'ai') {
      turn = 'ai2'; render();
      await wait(200); await aiTurn('ai2');
    } else {
      round++;
      for (const [p, label] of [[P,'刘备'],[AI,'曹操'],[SQ,'孙权']]) {
        const before = p.troops;
        p.troops = Math.min(MAX_TROOPS, p.troops + TROOP_REGEN);
        const gained = p.troops - before;
        if (gained > 0) log(`💂 ${label}补充兵力+${gained}（共${p.troops}）`);
      }
      for (const [cityId, info] of Object.entries(disasterCities)) {
        info.rounds--;
        if (info.rounds <= 0) {
          delete disasterCities[cityId];
          if (ownership[cityId] === 'disaster') {
            ownership[cityId] = info.prevOwner;
            const restored = BOARD.find(t=>t.id===cityId);
            const prevP = getPlayer(info.prevOwner);
            prevP.cities.push(cityId);
            log(`🌅 ${restored?.name||cityId}天灾结束，恢复占领`);
          }
        }
      }
      for (const [cityId, ev] of Object.entries(cityEvents)) {
        ev.rounds--;
        if (ev.rounds <= 0) {
          const tile = BOARD.find(t=>t.id===cityId);
          log(`🔄 ${tile?.name||cityId}${ev.type==='locust'?'蝗灾结束':'丰收结束'}，恢复正常税收`);
          delete cityEvents[cityId];
        }
      }
      turn = 'player'; rolling = false; render();
    }
    return;
  }
  try {
    const p = getPlayer(who);
    const dice = Math.floor(Math.random()*6)+1+p.bonus;
    p.bonus = 0;
    const label = who==='ai'?'曹操':'孙权';
    log(`${who==='ai'?'🐴':'👑'} ${label}掷出 ${dice}`);
    await moveAI(who, dice);
  } catch(e) {
    console.error(`[monopoly] aiTurn(${who}) error:`, e);
    if (who==='ai') {
      turn = 'ai2'; rolling = false; render();
      await wait(200); await aiTurn('ai2');
    } else {
      round++;
      turn = 'player'; rolling = false; render();
    }
  }
}

// AI专用移动：分叉路口均等随机
async function moveAI(who, steps) {
  const p = getPlayer(who);
  movingPiece = who;
  for (let i = 0; i < steps; i++) {
    const nexts = BOARD[p.pos].next;
    // 洛阳(pos 4)分叉：80%→邺城(5)，20%→官渡捷径(39)
    p.pos = (p.pos === 4 && nexts.length === 2)
      ? (Math.random() < 0.80 ? nexts[0] : nexts[1])
      : nexts[Math.floor(Math.random() * nexts.length)];
    _renderPieces();
    await wait(100);
  }
  movingPiece = null;
  _renderCities();
  _renderPieces();
  await land(who);
}

// ===== 胜利检测：一方占领所有城池则立即结束 =====
const TOTAL_CITIES = BOARD.filter(t => t.type === 'city').length;
const MAX_ROUNDS = 200;

async function checkWin() {
  // 统计各方有效城池（天灾格不算）
  const pCount = P.cities.filter(id => ownership[id] === 'player').length;
  const aCount = AI.cities.filter(id => ownership[id] === 'ai').length;
  const sCount = SQ.cities.filter(id => ownership[id] === 'ai2').length;

  // 回合上限：200回合后按城池数结算，城池多者获胜
  if (round > MAX_ROUNDS) {
    const standings = [
      { who: 'player', label: '🏇 刘备（你）', cities: pCount },
      { who: 'ai',     label: '🐴 曹操',       cities: aCount },
      { who: 'ai2',    label: '👑 孙权',        cities: sCount },
    ].sort((a, b) => b.cities - a.cities);
    const roundWinner = standings[0].who;
    log(`⌛ 已达${MAX_ROUNDS}回合上限！${standings[0].label}以${standings[0].cities}座城池夺得天下！`);
    clearSave();
    endGame('timeup', roundWinner);
    return true;
  }

  // 玩家破产：城池为0且金币为0
  if (pCount === 0 && P.coins <= 0) {
    log('💀 城破财尽，刘备落败！');
    clearSave();
    endGame('bankrupt');
    return true;
  }

  // AI破产检测：城池=0且金币=0 → 退出游戏，释放城池为无主
  for (const [who, label] of [['ai','曹操'],['ai2','孙权']]) {
    if (eliminated.has(who)) continue;
    const cnt = who === 'ai' ? aCount : sCount;
    const p = who === 'ai' ? AI : SQ;
    if (cnt === 0 && p.coins <= 0) {
      eliminated.add(who);
      // 释放该AI占有的城池为无主
      for (const id of [...p.cities]) {
        if (ownership[id] === who) delete ownership[id];
      }
      p.cities = [];
      log(`💀 ${label}城破财尽，退出争霸！`);
      renderBoard();
      renderStatus();
      // 棋子变灰
      const piece = $('piece-' + who);
      if (piece) {
        piece.style.filter = 'grayscale(1) opacity(0.45)';
        piece.style.animation = 'none';
        const ring = piece.querySelector('.piece-ring');
        if (ring) ring.style.display = 'none';
      }
      // 弹窗提示
      await new Promise(resolve => {
        const icon = who === 'ai' ? '🐴' : '👑';
        popup(`<div style="font-size:40px">💀</div>
          <h3 style="margin:6px 0;color:#555">${icon} ${label}霸业未成，黯然退场</h3>
          <p style="font-size:13px;color:#888;margin:8px 0">城池尽失，金币归零，${label}势力覆灭。</p>
          <button class="btn btn-primary" style="width:100%;margin-top:10px" onclick="window._mc()">继续</button>`);
        window._mc = () => { closePopup(); resolve(); };
      });
    }
  }

  // 两个AI都退出 → 玩家自动胜利
  if (eliminated.has('ai') && eliminated.has('ai2')) {
    log('🏆 曹操、孙权皆败！刘备一统天下！');
    clearSave();
    endGame('player');
    return true;
  }

  // 传统胜利：一方占领所有城池
  const winner =
    pCount  >= TOTAL_CITIES ? 'player' :
    aCount  >= TOTAL_CITIES ? 'ai'     :
    sCount  >= TOTAL_CITIES ? 'ai2'    : null;

  if (!winner) return false;

  const labels = { player:'🏇 刘备（你）', ai:'🐴 曹操', ai2:'👑 孙权' };
  log(`🏆 ${labels[winner]}占领全部城池，游戏结束！`);
  clearSave();
  endGame(winner);
  return true;
}

// ===== 游戏结束 =====
function endGame(forcedWinner, timeupWinner) {
  active = false;
  movingPiece = null;
  const scores = [
    { label:'🏇 刘备（你）', who:'player', cities: P.cities.length, coins: P.coins },
    { label:'🐴 曹操',       who:'ai',     cities: AI.cities.length, coins: AI.coins },
    { label:'👑 孙权',       who:'ai2',    cities: SQ.cities.length, coins: SQ.coins },
  ];
  scores.sort((a,b)=>b.cities-a.cities||b.coins-a.coins);
  const actualWinner = forcedWinner === 'timeup' ? timeupWinner : forcedWinner;
  const pWin = actualWinner ? actualWinner === 'player' : scores[0].who === 'player';
  const unifyBonus = (pWin && forcedWinner === 'player') ? 100 : 0;
  const goldEarned = pWin ? P.coins + unifyBonus : 0;
  if (goldEarned > 0) gameState.addGold(goldEarned);
  // 记录单局最高金币（结算时玩家手中金币）
  gameState.recordMonopolyMaxCoins(P.coins);
  // 制霸天下（占领全部城池获胜）
  if (pWin && forcedWinner === 'player') gameState.recordMonopolyUnify();
  const score = pWin ? calcSettleScore() : 0;
  gameState.recordMonopolySettle(score, pWin);
  if (window.authModule?.syncToCloud) window.authModule.syncToCloud().catch(() => {});

  const isBankrupt = forcedWinner === 'bankrupt';
  const isTimeUp   = forcedWinner === 'timeup';
  const allCity = forcedWinner != null && !isBankrupt && !isTimeUp;
  const resultIcon = isBankrupt ? '💀' : isTimeUp ? (pWin ? '⌛🏆' : '⌛😤') : pWin ? (allCity ? '🏆' : '🎉') : '😤';
  const resultText = isBankrupt ? '城破财尽，汉室倾覆！'
    : isTimeUp ? (pWin ? '天下归汉！' : `${scores[0].label}笑到最后…`)
    : pWin ? (allCity ? '制霸天下！' : '胜利！') : (allCity ? `${scores[0].label}统一天下…` : '落败…');
  const subText = isBankrupt
    ? '城池尽失，金币归零，大势已去。'
    : isTimeUp
      ? `${MAX_ROUNDS}回合终局，${scores[0].label}以 ${scores[0].cities} 座城池称雄！`
      : '';

  popup(`
    <div style="font-size:40px;margin-bottom:4px">${resultIcon}</div>
    <h3 style="font-size:22px;margin-bottom:${subText?2:12}px">${resultText}</h3>
    ${subText ? `<p style="font-size:12px;color:#f5a623;font-weight:700;margin-bottom:10px">${subText}</p>` : ''}
    <div style="margin:0 0 12px;padding:10px;background:#f5f5f5;border-radius:12px;text-align:left">
      ${scores.map((s,i)=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;${i<scores.length-1?'border-bottom:1px solid #eee':''}">
        <span>${i===0?'🥇':i===1?'🥈':'🥉'} ${s.label}</span><span>🏰${s.cities} 💰${s.coins}</span>
      </div>`).join('')}
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 0 0;margin-top:4px;border-top:1px solid #ddd">
        <span>回合</span><span>${round}</span>
      </div>
    </div>
    ${goldEarned > 0
      ? `<div style="padding:12px;background:linear-gradient(135deg,#fff8e1,#fff3d4);border-radius:12px;margin-bottom:12px">
          <p style="font-size:20px;font-weight:700;color:#f5a623">💰 +${goldEarned} 金币</p>
          ${unifyBonus > 0 ? `<p style="font-size:11px;color:#e67e00;margin:4px 0 0">含统一天下奖励 +${unifyBonus}💰</p>` : ''}
          <p style="font-size:13px;font-weight:700;color:#667eea;margin:6px 0 0">📊 +${score} 大富翁积分 · 已上榜</p>
        </div>`
      : `<div style="padding:12px;background:#f5f5f5;border-radius:12px;margin-bottom:12px">
          <p style="font-size:14px;color:#999">💔 战败不获得金币及积分</p>
        </div>`}
    <button class="btn btn-primary" style="width:100%" onclick="window._mc()">返回</button>`);

  window._mc = ()=>{ closePopup(); active = false; showStartScreen(); };

  if (pWin) {
    for(let i=0;i<25;i++){
      const e=document.createElement('div');e.className='confetti';
      e.style.left=Math.random()*100+'vw';
      e.style.background=['#ef5350','#4caf50','#4a90d9','#f5a623'][i%4];
      e.style.animationDelay=Math.random()*0.5+'s';
      document.body.appendChild(e);setTimeout(()=>e.remove(),2000);
    }
  }
}
