// 三国志探险 - 独立答题系统

import { gameState } from './state.js';
import { quizzes, getQuiz } from '../data/quizzes.js';
import { quizScenes } from '../data/scenes.js';

const TIMER_SECONDS = 15;
const PASS_THRESHOLD = 0.6; // 60% 及格才解锁下一章

let currentQuiz = null;
let currentQIndex = 0;
let correctCount = 0;
let answered = false;
let wrongAnswers = [];   // { question, options, answer, chosen, explanation }
let questionCount = 10;  // 本局题数

let timerInterval = null;
let timerLeft = TIMER_SECONDS;

export function initQuiz() {
  window.quizModule = { startQuiz, nextQuestion, refresh: showList, backToList };
  showList();
}

// ===== 章节是否解锁 =====
function isUnlocked(index) {
  if (index === 0) return true;
  const prev = quizzes[index - 1];
  const best = gameState.completedQuizzes[prev.id]?.bestScore || 0;
  return best >= Math.ceil(10 * PASS_THRESHOLD); // 前一章最高分 >= 6 才解锁
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
      ${quizzes.map((q, idx) => {
        const scene = quizScenes[q.id] || '';
        const completed = gameState.isQuizCompleted(q.id);
        const best = gameState.completedQuizzes[q.id]?.bestScore || 0;
        const unlocked = isUnlocked(idx);
        const canPlay = coins >= 1 && unlocked;
        return `
          <div class="quiz-list-card ${canPlay ? '' : 'disabled'}"
               onclick="${canPlay ? `window.quizModule.startQuiz('${q.id}')` : ''}">
            <div class="quiz-list-img">
              ${scene ? `<img src="${scene}" alt="${q.title}" loading="lazy">` : '<div style="width:100%;height:100%;background:#ddd"></div>'}
              <div class="quiz-list-img-overlay"></div>
              ${!unlocked ? `<div class="quiz-list-lock">🔒</div>` : ''}
            </div>
            <div class="quiz-list-info">
              <h4>${q.title}</h4>
              <p>${q.intro.slice(0, 40)}…</p>
              ${!unlocked
                ? `<span class="quiz-list-locked-hint">通过上一章（6分+）解锁</span>`
                : completed
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
  stopTimer();
  showList();
}

// ===== 难度选择 & 开始 =====
export function startQuiz(quizId) {
  const quiz = getQuiz(quizId);
  if (!quiz) return;

  // 先消耗积分
  if (!gameState.spendQuizCoin()) return;

  // 难度选择弹窗
  const total = quiz.questions.length;
  const opts = [
    { label: '练习', count: Math.min(5, total), desc: '5题' },
    { label: '标准', count: Math.min(10, total), desc: '10题' },
    { label: '挑战', count: total, desc: `${total}题（全部）` },
  ].filter(o => o.count <= total);

  // 退款函数：若取消需要退还积分
  let confirmed = false;
  const refund = () => { if (!confirmed) gameState.data.quizCoins++; gameState.save(); };

  const d = document.createElement('div');
  d.id = 'quiz-diff-popup';
  d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:500;padding:20px';
  d.innerHTML = `<div style="background:#fff;border-radius:20px;padding:24px;max-width:320px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.15)">
    <h3 style="margin-bottom:4px">选择难度</h3>
    <p style="font-size:12px;color:#999;margin-bottom:16px">${quiz.title}</p>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
      ${opts.map(o => `
        <button onclick="window._quizDiff(${o.count})"
          style="padding:14px;border:2px solid #e8e8e8;border-radius:12px;background:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.15s"
          onmouseover="this.style.borderColor='#667eea';this.style.background='#f0f0ff'"
          onmouseout="this.style.borderColor='#e8e8e8';this.style.background='#fff'">
          ${o.label} · ${o.desc}
        </button>`).join('')}
    </div>
    <button onclick="window._quizDiffCancel()" style="color:#aaa;font-size:13px;background:none;border:none;cursor:pointer">取消</button>
  </div>`;
  document.body.appendChild(d);

  window._quizDiffCancel = () => { refund(); d.remove(); };
  window._quizDiff = (count) => {
    confirmed = true;
    d.remove();
    _doStart(quiz, count);
  };
}

function _doStart(quiz, count) {
  currentQuiz = quiz;
  currentQIndex = 0;
  correctCount = 0;
  answered = false;
  wrongAnswers = [];
  questionCount = count;

  const allQs = [...quiz.questions];
  for (let i = allQs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQs[i], allQs[j]] = [allQs[j], allQs[i]];
  }
  currentQuiz = { ...quiz, questions: allQs.slice(0, count) };

  document.getElementById('quiz-title').textContent = currentQuiz.title;
  document.getElementById('quiz-back-btn').classList.remove('hidden');
  document.getElementById('quiz-list-view').classList.add('hidden');
  document.getElementById('quiz-play-view').classList.remove('hidden');

  if (window.app.currentScreen !== 'quiz') window.app.navigate('quiz');

  const introEl = document.getElementById('quiz-intro');
  const sceneImg = quizScenes[currentQuiz.id] || '';
  introEl.classList.remove('hidden');
  introEl.innerHTML = `
    ${sceneImg ? `<div class="quiz-scene-img"><img src="${sceneImg}" alt="${currentQuiz.title}"></div>` : ''}
    <p>${currentQuiz.intro}</p>
    <button class="btn btn-primary" onclick="window.quizModule._beginQuestions()">开始答题（${count}题 · 每题${TIMER_SECONDS}秒）</button>
  `;

  document.getElementById('quiz-question-area').classList.add('hidden');
  document.getElementById('quiz-result').classList.add('hidden');

  window.quizModule._beginQuestions = () => {
    introEl.classList.add('hidden');
    document.getElementById('quiz-question-area').classList.remove('hidden');
    showQuestion();
  };
}

// ===== 倒计时 =====
function startTimer() {
  stopTimer();
  timerLeft = TIMER_SECONDS;
  _updateTimerUI();
  timerInterval = setInterval(() => {
    timerLeft--;
    _updateTimerUI();
    if (timerLeft <= 0) {
      stopTimer();
      if (!answered) {
        // 超时自动判错
        selectOption(-1);
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function _updateTimerUI() {
  const fill = document.getElementById('quiz-timer-fill');
  const text = document.getElementById('quiz-timer-text');
  if (!fill || !text) return;
  const pct = timerLeft / TIMER_SECONDS * 100;
  fill.style.width = pct + '%';
  fill.style.background = timerLeft > 8 ? '#4caf50' : timerLeft > 4 ? '#ff9800' : '#ef5350';
  text.textContent = timerLeft;
  text.style.color = timerLeft <= 4 ? '#ef5350' : 'var(--text-light)';
}

// ===== 题目 =====
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
  startTimer();
}

function selectOption(index) {
  if (answered) return;
  answered = true;
  stopTimer();

  const q = currentQuiz.questions[currentQIndex];
  const correct = index === q.answer;
  if (correct) {
    correctCount++;
    if (window.effects) { window.effects.flashPulse('rgba(76,175,80,0.3)'); window.effects.haptic('success'); }
  } else {
    if (window.effects) window.effects.screenShake(4, 200);
    wrongAnswers.push({ question: q.question, options: q.options, answer: q.answer, chosen: index, explanation: q.explanation });
  }

  const options = document.querySelectorAll('.quiz-option');
  options.forEach((opt, i) => {
    if (i === q.answer) opt.classList.add('correct');
    else if (i === index && !correct) opt.classList.add('wrong');
    opt.classList.add('disabled');
  });

  const fb = document.getElementById('quiz-feedback');
  const timeBonus = correct && timerLeft >= TIMER_SECONDS - 1 ? ' ⚡极速！' : '';
  fb.className = `quiz-feedback ${correct ? 'correct' : 'wrong'}`;
  fb.innerHTML = `<strong>${correct ? `✅ 正确！${timeBonus}` : index === -1 ? '⏰ 超时！' : '❌ 错误'}</strong><br>${q.explanation}`;
  fb.classList.remove('hidden');

  const btn = document.getElementById('quiz-next-btn');
  btn.textContent = currentQIndex < currentQuiz.questions.length - 1 ? '下一题 →' : '查看结果';
  btn.classList.remove('hidden');
}

export function nextQuestion() {
  currentQIndex++;
  if (currentQIndex >= currentQuiz.questions.length) showResult();
  else showQuestion();
}

// ===== 结果 =====
function showResult() {
  stopTimer();
  document.getElementById('quiz-question-area').classList.add('hidden');
  document.getElementById('quiz-progress-bar').style.width = '100%';

  const total = currentQuiz.questions.length;
  const { isFirst, gachaReward, isPerfectFirst } = gameState.completeQuiz(currentQuiz.id, correctCount, total);
  const passed = correctCount >= Math.ceil(total * PASS_THRESHOLD);
  if (window.authModule?.syncToCloud) window.authModule.syncToCloud().catch(() => {});

  const wrongHTML = wrongAnswers.length > 0 ? `
    <details style="margin-top:16px;text-align:left">
      <summary style="cursor:pointer;font-size:13px;font-weight:700;color:var(--text-light);padding:8px 0">
        📋 查看错题（${wrongAnswers.length}题）
      </summary>
      <div style="margin-top:8px;display:flex;flex-direction:column;gap:10px">
        ${wrongAnswers.map((w, i) => `
          <div style="background:#fff8f8;border:1px solid #fdd;border-radius:10px;padding:10px 12px;font-size:12px">
            <div style="font-weight:700;color:#333;margin-bottom:6px">${i+1}. ${w.question}</div>
            ${w.options.map((o, oi) => `
              <div style="padding:3px 0;color:${oi===w.answer?'#4caf50':oi===w.chosen&&w.chosen!==-1?'#ef5350':'#666'}">
                ${oi===w.answer?'✓':oi===w.chosen&&w.chosen!==-1?'✗':' '} ${String.fromCharCode(65+oi)}. ${o}
              </div>`).join('')}
            <div style="margin-top:6px;color:#888;border-top:1px solid #f5e8e8;padding-top:6px">${w.explanation}</div>
          </div>`).join('')}
      </div>
    </details>` : '';

  const resultEl = document.getElementById('quiz-result');
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = `
    <h3>${passed ? '🎉 通关！' : '📚 继续加油！'}</h3>
    <p style="font-size:24px;font-weight:700;margin:8px 0">${correctCount} / ${total}</p>
    <p style="color:var(--gold);font-weight:700;font-size:18px">+${gachaReward} 💎抽卡积分</p>
    ${isPerfectFirst ? '<p style="color:#e53935;font-weight:800;font-size:14px">🌟 首次全对！奖励翻倍！</p>' : isFirst ? '<p style="color:var(--shu);font-size:13px">🆕 首次完成！</p>' : ''}
    ${wrongHTML}
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
