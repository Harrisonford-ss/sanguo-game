// 三国志探险 - 成就系统
import { gameState } from './state.js';

// ===== 成就定义 =====
// 单阶成就：{ id, name, icon, desc, check, reward }
// 阶梯成就：{ id, name, icon, stat, statLabel, stages: [{ label, threshold, reward }] }

export const ACHIEVEMENTS = [

  // ━━━ 单阶成就 · 事件/里程碑类 ━━━

  {
    id: 'peach_garden',
    name: '桃园结义', icon: '🍑',
    desc: '同时拥有刘备、关羽、张飞',
    check: s => !!(s.ownedCards?.liubei && s.ownedCards?.guanyu && s.ownedCards?.zhangfei),
    reward: { gacha: 15 },
  },
  {
    id: 'first_pull',
    name: '召将出征', icon: '✨',
    desc: '完成第1次抽卡',
    check: s => (s.totalGachaPulls || 0) >= 1,
    reward: { gold: 10 },
  },
  {
    id: 'first_stage',
    name: '踏上征途', icon: '🗺️',
    desc: '解锁第5关',
    check: s => (s.currentStage || 1) >= 5,
    reward: { quiz: 2 },
  },
  {
    id: 'first_three_stars',
    name: '摘星将领', icon: '⭐',
    desc: '某关卡首次获得3星通关',
    check: s => Object.values(s.stageStars || {}).some(v => v >= 3),
    reward: { gacha: 10 },
  },
  {
    id: 'pull_rare',
    name: '稀世名将', icon: '🌟',
    desc: '召唤到稀有(★★)武将',
    check: (s, extra) => !!(extra?.hasRare),
    reward: { gacha: 15 },
  },
  {
    id: 'pull_legend',
    name: '传说降临', icon: '🔮',
    desc: '召唤到传说(★★★)武将',
    check: (s, extra) => !!(extra?.hasLegend),
    reward: { gacha: 30 },
  },
  {
    id: 'ten_pull_first',
    name: '豪掷千金', icon: '💎',
    desc: '第1次十连抽卡',
    check: s => (s.tenPullCount || 0) >= 1,
    reward: { gacha: 15 },
  },
  {
    id: 'consecutive_5',
    name: '连战连捷', icon: '🔥',
    desc: '连续对战胜利5次',
    check: s => (s.maxConsecutiveWins || 0) >= 5,
    reward: { gold: 30 },
  },
  {
    id: 'upgrade_lv3',
    name: '名将传承', icon: '⬆️',
    desc: '将任意武将升至3级',
    check: s => (s.maxCardLevel || 0) >= 3,
    reward: { gold: 50 },
  },
  {
    id: 'upgrade_lv5',
    name: '绝世名将', icon: '🌠',
    desc: '将任意武将升至满级（5级）',
    check: s => (s.maxCardLevel || 0) >= 5,
    reward: { gold: 200, gacha: 30 },
  },
  {
    id: 'cards_all',
    name: '武将全收', icon: '🎖️',
    desc: '集齐全部36名武将',
    check: s => Object.keys(s.ownedCards || {}).length >= 36,
    reward: { gacha: 150 },
  },
  {
    id: 'quiz_all',
    name: '诸葛遗风', icon: '🪭',
    desc: '完成全部答题章节',
    check: s => Object.keys(s.completedQuizzes || {}).length >= 50,
    reward: { gacha: 150 },
  },
  {
    id: 'consecutive_20',
    name: '势如破竹', icon: '💥',
    desc: '连续对战胜利20次',
    check: s => (s.maxConsecutiveWins || 0) >= 20,
    reward: { gold: 150, gacha: 20 },
  },
  {
    id: 'all_master',
    name: '三国终结者', icon: '🏅',
    desc: '解锁全部其他成就的最高阶',
    check: s => _checkAllMaster(s),
    reward: { gold: 500, gacha: 200 },
  },

  // ━━━ 阶梯成就 · 累计类 ━━━

  {
    id: 'battle_hero',
    name: '沙场征战', icon: '⚔️',
    stat: s => s.battleWins || 0,
    statLabel: '次胜利',
    stages: [
      { label: '🥉 初出茅庐', threshold: 15,  reward: { gold: 20 } },
      { label: '🥈 久经沙场', threshold: 50,  reward: { gold: 60 } },
      { label: '🥇 百战名将', threshold: 150, reward: { gold: 150 } },
    ],
  },
  {
    id: 'quiz_scholar',
    name: '博学多才', icon: '📚',
    stat: s => Object.keys(s.completedQuizzes || {}).length,
    statLabel: '次答题',
    stages: [
      { label: '🥉 初涉典籍', threshold: 10, reward: { gacha: 10 } },
      { label: '🥈 饱读诗书', threshold: 30, reward: { gacha: 25 } },
      { label: '🥇 学富五车', threshold: 50, reward: { gacha: 60 } },
    ],
  },
  {
    id: 'card_collector',
    name: '武将图谱', icon: '🃏',
    stat: s => Object.keys(s.ownedCards || {}).length,
    statLabel: '名武将',
    stages: [
      { label: '🥉 崭露头角', threshold: 10, reward: { gacha: 10 } },
      { label: '🥈 将星汇聚', threshold: 22, reward: { gacha: 25 } },
      { label: '🥇 群英荟萃', threshold: 32, reward: { gacha: 60 } },
    ],
  },
  {
    id: 'gold_earner',
    name: '积金千两', icon: '💰',
    stat: s => s.totalGoldEarned || 0,
    statLabel: '金币',
    stages: [
      { label: '🥉 小有积蓄', threshold: 300,  reward: { gold: 30 } },
      { label: '🥈 富甲一方', threshold: 1500, reward: { gold: 100 } },
      { label: '🥇 富可敌国', threshold: 6000, reward: { gold: 300 } },
    ],
  },
  {
    id: 'star_gazer',
    name: '星光璀璨', icon: '🌟',
    stat: s => s.totalStars || 0,
    statLabel: '颗星',
    stages: [
      { label: '🥉 繁星初现', threshold: 30,  reward: { quiz: 3 } },
      { label: '🥈 星河流转', threshold: 80,  reward: { quiz: 6 } },
      { label: '🥇 满天繁星', threshold: 160, reward: { quiz: 12 } },
    ],
  },
  {
    id: 'quiz_master',
    name: '答题宗师', icon: '🧠',
    stat: s => s.totalQuizCorrect || 0,
    statLabel: '题答对',
    stages: [
      { label: '🥉 初窥门径', threshold: 100,  reward: { gacha: 10 } },
      { label: '🥈 融会贯通', threshold: 400,  reward: { gacha: 30 } },
      { label: '🥇 圣人之学', threshold: 1200, reward: { gacha: 80 } },
    ],
  },
  {
    id: 'dungeon_runner',
    name: '探险历程', icon: '🗺️',
    stat: s => s.dungeonRuns || 0,
    statLabel: '次探险',
    stages: [
      { label: '🥉 初入险境', threshold: 5,  reward: { gold: 20 } },
      { label: '🥈 身经百战', threshold: 15, reward: { gold: 60 } },
      { label: '🥇 探险宗师', threshold: 35, reward: { gold: 150 } },
    ],
  },
  {
    id: 'monopoly_king',
    name: '三国争霸', icon: '🎲',
    stat: s => s.monopolyWins || 0,
    statLabel: '次胜利',
    stages: [
      { label: '🥉 割据一方', threshold: 3,  reward: { gold: 30 } },
      { label: '🥈 称霸一域', threshold: 10, reward: { gold: 80 } },
      { label: '🥇 一统天下', threshold: 25, reward: { gold: 200 } },
    ],
  },
  {
    id: 'gacha_fan',
    name: '抽卡大师', icon: '💫',
    stat: s => s.totalGachaPulls || 0,
    statLabel: '次抽卡',
    stages: [
      { label: '🥉 初涉抽卡', threshold: 20,  reward: { gacha: 10 } },
      { label: '🥈 乐此不疲', threshold: 60,  reward: { gacha: 30 } },
      { label: '🥇 抽卡狂人', threshold: 150, reward: { gacha: 80 } },
    ],
  },
  {
    id: 'dungeon_depth',
    name: '深渊探索', icon: '🌑',
    stat: s => s.dungeonMaxFloor || 0,
    statLabel: '层（最深）',
    stages: [
      { label: '🥉 初探深渊',   threshold: 8,  reward: { gold: 30 } },
      { label: '🥈 深渊勇者',   threshold: 18, reward: { gold: 80 } },
      { label: '🥇 入九幽之境', threshold: 30, reward: { gold: 200 } },
    ],
  },
  {
    id: 'card_upgrade',
    name: '武将培养', icon: '📈',
    stat: s => s.cardUpgradeCount || 0,
    statLabel: '次升级',
    stages: [
      { label: '🥉 初露锋芒', threshold: 3,  reward: { gold: 20 } },
      { label: '🥈 精益求精', threshold: 10, reward: { gold: 60 } },
      { label: '🥇 千锤百炼', threshold: 25, reward: { gold: 150 } },
    ],
  },
  {
    id: 'ten_pull_fan',
    name: '十连达人', icon: '🎰',
    stat: s => s.tenPullCount || 0,
    statLabel: '次十连',
    stages: [
      { label: '🥉 一掷千金', threshold: 3,  reward: { gacha: 15 } },
      { label: '🥈 挥金如土', threshold: 8,  reward: { gacha: 35 } },
      { label: '🥇 豪气干云', threshold: 20, reward: { gacha: 80 } },
    ],
  },
];

// ===== 工具 =====
export const STAGED = ACHIEVEMENTS.filter(a => a.stages);
export const SINGLE = ACHIEVEMENTS.filter(a => a.check);
export const TOTAL_MILESTONES = SINGLE.length + STAGED.reduce((n, a) => n + a.stages.length, 0);

function stageKey(id, idx) { return `${id}_${idx}`; }
function isSingleUnlocked(id) { return gameState.isAchievementUnlocked(id); }
function isStageUnlocked(id, idx) { return gameState.isAchievementUnlocked(stageKey(id, idx)); }

function currentStageIndex(id) {
  const ach = STAGED.find(a => a.id === id);
  if (!ach) return -1;
  for (let i = ach.stages.length - 1; i >= 0; i--) {
    if (isStageUnlocked(id, i)) return i;
  }
  return -1;
}

function _checkAllMaster(s) {
  for (const a of SINGLE.filter(x => x.id !== 'all_master')) {
    if (!isSingleUnlocked(a.id)) return false;
  }
  for (const a of STAGED) {
    if (currentStageIndex(a.id) < a.stages.length - 1) return false;
  }
  return true;
}

export function unlockedMilestones() {
  let n = 0;
  for (const a of SINGLE) if (isSingleUnlocked(a.id)) n++;
  for (const a of STAGED) n += currentStageIndex(a.id) + 1;
  return n;
}

// ===== 奖励 =====
function rewardText(reward) {
  if (!reward) return '';
  const parts = [];
  if (reward.gold)  parts.push(`💰+${reward.gold}`);
  if (reward.gacha) parts.push(`💎+${reward.gacha}`);
  if (reward.quiz)  parts.push(`🎫+${reward.quiz}`);
  return parts.join(' ');
}

function grantReward(reward) {
  if (!reward) return;
  if (reward.gold)  gameState.addGold(reward.gold);
  if (reward.gacha) gameState.addGachaCoins(reward.gacha);
  if (reward.quiz)  gameState.addQuizCoins(reward.quiz);
}

// ===== 检查与解锁 =====
export function checkAchievements(extra = {}) {
  const s = gameState.data;
  let anyNew = false;

  for (const ach of SINGLE) {
    if (isSingleUnlocked(ach.id)) continue;
    try {
      if (ach.check(s, extra)) {
        if (gameState.unlockAchievement(ach.id)) {
          anyNew = true;
          grantReward(ach.reward);
          showUnlockToast(ach.icon, ach.name, rewardText(ach.reward));
        }
      }
    } catch(e) {}
  }

  for (const ach of STAGED) {
    const cur = currentStageIndex(ach.id);
    const val = (() => { try { return ach.stat(s); } catch(e) { return 0; } })();
    for (let i = cur + 1; i < ach.stages.length; i++) {
      const stage = ach.stages[i];
      if (val >= stage.threshold) {
        if (gameState.unlockAchievement(stageKey(ach.id, i))) {
          anyNew = true;
          grantReward(stage.reward);
          showUnlockToast(ach.icon, `${ach.name} ${stage.label}`, rewardText(stage.reward));
        }
      } else break;
    }
  }

  return anyNew;
}

// ===== Toast =====
function showUnlockToast(icon, title, rwText) {
  if (!document.getElementById('toast-style')) {
    const st = document.createElement('style');
    st.id = 'toast-style';
    st.textContent = `@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
    document.head.appendChild(st);
  }
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#1a237e,#283593);color:#fff;padding:10px 18px;border-radius:14px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,0.35);z-index:9999;font-size:13px;max-width:300px;animation:toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;`;
  toast.innerHTML = `
    <span style="font-size:26px">${icon}</span>
    <div>
      <div style="font-size:10px;opacity:0.7;margin-bottom:2px">🏆 成就解锁！</div>
      <div style="font-weight:700">${title}</div>
      ${rwText ? `<div style="font-size:11px;color:#ffd54f;margin-top:3px;font-weight:600">${rwText}</div>` : ''}
    </div>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s, transform 0.4s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 2800);
}

// ===== 初始化 =====
export function initAchievements() {
  window.achievementsModule = { refresh: renderAchievements, check: checkAchievements };
  gameState.on('achievement-unlocked', () => {
    updateHomeBadge();
    if (window.app?.currentScreen === 'achievements') renderAchievements();
  });
  ['stats-changed','coins-changed','cards-changed','stage-changed'].forEach(ev =>
    gameState.on(ev, () => checkAchievements())
  );
  updateHomeBadge();
  // 启动时检测一次，处理已满足条件的成就
  setTimeout(() => checkAchievements(), 300);
}

function updateHomeBadge() {
  const text = `${unlockedMilestones()}/${TOTAL_MILESTONES}`;
  document.querySelectorAll('#home-ach-count').forEach(el => el.textContent = text);
}

// ===== 渲染 =====
export function renderAchievements() {
  const container = document.getElementById('achievements-container');
  if (!container) return;
  updateHomeBadge();

  const unlocked = unlockedMilestones();
  const pct = Math.round(unlocked / TOTAL_MILESTONES * 100);

  container.innerHTML = `
    <div style="padding:14px 14px 0">
      <div style="background:linear-gradient(135deg,#1a237e,#4a148c);border-radius:14px;padding:14px 16px;color:#fff;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:13px;opacity:0.85">总进度</span>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:13px;font-weight:700">${unlocked} / ${TOTAL_MILESTONES}</span>
            <button onclick="window.achievementsModule?.check();window.achievementsModule?.refresh();" style="background:rgba(255,255,255,0.2);border:none;color:#fff;font-size:10px;padding:3px 8px;border-radius:8px;cursor:pointer;">🔄 检测</button>
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.2);border-radius:6px;height:8px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:#fff;border-radius:6px;transition:width 0.6s"></div>
        </div>
        <div style="font-size:11px;opacity:0.7;margin-top:6px">${pct}% 完成</div>
      </div>
    </div>

    <div style="padding:0 14px 10px">
      <div style="font-size:11px;font-weight:700;color:#888;margin-bottom:8px;letter-spacing:1px">▸ 单阶成就（${SINGLE.filter(a=>isSingleUnlocked(a.id)).length}/${SINGLE.length}）</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${SINGLE.map(a => renderSingleCard(a)).join('')}
      </div>
    </div>

    <div style="padding:0 14px 24px">
      <div style="font-size:11px;font-weight:700;color:#888;margin-bottom:8px;letter-spacing:1px">▸ 阶梯成就（${STAGED.reduce((n,a)=>n+Math.max(0,currentStageIndex(a.id)+1),0)}/${STAGED.reduce((n,a)=>n+a.stages.length,0)}）</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${STAGED.map(a => renderStagedCard(a)).join('')}
      </div>
    </div>
  `;
}

const STAGE_COLORS = ['#cd7f32','#9e9e9e','#f5a623'];
const STAGE_BGS    = ['#fff3e0','#f5f5f5','#fff8e1'];

function renderSingleCard(ach) {
  const done = isSingleUnlocked(ach.id);
  const rw = rewardText(ach.reward);
  return `
    <div style="background:${done?'#f3e5f5':'#f5f5f5'};border:2px solid ${done?'#ab47bc':'transparent'};border-radius:12px;padding:10px;position:relative;${done?'':'filter:saturate(0.25) opacity(0.55)'}">
      ${done?`<div style="position:absolute;top:6px;right:7px;font-size:10px;color:#ab47bc;font-weight:700">✓</div>`:''}
      <div style="font-size:26px;margin-bottom:5px">${ach.icon}</div>
      <div style="font-size:12px;font-weight:700;line-height:1.3">${ach.name}</div>
      <div style="font-size:10px;color:#888;margin-top:3px;line-height:1.4">${ach.desc}</div>
      ${rw?`<div style="font-size:10px;color:${done?'#7b1fa2':'#aaa'};margin-top:5px;font-weight:600">${rw}</div>`:''}
    </div>`;
}

function renderStagedCard(ach) {
  const cur = currentStageIndex(ach.id);
  const val = (() => { try { return ach.stat(gameState.data); } catch(e) { return 0; } })();
  const nextIdx = cur + 1;
  const hasNext = nextIdx < ach.stages.length;
  const nextStage = hasNext ? ach.stages[nextIdx] : null;
  const pct = hasNext ? Math.min(100, Math.round(val / nextStage.threshold * 100)) : 100;

  return `
    <div style="background:#fafafa;border:1.5px solid #e0e0e0;border-radius:14px;padding:12px;${cur<0?'filter:saturate(0.3) opacity(0.6)':''}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="font-size:28px">${ach.icon}</span>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700">${ach.name}</div>
          <div style="font-size:10px;color:#888;margin-top:1px">${cur>=0?ach.stages[cur].label:'未解锁'}</div>
        </div>
        <div style="font-size:12px;font-weight:700;color:#555">${val.toLocaleString()} ${ach.statLabel}</div>
      </div>
      <div style="display:flex;gap:5px;margin-bottom:8px">
        ${ach.stages.map((stage, i) => {
          const done = i <= cur;
          const rw = rewardText(stage.reward);
          return `<div style="flex:1;background:${done?STAGE_BGS[i]:'#f0f0f0'};border:1.5px solid ${done?STAGE_COLORS[i]:'#ddd'};border-radius:8px;padding:6px 4px;text-align:center">
            ${done?`<div style="font-size:9px;color:${STAGE_COLORS[i]};font-weight:700;margin-bottom:1px">✓</div>`:''}
            <div style="font-size:10px;font-weight:600;color:${done?'#333':'#aaa'};line-height:1.3">${stage.label}</div>
            <div style="font-size:9px;color:${done?'#666':'#bbb'};margin-top:2px">${stage.threshold.toLocaleString()}</div>
            ${rw?`<div style="font-size:9px;color:${done?STAGE_COLORS[i]:'#ccc'};margin-top:2px;font-weight:600">${rw}</div>`:''}
          </div>`;
        }).join('')}
      </div>
      ${hasNext
        ? `<div style="display:flex;align-items:center;gap:6px">
            <div style="flex:1;background:#e0e0e0;border-radius:4px;height:5px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${STAGE_COLORS[nextIdx]||'#9c27b0'};border-radius:4px;transition:width 0.5s"></div>
            </div>
            <div style="font-size:10px;color:#888;white-space:nowrap">${val.toLocaleString()} / ${nextStage.threshold.toLocaleString()}</div>
          </div>`
        : `<div style="font-size:11px;color:#f5a623;font-weight:700;text-align:center">🏆 全部达成！</div>`
      }
    </div>`;
}
