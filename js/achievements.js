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
    id: 'monopoly_score',
    name: '积分霸主', icon: '📊',
    stat: s => s.monopolyScore || 0,
    statLabel: '单局最高积分',
    stages: [
      { label: '🥉 崭露头角', threshold: 50,  reward: { gold: 50 } },
      { label: '🥈 名震一方', threshold: 120, reward: { gold: 150 } },
      { label: '🥇 天下第一', threshold: 200, reward: { gold: 400 } },
    ],
  },
  {
    id: 'monopoly_games',
    name: '久经沙场', icon: '🎮',
    stat: s => s.monopolyGames || 0,
    statLabel: '局',
    stages: [
      { label: '🥉 初出茅庐', threshold: 5,  reward: { gold: 20 } },
      { label: '🥈 身经百战', threshold: 20, reward: { gold: 60 } },
      { label: '🥇 沙场老将', threshold: 50, reward: { gold: 150 } },
    ],
  },
  {
    id: 'monopoly_rich',
    name: '富可敌国', icon: '💰',
    stat: s => s.monopolyMaxCoins || 0,
    statLabel: '金币（单局最高）',
    stages: [
      { label: '🥉 小有家财', threshold: 200,  reward: { gold: 30 } },
      { label: '🥈 腰缠万贯', threshold: 500,  reward: { gold: 80 } },
      { label: '🥇 富可敌国', threshold: 1000, reward: { gold: 150 } },
    ],
  },
  {
    id: 'monopoly_unify',
    name: '制霸天下', icon: '👑',
    stat: s => s.monopolyUnifyCount || 0,
    statLabel: '次统一全图',
    stages: [
      { label: '🥉 初定天下', threshold: 3,  reward: { gold: 100 } },
      { label: '🥈 再造乾坤', threshold: 10, reward: { gold: 250 } },
      { label: '🥇 万古一帝', threshold: 20, reward: { gold: 500 } },
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
function isSingleClaimed(id)  { return gameState.isAchievementClaimed(id); }
function isStageUnlocked(id, idx) { return gameState.isAchievementUnlocked(stageKey(id, idx)); }
function isStageClaimed(id, idx)  { return gameState.isAchievementClaimed(stageKey(id, idx)); }

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

// 是否有已达成但未领取的成就
function hasUnclaimed() {
  for (const a of SINGLE) {
    if (isSingleUnlocked(a.id) && !isSingleClaimed(a.id)) return true;
  }
  for (const a of STAGED) {
    const cur = currentStageIndex(a.id);
    for (let i = 0; i <= cur; i++) {
      if (!isStageClaimed(a.id, i)) return true;
    }
  }
  return false;
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

// ===== 领取成就奖励 =====
function claimAndShow(key, icon, name, reward) {
  if (!gameState.claimAchievement(key)) return; // already claimed
  grantReward(reward);
  const rw = rewardText(reward);
  showClaimPopup(icon, name, rw);
  updateHomeBadge();
  renderAchievements();
}

window._claimAchievement = function(key, icon, name, rewardJson) {
  const reward = JSON.parse(rewardJson);
  claimAndShow(key, icon, name, reward);
};

function showClaimPopup(icon, name, rwText) {
  document.getElementById('ach-claim-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'ach-claim-overlay';
  overlay.className = 'ach-popup-overlay';
  overlay.innerHTML = `
    <div class="ach-popup-box">
      <span class="ach-popup-icon">${icon}</span>
      <div class="ach-popup-label">🏆 成就达成</div>
      <div class="ach-popup-name">${name}</div>
      ${rwText ? `
        <div class="ach-popup-reward">
          <div class="ach-popup-reward-label">获得奖励</div>
          <div class="ach-popup-reward-value">${rwText}</div>
        </div>` : ''}
      <button class="ach-popup-confirm" onclick="document.getElementById('ach-claim-overlay').remove()">太好了！</button>
    </div>`;
  document.body.appendChild(overlay);
}

// ===== 检查与解锁（只标记达成，不发奖励）=====
export function checkAchievements(extra = {}) {
  const s = gameState.data;
  let anyNew = false;

  for (const ach of SINGLE) {
    if (isSingleUnlocked(ach.id)) continue;
    try {
      if (ach.check(s, extra)) {
        if (gameState.unlockAchievement(ach.id)) {
          anyNew = true;
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
        }
      } else break;
    }
  }

  if (anyNew) updateHomeBadge();
  return anyNew;
}

// ===== 迁移：旧版已解锁成就静默标记为已领取（避免重复发奖）=====
function migrateOldUnlocked() {
  let migrated = false;
  for (const a of SINGLE) {
    if (isSingleUnlocked(a.id) && !isSingleClaimed(a.id)) {
      gameState.claimAchievement(a.id);
      migrated = true;
    }
  }
  for (const a of STAGED) {
    const cur = currentStageIndex(a.id);
    for (let i = 0; i <= cur; i++) {
      if (!isStageClaimed(a.id, i)) {
        gameState.claimAchievement(stageKey(a.id, i));
        migrated = true;
      }
    }
  }
  return migrated;
}

// ===== 初始化 =====
export function initAchievements() {
  window.achievementsModule = { refresh: renderAchievements, check: checkAchievements };

  // 将本次更新前已解锁的成就全部静默标记为已领取
  migrateOldUnlocked();

  gameState.on('achievement-unlocked', () => {
    updateHomeBadge();
    if (window.app?.currentScreen === 'achievements') renderAchievements();
  });
  gameState.on('achievement-claimed', () => {
    updateHomeBadge();
  });
  ['stats-changed','coins-changed','cards-changed','stage-changed'].forEach(ev =>
    gameState.on(ev, () => checkAchievements())
  );
  updateHomeBadge();
  setTimeout(() => checkAchievements(), 300);
}

function updateHomeBadge() {
  const text = `${unlockedMilestones()}/${TOTAL_MILESTONES}`;
  document.querySelectorAll('#home-ach-count').forEach(el => el.textContent = text);

  const unclaimed = hasUnclaimed();
  document.querySelectorAll('#home-ach-dot, #tab-ach-dot').forEach(el => {
    el.style.display = unclaimed ? 'block' : 'none';
  });
}

// ===== 渲染 =====
export function renderAchievements() {
  const container = document.getElementById('achievements-container');
  if (!container) return;
  updateHomeBadge();

  const unlocked = unlockedMilestones();
  const pct = Math.round(unlocked / TOTAL_MILESTONES * 100);
  const singleUnlocked = SINGLE.filter(a => isSingleUnlocked(a.id)).length;
  const stagedUnlocked = STAGED.reduce((n, a) => n + Math.max(0, currentStageIndex(a.id) + 1), 0);
  const stagedTotal    = STAGED.reduce((n, a) => n + a.stages.length, 0);

  container.innerHTML = `
    <div class="ach-hero">
      <button class="ach-check-btn" onclick="window.achievementsModule?.check();window.achievementsModule?.refresh();">🔄 检测</button>
      <div class="ach-hero-title">成就殿堂</div>
      <div class="ach-hero-sub">HALL OF ACHIEVEMENTS</div>
      <div class="ach-progress-wrap">
        <div class="ach-progress-row">
          <span class="ach-progress-label">总进度</span>
          <span class="ach-progress-count">${unlocked} / ${TOTAL_MILESTONES}</span>
        </div>
        <div class="ach-progress-track">
          <div class="ach-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="ach-progress-pct">${pct}% 已完成</div>
      </div>
    </div>

    <div class="ach-section-header">
      <div class="ach-section-line"></div>
      <span class="ach-section-title">单阶成就</span>
      <span class="ach-section-count">${singleUnlocked}/${SINGLE.length}</span>
      <div class="ach-section-line" style="background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15))"></div>
    </div>
    <div class="ach-single-grid">
      ${SINGLE.map(a => renderSingleCard(a)).join('')}
    </div>

    <div class="ach-section-header">
      <div class="ach-section-line"></div>
      <span class="ach-section-title">阶梯成就</span>
      <span class="ach-section-count">${stagedUnlocked}/${stagedTotal}</span>
      <div class="ach-section-line" style="background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15))"></div>
    </div>
    <div class="ach-staged-list">
      ${STAGED.map(a => renderStagedCard(a)).join('')}
    </div>
  `;
}

const STAGE_MEDAL = ['bronze', 'silver', 'gold'];

function renderSingleCard(ach) {
  const unlocked  = isSingleUnlocked(ach.id);
  const claimed   = isSingleClaimed(ach.id);
  const claimable = unlocked && !claimed;
  const rw = rewardText(ach.reward);
  const rewardJson = JSON.stringify(ach.reward).replace(/"/g, '&quot;');
  const nameEsc = ach.name.replace(/'/g, "\\'");
  const iconEsc = ach.icon.replace(/'/g, "\\'");

  const stateClass = claimable ? 'ach-card--claimable' : claimed ? 'ach-card--claimed' : 'ach-card--locked';
  const onclick = claimable ? `window._claimAchievement('${ach.id}','${iconEsc}','${nameEsc}','${rewardJson}')` : '';

  return `
    <div class="ach-card ${stateClass}" onclick="${onclick}">
      ${claimed   ? `<div class="ach-claimed-badge">✓</div>` : ''}
      ${claimable ? `<div class="ach-dot"></div>` : ''}
      <span class="ach-card-icon">${ach.icon}</span>
      <div class="ach-card-name">${ach.name}</div>
      <div class="ach-card-desc">${ach.desc}</div>
      ${rw ? `<div class="ach-card-reward">${rw}</div>` : ''}
      ${claimable ? `<div class="ach-claim-btn">点击领取</div>` : ''}
    </div>`;
}

function renderStagedCard(ach) {
  const cur = currentStageIndex(ach.id);
  const val = (() => { try { return ach.stat(gameState.data); } catch(e) { return 0; } })();
  const nextIdx   = cur + 1;
  const hasNext   = nextIdx < ach.stages.length;
  const nextStage = hasNext ? ach.stages[nextIdx] : null;
  const pct = hasNext ? Math.min(100, Math.round(val / nextStage.threshold * 100)) : 100;
  const anyClaimable = cur >= 0 && ach.stages.slice(0, cur + 1).some((_, i) => !isStageClaimed(ach.id, i));
  const medal = STAGE_MEDAL[Math.min(cur, 2)] || 'gold';

  const chips = ach.stages.map((stage, i) => {
    const done           = i <= cur;
    const stageClaimed   = isStageClaimed(ach.id, i);
    const stageClaimable = done && !stageClaimed;
    const rw  = rewardText(stage.reward);
    const key = `${ach.id}_${i}`;
    const nameEsc = (`${ach.name} ${stage.label}`).replace(/'/g, "\\'");
    const iconEsc = ach.icon.replace(/'/g, "\\'");
    const rewardJson = JSON.stringify(stage.reward).replace(/"/g, '&quot;');
    const chipMedal  = STAGE_MEDAL[i];
    const chipState  = stageClaimable ? 'ach-stage-chip--claimable' : stageClaimed ? 'ach-stage-chip--claimed' : 'ach-stage-chip--locked';
    const onclick    = stageClaimable ? `window._claimAchievement('${key}','${iconEsc}','${nameEsc}','${rewardJson}')` : '';

    return `
      <div class="ach-stage-chip ${chipState} ${chipMedal}" onclick="${onclick}">
        ${stageClaimable ? `<div class="ach-stage-dot"></div>` : ''}
        ${stageClaimed   ? `<span class="ach-stage-check">✓</span>` : ''}
        <div class="ach-stage-chip-label">${stage.label}</div>
        <div class="ach-stage-chip-threshold">${stage.threshold.toLocaleString()}</div>
        ${rw ? `<div class="ach-stage-chip-reward">${rw}</div>` : ''}
        ${stageClaimable ? `<div class="ach-stage-chip-claim">领取</div>` : ''}
      </div>`;
  }).join('');

  return `
    <div class="ach-staged-card ${anyClaimable ? 'ach-staged-card--has-claimable' : ''}">
      <div class="ach-staged-head">
        <span class="ach-staged-icon">${ach.icon}</span>
        <div class="ach-staged-info">
          <div class="ach-staged-name">${ach.name}</div>
          <div class="ach-staged-current">${cur >= 0 ? ach.stages[cur].label : '未解锁'}</div>
        </div>
        <div class="ach-staged-val">${val.toLocaleString()} ${ach.statLabel}</div>
      </div>
      <div class="ach-stages-row">${chips}</div>
      ${hasNext
        ? `<div class="ach-bar-row">
            <div class="ach-bar-track">
              <div class="ach-bar-fill ${STAGE_MEDAL[nextIdx] || 'gold'}" style="width:${pct}%"></div>
            </div>
            <div class="ach-bar-text">${val.toLocaleString()} / ${nextStage.threshold.toLocaleString()}</div>
          </div>`
        : `<div class="ach-bar-complete">🏆 全部达成！</div>`
      }
    </div>`;
}
