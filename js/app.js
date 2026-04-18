// 三国志探险 - 主应用路由与初始化

import { gameState } from './state.js';
import { initMap } from './map.js';
import { initCards } from './cards.js';
import { initQuiz } from './quiz.js';
import { initGacha } from './gacha.js';
import { initBattle } from './battle.js';
import { initMonopoly } from './monopoly.js';
import { initEffects, animateNumber } from './effects.js';
import { initAuth } from './auth.js';
import { initLeaderboard } from './leaderboard.js';
import { initDungeon } from './dungeon.js';
import { initAchievements, checkAchievements, renderAchievements } from './achievements.js';

class App {
  constructor() {
    this.currentScreen = 'home';
    // 立刻赋值，让子模块在 init 过程中就能访问 window.app
    window.app = this;
    this.init();
  }

  init() {
    // 初始化各模块（任何一个失败都不影响其他模块）
    const safeInit = (name, fn) => {
      try { fn(); console.log(`[${name}] ✅`); } catch (e) { console.error(`[${name}] ❌`, e); }
    };
    safeInit('map', initMap);
    safeInit('cards', initCards);
    safeInit('quiz', initQuiz);
    safeInit('gacha', initGacha);
    safeInit('battle', initBattle);
    safeInit('monopoly', initMonopoly);
    safeInit('effects', initEffects);
    safeInit('auth', initAuth);
    safeInit('leaderboard', initLeaderboard);
    safeInit('dungeon', initDungeon);
    safeInit('achievements', initAchievements);

    // 首页英雄轮播
    this.startHeroSlideshow();

    // 监听 hash 变化
    window.addEventListener('hashchange', () => this.handleRoute());

    // 监听变化
    gameState.on('coins-changed', () => {
      if (this.currentScreen === 'home') {
        this._refreshGoldDisplay();
      } else {
        // 非首页：记录变动前的显示值，切回时用于触发动画
        const hg = document.getElementById('home-gold');
        if (hg && this._goldDisplayedValue === undefined) {
          this._goldDisplayedValue = parseInt(hg.textContent) || 0;
        }
      }
    });
    gameState.on('cards-changed', () => this.updateAllDisplays());
    gameState.on('stage-changed', () => this.updateAllDisplays());

    // 初始路由
    this.handleRoute();
    this.updateAllDisplays();
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const [screen, ...params] = hash.split('/');
    this.navigate(screen, params, false);
  }

  navigate(screen, params = [], updateHash = true) {
    // 隐藏所有 screen
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // 显示目标 screen
    const target = document.getElementById(`screen-${screen}`);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screen;
    } else {
      // 默认回首页
      document.getElementById('screen-home').classList.add('active');
      this.currentScreen = 'home';
    }

    // 更新 tab 高亮
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.screen === this.currentScreen);
    });

    // 更新 hash
    if (updateHash) {
      const newHash = params.length ? `${screen}/${params.join('/')}` : screen;
      window.location.hash = newHash;
    }

    // 触发模块特定的刷新
    if (screen === 'home') {
      // 如果非首页期间金币有变动，把显示值恢复到变动前再动画
      if (this._goldDisplayedValue !== undefined) {
        const hg = document.getElementById('home-gold');
        if (hg) hg.textContent = this._goldDisplayedValue;
        this._goldDisplayedValue = undefined;
      }
      this._refreshGoldDisplay();
      this.updateAllDisplays();
    }
    if (screen === 'gacha') window.gachaModule?.refresh();
    if (screen === 'cards') window.cardsModule?.refresh();
    if (screen === 'battle') window.battleModule?.refresh();
    if (screen === 'map') window.mapModule?.refresh();
    if (screen === 'monopoly') window.monopolyModule?.refresh();
    if (screen === 'quiz') window.quizModule?.refresh();
    if (screen === 'rank') window.lbModule?.refresh();
    if (screen === 'dungeon') window.dungeonModule?.refresh();
    if (screen === 'achievements') renderAchievements();

    this.updateAllDisplays();
  }

  _refreshGoldDisplay() {
    const hg = document.getElementById('home-gold');
    if (!hg) return;
    const current = parseInt(hg.textContent) || 0;
    const target = gameState.gold;
    if (current === target) return;
    // 强制先显示旧值再动画，确保用户能看到变化
    hg.textContent = current;
    animateNumber(hg, target);
  }

  updateAllDisplays() {
    // 首页货币
    const hg = document.getElementById('home-gold');
    const qc = document.getElementById('home-quiz-coins');
    const gc = document.getElementById('home-gacha-coins');
    const hc = document.getElementById('home-cards');

    if (hg) animateNumber(hg, gameState.gold);
    if (qc) animateNumber(qc, gameState.quizCoins);
    if (gc) animateNumber(gc, gameState.gachaCoins);
    if (hc) hc.textContent = `${gameState.cardCount}/36`;

    // 各页面积分显示
    const gp = document.getElementById('gacha-points');
    if (gp) gp.textContent = gameState.gachaCoins;

    // 关卡页
    const mqc = document.getElementById('map-quiz-coins');
    const mgc = document.getElementById('map-gacha-coins');
    if (mqc) mqc.textContent = gameState.quizCoins;
    if (mgc) mgc.textContent = gameState.gachaCoins;
  }

  startHeroSlideshow() {
    let current = 0;
    const imgs = document.querySelectorAll('.hero-img');
    const dots = document.querySelectorAll('.hero-dots .dot');
    if (!imgs.length) return;

    setInterval(() => {
      imgs[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      current = (current + 1) % imgs.length;
      imgs[current].classList.add('active');
      dots[current]?.classList.add('active');
    }, 5000);
  }
}

// 全局实例
window.app = new App();
