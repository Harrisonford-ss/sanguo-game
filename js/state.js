// v49
// 三国志探险 - 游戏状态管理
import { characters } from '../data/characters.js';
// 双货币系统：答题积分(quizCoins) + 抽卡积分(gachaCoins)
// 对战胜利 → 答题积分 → 答题 → 抽卡积分 → 抽卡 → 更强 → 更难对战

// ===== 单卡战力公式（统一） =====
// 稀有度基础值 + 属性均值加成，再乘等级倍率
const RARITY_BASE = { legend: 200, rare: 120, common: 60 };
export function calcCharPower(charId, level = 1) {
  const char = characters.find(c => c.id === charId);
  if (!char) return 0;
  const base = RARITY_BASE[char.rarity] || 60;
  const statSum = Object.values(char.stats || {}).reduce((s, v) => s + v, 0);
  const growth = Math.floor(base * 0.2);
  return base + statSum + (level - 1) * growth;
}

const STORAGE_KEY = 'sanguo-game-v3';

const defaultState = {
  // 三种货币
  quizCoins: 3,       // 答题积分（对战获得，用于答题）
  gachaCoins: 30,     // 抽卡积分（答题获得，用于抽卡）
  gold: 0,            // 金币（大富翁获得，用于升级武将）
  profileAvatar: 'liubei', // 玩家选择的头像武将ID
  signDay: 0,           // 当前签到第几天（1~7，0=未开始）
  lastSignDate: '',     // 上次签到日期 'YYYY-MM-DD'
  stamina: 10,             // 当前体力
  staminaLastRegen: 0,     // 上次恢复时间戳(ms)

  // 卡牌（初始赠送3张：刘备、关羽、张飞——桃园三结义）
  ownedCards: {
    liubei: { level: 1 },
    guanyu: { level: 1 },
    zhangfei: { level: 1 },
  },
  fragments: {},  // { charId: count } 各武将专属碎片

  // 关卡进度
  currentStage: 1,
  stageStars: {},
  totalStars: 0,

  // 答题
  completedQuizzes: {},
  quizTickets: 3,

  // 抽卡
  gachaPityRare: 0,
  gachaPityLegend: 0,
  totalGachaPulls: 0,

  // 统计
  battleWins: 0,
  totalQuizCorrect: 0,
  totalGoldEarned: 0,
  totalGachaPulls: 0,
  tenPullCount: 0,
  monopolyWins: 0,
  dungeonRuns: 0,
  dungeonMaxFloor: 0,
  monopolyScore: 0,
  monopolyWins: 0,
  monopolyGames: 0,
  monopolyMaxCoins: 0,
  monopolyUnifyCount: 0,
  quizPerfectCount: 0,
  consecutiveWins: 0,
  maxConsecutiveWins: 0,
  cardUpgradeCount: 0,
  maxCardLevel: 0,
  achievementsUnlocked: {},
  achievementsClaimed: {},
};

class GameState {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 深度合并：ownedCards 需要特殊处理，不能被空对象覆盖
        const data = { ...defaultState, ...parsed };
        // ownedCards 合并默认卡+存档卡
        data.ownedCards = { ...defaultState.ownedCards, ...(parsed.ownedCards || {}) };
        return data;
      }
    } catch (e) {
      console.warn('存档读取失败');
    }
    return JSON.parse(JSON.stringify(defaultState)); // 深拷贝
  }

  save() {
    try {
      this.data.lastSaved = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {}
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(defaultState));
    this.save();
    this.emit('state-changed');
  }

  // ===== 答题积分（对战获得，用于答题） =====
  get quizCoins() { return this.data.quizCoins; }

  addQuizCoins(n) {
    this.data.quizCoins += n;
    this.save();
    this.emit('coins-changed');
  }

  spendQuizCoin() {
    if (this.data.quizCoins < 1) return false;
    this.data.quizCoins--;
    this.save();
    this.emit('coins-changed');
    return true;
  }

  get profileAvatar() { return this.data.profileAvatar || 'liubei'; }

  // ===== 体力系统 =====
  static STAMINA_MAX = 10;
  static STAMINA_REGEN_MS = 10 * 60 * 1000; // 10分钟

  get stamina() {
    this._regenStamina();
    return this.data.stamina ?? GameState.STAMINA_MAX;
  }

  get staminaMax() { return GameState.STAMINA_MAX; }

  // 计算并补回离线期间恢复的体力
  _regenStamina() {
    const cur = this.data.stamina ?? GameState.STAMINA_MAX;
    if (cur >= GameState.STAMINA_MAX) {
      this.data.staminaLastRegen = Date.now();
      return;
    }
    const last = this.data.staminaLastRegen || Date.now();
    const elapsed = Date.now() - last;
    const gained = Math.floor(elapsed / GameState.STAMINA_REGEN_MS);
    if (gained > 0) {
      this.data.stamina = Math.min(GameState.STAMINA_MAX, cur + gained);
      this.data.staminaLastRegen = last + gained * GameState.STAMINA_REGEN_MS;
      this.save();
    }
  }

  // 下次恢复还需多少毫秒
  staminaRegenMs() {
    if (this.stamina >= GameState.STAMINA_MAX) return 0;
    const last = this.data.staminaLastRegen || Date.now();
    const elapsed = Date.now() - last;
    return GameState.STAMINA_REGEN_MS - (elapsed % GameState.STAMINA_REGEN_MS);
  }

  spendStamina() {
    this._regenStamina();
    if ((this.data.stamina ?? GameState.STAMINA_MAX) <= 0) return false;
    this.data.stamina = (this.data.stamina ?? GameState.STAMINA_MAX) - 1;
    if (!this.data.staminaLastRegen) this.data.staminaLastRegen = Date.now();
    this.save();
    this.emit('stamina-changed');
    return true;
  }

  // ===== 抽卡积分（答题获得，用于抽卡） =====
  get gachaCoins() { return this.data.gachaCoins; }

  addGachaCoins(n) {
    this.data.gachaCoins += n;
    this.save();
    this.emit('coins-changed');
  }

  spendGachaCoins(n) {
    if (this.data.gachaCoins < n) return false;
    this.data.gachaCoins -= n;
    this.save();
    this.emit('coins-changed');
    return true;
  }

  // ===== 金币（大富翁获得，升级武将消耗）=====
  get gold() { return this.data.gold; }

  addGold(n) {
    this.data.gold += n;
    if (n > 0) this.data.totalGoldEarned = (this.data.totalGoldEarned || 0) + n;
    this.save();
    this.emit('coins-changed');
  }

  spendGold(n) {
    if (this.data.gold < n) return false;
    this.data.gold -= n;
    this.save();
    this.emit('coins-changed');
    return true;
  }

  // ===== 卡牌 =====
  get ownedCards() { return this.data.ownedCards; }
  get cardCount() { return Object.keys(this.data.ownedCards).length; }

  hasCard(id) { return !!this.data.ownedCards[id]; }
  getCardLevel(id) { return this.data.ownedCards[id]?.level || 0; }

  // fragments 为 { charId: count }，兼容旧存档（旧存档为数字则丢弃）
  getFragments(charId) {
    const f = this.data.fragments;
    if (typeof f !== 'object' || f === null) return 0;
    return f[charId] || 0;
  }

  addCard(charId) {
    if (this.data.ownedCards[charId]) return false;
    this.data.ownedCards[charId] = { level: 1 };
    this.save();
    this.emit('cards-changed');
    return true;
  }

  addFragments(charId, n) {
    if (typeof this.data.fragments !== 'object' || this.data.fragments === null) {
      this.data.fragments = {};
    }
    this.data.fragments[charId] = (this.data.fragments[charId] || 0) + n;
    this.save();
    this.emit('cards-changed');
  }

  // 升级消耗：金币 + 对应武将专属碎片，按等级递增
  getUpgradeCost(charId) {
    const level = this.getCardLevel(charId);
    const char = characters.find(c => c.id === charId);
    const rarity = char?.rarity || 'common';
    const goldByRarity = {
      common: [0, 50, 120, 250, 500],
      rare:   [0, 80, 200, 400, 800],
      legend: [0, 120, 300, 600, 1200],
    };
    const gold = (goldByRarity[rarity] || goldByRarity.common)[level] || 999;
    const fragments = [0, 10, 20, 30, 40][level] || 99;
    return { gold, fragments };
  }

  canUpgradeCard(charId) {
    const card = this.data.ownedCards[charId];
    if (!card || card.level >= 5) return false;
    const cost = this.getUpgradeCost(charId);
    return this.data.gold >= cost.gold && this.getFragments(charId) >= cost.fragments;
  }

  upgradeCard(charId) {
    if (!this.canUpgradeCard(charId)) return false;
    const cost = this.getUpgradeCost(charId);
    this.data.gold -= cost.gold;
    if (typeof this.data.fragments !== 'object' || this.data.fragments === null) {
      this.data.fragments = {};
    }
    this.data.fragments[charId] = (this.data.fragments[charId] || 0) - cost.fragments;
    this.data.ownedCards[charId].level++;
    this.data.cardUpgradeCount = (this.data.cardUpgradeCount || 0) + 1;
    const allLevels = Object.values(this.data.ownedCards).map(c => c.level || 1);
    this.data.maxCardLevel = Math.max(this.data.maxCardLevel || 0, ...allLevels);
    this.save();
    this.emit('cards-changed');
    this.emit('coins-changed');
    return true;
  }

  // ===== 关卡 =====
  get currentStage() { return this.data.currentStage; }
  get totalStars() { return this.data.totalStars; }

  // difficulty: 'normal'|'elite'|'legend'
  _stageKey(stageId, difficulty = 'normal') {
    return difficulty === 'normal' ? stageId : `${stageId}_${difficulty}`;
  }

  getStageStars(stageId, difficulty = 'normal') {
    return this.data.stageStars[this._stageKey(stageId, difficulty)] || 0;
  }

  // 精英/传说需要普通通关才能解锁
  isDifficultyUnlocked(stageId, difficulty) {
    if (difficulty === 'normal') return true;
    if (difficulty === 'elite')  return this.getStageStars(stageId, 'normal') > 0;
    if (difficulty === 'legend') return this.getStageStars(stageId, 'elite') > 0;
    return false;
  }

  // 每日通关次数 key：日期_关卡_难度
  _dailyClearKey(stageId, difficulty = 'normal') {
    const today = new Date().toISOString().slice(0, 10);
    return `${today}_${stageId}_${difficulty}`;
  }

  getDailyClears(stageId, difficulty = 'normal') {
    if (!this.data.dailyClears) this.data.dailyClears = {};
    return this.data.dailyClears[this._dailyClearKey(stageId, difficulty)] || 0;
  }

  _recordDailyClear(stageId, difficulty = 'normal') {
    if (!this.data.dailyClears) this.data.dailyClears = {};
    const k = this._dailyClearKey(stageId, difficulty);
    this.data.dailyClears[k] = (this.data.dailyClears[k] || 0) + 1;
  }

  static DAILY_SWEEP_MAX = 10;

  getDailySweeps(stageId, difficulty = 'normal') {
    if (!this.data.dailySweeps) this.data.dailySweeps = {};
    const today = new Date().toISOString().slice(0, 10);
    return this.data.dailySweeps[`${today}_${stageId}_${difficulty}`] || 0;
  }

  recordDailySweep(stageId, difficulty = 'normal', times = 1) {
    if (!this.data.dailySweeps) this.data.dailySweeps = {};
    const today = new Date().toISOString().slice(0, 10);
    const k = `${today}_${stageId}_${difficulty}`;
    this.data.dailySweeps[k] = (this.data.dailySweeps[k] || 0) + times;
  }

  remainingSweeps(stageId, difficulty = 'normal') {
    return Math.max(0, GameState.DAILY_SWEEP_MAX - this.getDailySweeps(stageId, difficulty));
  }

  // 完成关卡，返回本次获得的星和答题积分
  completeStage(stageId, stars, difficulty = 'normal') {
    const key = this._stageKey(stageId, difficulty);
    const prev = this.data.stageStars[key] || 0;
    const newStars = Math.max(prev, stars);
    const starsGained = newStars - prev;

    this.data.stageStars[key] = newStars;
    this.data.totalStars += starsGained;
    this.data.battleWins++;
    this.data.consecutiveWins = (this.data.consecutiveWins || 0) + 1;
    this.data.maxConsecutiveWins = Math.max(this.data.maxConsecutiveWins || 0, this.data.consecutiveWins);

    // 只有普通难度推进关卡进度
    if (difficulty === 'normal' && stageId >= this.data.currentStage) {
      this.data.currentStage = stageId + 1;
    }

    // 每日通关次数决定奖励：首次=满，第二次=半，第三次+=0
    const clearCount = this.getDailyClears(stageId, difficulty);
    this._recordDailyClear(stageId, difficulty);

    // 基础奖励：普通1 精英2 传说3（reduced）
    const base = difficulty === 'legend' ? 3 : difficulty === 'elite' ? 2 : 1;
    let quizReward = 0;
    if (clearCount === 0) quizReward = base;
    else if (clearCount === 1) quizReward = Math.floor(base / 2);
    // clearCount >= 2: reward = 0

    if (quizReward > 0) this.data.quizCoins += quizReward;

    // 首次通关金币奖励
    let goldReward = 0;
    if (prev === 0 && stars > 0) {
      goldReward = difficulty === 'legend' ? 60 : difficulty === 'elite' ? 30 : 10;
      this.data.gold = (this.data.gold || 0) + goldReward;
    }

    this.save();
    this.emit('coins-changed');
    this.emit('stage-changed');
    this.emit('stats-changed');

    return { starsGained, quizReward, clearCount, goldReward };
  }

  // ===== 答题 =====
  get completedQuizzes() { return this.data.completedQuizzes; }

  isQuizCompleted(quizId) {
    return !!this.data.completedQuizzes[quizId];
  }

  // 完成答题，返回获得的抽卡积分
  completeQuiz(quizId, correctCount, totalCount) {
    const isFirst = !this.data.completedQuizzes[quizId];
    const prev = this.data.completedQuizzes[quizId];

    this.data.completedQuizzes[quizId] = {
      bestScore: Math.max(correctCount, prev?.bestScore || 0),
      times: (prev?.times || 0) + 1
    };

    this.data.totalQuizCorrect += correctCount;
    if (correctCount === totalCount && totalCount > 0) {
      this.data.quizPerfectCount = (this.data.quizPerfectCount || 0) + 1;
    }

    // 答题奖励抽卡积分: 每答对1题=2抽卡币
    // 首次完成且全对 → 奖励翻倍
    const isPerfect = correctCount === totalCount && totalCount > 0;
    let gachaReward = correctCount * 2;
    if (isFirst && isPerfect) gachaReward *= 2;

    this.data.gachaCoins += gachaReward;

    this.save();
    this.emit('coins-changed');
    this.emit('stats-changed');

    return { isFirst, gachaReward, isPerfectFirst: isFirst && isPerfect };
  }

  // ===== 抽卡保底 =====
  get gachaPityRare() { return this.data.gachaPityRare; }
  get gachaPityLegend() { return this.data.gachaPityLegend; }
  get battleWins() { return this.data.battleWins; }

  incrementPity() {
    this.data.gachaPityRare++;
    this.data.gachaPityLegend++;
    this.data.totalGachaPulls++;
    this.save();
  }

  resetPityRare() { this.data.gachaPityRare = 0; this.save(); }
  resetPityLegend() { this.data.gachaPityRare = 0; this.data.gachaPityLegend = 0; this.save(); }

  // ===== 队伍战力 =====
  getTeamPower(charIds) {
    let total = 0;
    for (const id of charIds) {
      const level = this.getCardLevel(id);
      if (level > 0) total += calcCharPower(id, level);
    }
    return total;
  }

  // ===== 大富翁/探险统计 =====
  recordMonopolyWin() {
    this.data.monopolyWins = (this.data.monopolyWins || 0) + 1;
    this.save();
    this.emit('stats-changed');
  }

  recordDungeonRun(maxFloor) {
    this.data.dungeonRuns = (this.data.dungeonRuns || 0) + 1;
    this.data.dungeonMaxFloor = Math.max(this.data.dungeonMaxFloor || 0, maxFloor);
    this.save();
    this.emit('stats-changed');
  }

  recordMonopolySettle(score, won = false) {
    if (score > (this.data.monopolyScore || 0)) {
      this.data.monopolyScore = score;
    }
    this.data.monopolyGames = (this.data.monopolyGames || 0) + 1;
    if (won) this.data.monopolyWins = (this.data.monopolyWins || 0) + 1;
    this.save();
    this.emit('stats-changed');
  }

  recordMonopolyUnify() {
    this.data.monopolyUnifyCount = (this.data.monopolyUnifyCount || 0) + 1;
    this.save();
    this.emit('stats-changed');
  }

  recordMonopolyMaxCoins(coins) {
    if (coins > (this.data.monopolyMaxCoins || 0)) {
      this.data.monopolyMaxCoins = coins;
      this.save();
      this.emit('stats-changed');
    }
  }

  get monopolyScore()      { return this.data.monopolyScore      || 0; }
  get monopolyWins()       { return this.data.monopolyWins       || 0; }
  get monopolyGames()      { return this.data.monopolyGames      || 0; }
  get monopolyMaxCoins()   { return this.data.monopolyMaxCoins   || 0; }
  get monopolyUnifyCount() { return this.data.monopolyUnifyCount || 0; }

  recordTenPull() {
    this.data.tenPullCount = (this.data.tenPullCount || 0) + 1;
    this.save();
    this.emit('stats-changed');
  }

  // ===== 成就 =====
  isAchievementUnlocked(id) {
    return !!(this.data.achievementsUnlocked || {})[id];
  }

  unlockAchievement(id) {
    if (!this.data.achievementsUnlocked) this.data.achievementsUnlocked = {};
    if (this.data.achievementsUnlocked[id]) return false;
    this.data.achievementsUnlocked[id] = Date.now();
    this.save();
    this.emit('achievement-unlocked');
    return true;
  }

  isAchievementClaimed(id) {
    return !!(this.data.achievementsClaimed || {})[id];
  }

  claimAchievement(id) {
    if (!this.data.achievementsClaimed) this.data.achievementsClaimed = {};
    if (this.data.achievementsClaimed[id]) return false;
    this.data.achievementsClaimed[id] = Date.now();
    this.save();
    this.emit('achievement-claimed');
    return true;
  }

  get unlockedAchievementCount() {
    return Object.keys(this.data.achievementsUnlocked || {}).length;
  }

  // ===== 每日签到 =====
  todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  get signDay()      { return this.data.signDay      || 0; }
  get lastSignDate() { return this.data.lastSignDate  || ''; }

  canSignToday() {
    return this.lastSignDate !== this.todayStr();
  }

  doSign() {
    if (!this.canSignToday()) return null;
    const nextDay = (this.signDay % 7) + 1;
    this.data.signDay      = nextDay;
    this.data.lastSignDate = this.todayStr();
    this.save();
    return nextDay; // 返回本次签到是第几天
  }

  // ===== 事件系统 =====
  _listeners = {};
  on(event, fn) { (this._listeners[event] ??= []).push(fn); }
  off(event, fn) { if (this._listeners[event]) this._listeners[event] = this._listeners[event].filter(f => f !== fn); }
  emit(event) { (this._listeners[event] || []).forEach(fn => fn()); }
}

export const gameState = new GameState();
