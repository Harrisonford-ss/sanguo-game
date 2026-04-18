// 三国志探险 - 游戏状态管理
import { characters } from '../data/characters.js';
// 双货币系统：答题积分(quizCoins) + 抽卡积分(gachaCoins)
// 对战胜利 → 答题积分 → 答题 → 抽卡积分 → 抽卡 → 更强 → 更难对战

const STORAGE_KEY = 'sanguo-game-v3';

const defaultState = {
  // 三种货币
  quizCoins: 3,       // 答题积分（对战获得，用于答题）
  gachaCoins: 30,     // 抽卡积分（答题获得，用于抽卡）
  gold: 0,            // 金币（大富翁获得，用于升级武将）

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
  quizPerfectCount: 0,
  consecutiveWins: 0,
  maxConsecutiveWins: 0,
  cardUpgradeCount: 0,
  maxCardLevel: 0,
  achievementsUnlocked: {},
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

  getStageStars(stageId) {
    return this.data.stageStars[stageId] || 0;
  }

  // 完成关卡，返回本次获得的星和答题积分
  completeStage(stageId, stars) {
    const prev = this.data.stageStars[stageId] || 0;
    const newStars = Math.max(prev, stars);
    const starsGained = newStars - prev;

    this.data.stageStars[stageId] = newStars;
    this.data.totalStars += starsGained;
    this.data.battleWins++;
    this.data.consecutiveWins = (this.data.consecutiveWins || 0) + 1;
    this.data.maxConsecutiveWins = Math.max(this.data.maxConsecutiveWins || 0, this.data.consecutiveWins);

    // 解锁下一关
    if (stageId >= this.data.currentStage) {
      this.data.currentStage = stageId + 1;
    }

    // 对战奖励答题积分: 1星=1, 2星=2, 3星=3
    const quizReward = stars;
    this.data.quizCoins += quizReward;

    this.save();
    this.emit('coins-changed');
    this.emit('stage-changed');
    this.emit('stats-changed');

    return { starsGained, quizReward };
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
      if (level > 0) total += level * 20 + 50;
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

  get unlockedAchievementCount() {
    return Object.keys(this.data.achievementsUnlocked || {}).length;
  }

  // ===== 事件系统 =====
  _listeners = {};
  on(event, fn) { (this._listeners[event] ??= []).push(fn); }
  off(event, fn) { if (this._listeners[event]) this._listeners[event] = this._listeners[event].filter(f => f !== fn); }
  emit(event) { (this._listeners[event] || []).forEach(fn => fn()); }
}

export const gameState = new GameState();
