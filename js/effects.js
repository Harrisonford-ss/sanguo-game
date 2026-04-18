// 三国志探险 - 全局动画特效系统

// ===== 粒子系统：飘落的花瓣/萤火虫 =====
class ParticleSystem {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'particles';
    this.container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.container);
    this.particles = [];
    this.running = true;
    this.spawn();
  }

  spawn() {
    if (!this.running) return;

    // 控制粒子数量
    if (this.particles.length < 15) {
      this.addParticle();
    }

    setTimeout(() => this.spawn(), 800 + Math.random() * 1500);
  }

  addParticle() {
    const el = document.createElement('div');
    const type = Math.random() > 0.6 ? 'sparkle' : 'petal';

    el.className = `particle particle-${type}`;

    // 随机起始位置
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-20px';

    // 随机大小
    const size = type === 'petal' ? (8 + Math.random() * 12) : (3 + Math.random() * 5);
    el.style.width = size + 'px';
    el.style.height = size + 'px';

    // 花瓣颜色
    if (type === 'petal') {
      const colors = ['#ffb7c5', '#ff9eb5', '#ffc1cc', '#ffd4db', '#ffe0e6'];
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
    } else {
      el.style.background = `rgba(255, 215, 0, ${0.4 + Math.random() * 0.4})`;
    }

    // 动画时长
    const duration = 6 + Math.random() * 8;
    el.style.animationDuration = duration + 's';

    // 水平偏移
    el.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
    el.style.setProperty('--rotate', (Math.random() * 720 - 360) + 'deg');

    this.container.appendChild(el);
    this.particles.push(el);

    // 清理
    setTimeout(() => {
      el.remove();
      this.particles = this.particles.filter(p => p !== el);
    }, duration * 1000);
  }
}

// ===== 入场动画观察器 =====
class EntranceAnimator {
  constructor() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated-in');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
  }

  observe(selector) {
    document.querySelectorAll(selector).forEach(el => {
      this.observer.observe(el);
    });
  }
}

// ===== 数字滚动动画 =====
export function animateNumber(el, target, duration = 800) {
  const start = parseInt(el.textContent) || 0;
  if (start === target) return;

  const diff = target - start;
  const startTime = performance.now();

  function update(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = Math.round(start + diff * ease);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ===== 触感反馈（振动） =====
export function haptic(intensity = 'light') {
  if (!navigator.vibrate) return;
  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30, 20, 30],
    success: [10, 50, 20],
  };
  navigator.vibrate(patterns[intensity] || [10]);
}

// ===== 屏幕震动效果 =====
export function screenShake(intensity = 5, duration = 300) {
  const app = document.getElementById('app');
  app.classList.add('shaking');
  app.style.setProperty('--shake-intensity', intensity + 'px');

  setTimeout(() => {
    app.classList.remove('shaking');
  }, duration);
}

// ===== 闪光脉冲 =====
export function flashPulse(color = 'rgba(255,215,0,0.3)') {
  const flash = document.createElement('div');
  flash.className = 'flash-pulse';
  flash.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);
}

// ===== 初始化 =====
let particleSystem;
let entranceAnimator;

export function initEffects() {
  particleSystem = new ParticleSystem();
  entranceAnimator = new EntranceAnimator();

  // 页面切换时重新绑定入场动画
  const originalNavigate = window.app?.navigate;
  if (originalNavigate) {
    const origNav = originalNavigate.bind(window.app);
    window.app.navigate = function(...args) {
      origNav(...args);
      // 延迟绑定让DOM更新
      requestAnimationFrame(() => {
        bindEntranceAnimations();
      });
    };
  }

  // 初始绑定
  requestAnimationFrame(bindEntranceAnimations);
}

function bindEntranceAnimations() {
  entranceAnimator.observe('.animate-on-enter');
  // 给卡片网格的子元素添加交错动画
  document.querySelectorAll('.cards-grid .card-item, .home-actions .action-card, .home-stats-bar .stat-pill, .gacha-result .gacha-card').forEach((el, i) => {
    if (!el.classList.contains('stagger-ready')) {
      el.classList.add('stagger-ready');
      el.style.setProperty('--stagger', i);
    }
  });
}

// 暴露给全局
window.effects = { animateNumber, haptic, screenShake, flashPulse };
