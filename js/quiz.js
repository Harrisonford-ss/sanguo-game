// 三国志探险 - 独立答题系统
// 消耗答题积分(quizCoins)答题，答对赚抽卡积分(gachaCoins)

import { gameState } from './state.js';
import { quizzes, getQuiz } from '../data/quizzes.js';
import { quizScenes } from '../data/scenes.js';

let currentQuiz = null;
let currentQIndex = 0;
let correctCount = 0;
let answered = false;

export function initQuiz() {
  window.quizModule = { startQuiz, nextQuestion, refresh: showList, backToList };
  showList();
}

// ===== 列表视图 =====
function showList() {
  document.getElementById('quiz-title').textContent = '答题闯关';
  document.getElementById('quiz-back-btn').classList.add('hidden');
  document.getElementById('quiz-list-view').classList.remove('hidden');
  document.getElementById('quiz-play-view').classList.add('hidden');

  const container = document.getElementById('quiz-list-view');
  const coins = gameState.quizCoins;

  container.innerHTML = `
    <div class="quiz-coins-bar">
      <span>🎫 答题积分: <strong>${coins}</strong></span>
      <span class="quiz-coins-hint">每次答题消耗 1 积分</span>
    </div>
    <div class="quiz-list">
      ${quizzes.map(q => {
        const scene = quizScenes[q.id] || '';
        const completed = gameState.isQuizCompleted(q.id);
        const best = gameState.completedQuizzes[q.id]?.bestScore || 0;
        const canPlay = coins >= 1;
        return `
          <div class="quiz-list-card ${canPlay ? '' : 'disabled'}"
               onclick="${canPlay ? `window.quizModule.startQuiz('${q.id}')` : ''}">
            <div class="quiz-list-img">
              ${scene ? `<img src="${scene}" alt="${q.title}" loading="lazy">` : '<div style="width:100%;height:100%;background:#ddd"></div>'}
              <div class="quiz-list-img-overlay"></div>
            </div>
            <div class="quiz-list-info">
              <h4>${q.title}</h4>
              <p>${q.intro.slice(0, 40)}…</p>
              ${completed
                ? `<span class="quiz-list-best">最高: ${best}/10 ✅</span>`
                : `<span class="quiz-list-new">🎫 -1 积分</span>`}
            </div>
          </div>`;
      }).join('')}
    </div>
    ${coins < 1 ? '<p class="quiz-no-coins">答题积分不足，去关卡对战赢取！</p>' : ''}
  `;
}

function backToList() {
  showList();
}

// ===== 答题视图 =====
export function startQuiz(quizId) {
  currentQuiz = getQuiz(quizId);
  if (!currentQuiz) return;

  // 每次答题都消耗1答题积分
  if (!gameState.spendQuizCoin()) return;

  currentQIndex = 0;
  correctCount = 0;
  answered = false;

  // 随机打乱题目顺序，每次抽10题
  const allQs = [...currentQuiz.questions];
  for (let i = allQs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQs[i], allQs[j]] = [allQs[j], allQs[i]];
  }
  currentQuiz = { ...currentQuiz, questions: allQs.slice(0, 10) };

  // 切换到答题视图
  document.getElementById('quiz-title').textContent = currentQuiz.title;
  document.getElementById('quiz-back-btn').classList.remove('hidden');
  document.getElementById('quiz-list-view').classList.add('hidden');
  document.getElementById('quiz-play-view').classList.remove('hidden');

  // 如果当前不在 quiz 页面，导航过去
  if (window.app.currentScreen !== 'quiz') {
    window.app.navigate('quiz');
  }

  // 显示引言
  const introEl = document.getElementById('quiz-intro');
  const sceneImg = quizScenes[currentQuiz.id] || '';
  introEl.classList.remove('hidden');
  introEl.innerHTML = `
    ${sceneImg ? `<div class="quiz-scene-img"><img src="${sceneImg}" alt="${currentQuiz.title}"></div>` : ''}
    <p>${currentQuiz.intro}</p>
    <button class="btn btn-primary" onclick="window.quizModule._beginQuestions()">开始答题 (${currentQuiz.questions.length}题)</button>
  `;

  document.getElementById('quiz-question-area').classList.add('hidden');
  document.getElementById('quiz-result').classList.add('hidden');

  window.quizModule._beginQuestions = () => {
    introEl.classList.add('hidden');
    document.getElementById('quiz-question-area').classList.remove('hidden');
    showQuestion();
  };
}

function showQuestion() {
  const q = currentQuiz.questions[currentQIndex];
  answered = false;

  const total = currentQuiz.questions.length;
  document.getElementById('quiz-progress-text').textContent = `第 ${currentQIndex + 1}/${total} 题`;
  document.getElementById('quiz-progress-bar').style.width = `${currentQIndex / total * 100}%`;
  document.getElementById('quiz-question').textContent = q.question;

  document.getElementById('quiz-options').innerHTML = q.options.map((opt, i) => `
    <button class="quiz-option" onclick="window.quizModule._pick(${i})">
      ${String.fromCharCode(65 + i)}. ${opt}
    </button>
  `).join('');

  document.getElementById('quiz-feedback').classList.add('hidden');
  document.getElementById('quiz-next-btn').classList.add('hidden');

  window.quizModule._pick = selectOption;
}

function selectOption(index) {
  if (answered) return;
  answered = true;

  const q = currentQuiz.questions[currentQIndex];
  const correct = index === q.answer;
  if (correct) correctCount++;

  if (correct && window.effects) {
    window.effects.flashPulse('rgba(76,175,80,0.3)');
    window.effects.haptic('success');
  } else if (!correct && window.effects) {
    window.effects.screenShake(4, 200);
  }

  const options = document.querySelectorAll('.quiz-option');
  options.forEach((opt, i) => {
    if (i === q.answer) opt.classList.add('correct');
    else if (i === index && !correct) opt.classList.add('wrong');
    opt.classList.add('disabled');
  });

  const fb = document.getElementById('quiz-feedback');
  fb.className = `quiz-feedback ${correct ? 'correct' : 'wrong'}`;
  fb.innerHTML = `<strong>${correct ? '✅ 正确！' : '❌ 错误'}</strong><br>${q.explanation}`;
  fb.classList.remove('hidden');

  const btn = document.getElementById('quiz-next-btn');
  btn.textContent = currentQIndex < currentQuiz.questions.length - 1 ? '下一题 →' : '查看结果';
  btn.classList.remove('hidden');
}

function nextQuestion() {
  currentQIndex++;
  if (currentQIndex >= currentQuiz.questions.length) showResult();
  else showQuestion();
}

function showResult() {
  document.getElementById('quiz-question-area').classList.add('hidden');
  document.getElementById('quiz-progress-bar').style.width = '100%';

  const total = currentQuiz.questions.length;
  const { isFirst, gachaReward, isPerfectFirst } = gameState.completeQuiz(currentQuiz.id, correctCount, total);
  const passed = correctCount >= Math.ceil(total * 0.6); // 60%及格
  // 答题完成后同步到云端
  if (window.authModule?.syncToCloud) {
    window.authModule.syncToCloud().catch(() => {});
  }

  const resultEl = document.getElementById('quiz-result');
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = `
    <h3>${passed ? '🎉 通关！' : '📚 继续加油！'}</h3>
    <p style="font-size:24px;font-weight:700;margin:8px 0">${correctCount} / ${total}</p>
    <p style="color:var(--gold);font-weight:700;font-size:18px">+${gachaReward} 💎抽卡积分</p>
    ${isPerfectFirst ? '<p style="color:#e53935;font-weight:800;font-size:14px">🌟 首次全对！奖励翻倍！</p>' : isFirst ? '<p style="color:var(--shu);font-size:13px">🆕 首次完成！</p>' : ''}
    <p style="color:var(--text-light);font-size:13px;margin-top:4px">用💎抽卡积分去抽卡强化武将！</p>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px">
      <button class="btn btn-primary" onclick="window.app.navigate('gacha')">去抽卡 ✨</button>
      <button class="btn btn-secondary" onclick="window.quizModule.startQuiz('${currentQuiz.id}')">再答一次</button>
      <button class="btn btn-secondary" onclick="window.quizModule.backToList()">答题列表</button>
    </div>
  `;

  if (passed) {
    const colors = ['#ef5350', '#4caf50', '#4a90d9', '#f5a623', '#9c27b0'];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }
  }
}
