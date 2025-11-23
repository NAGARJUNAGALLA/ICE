/* quiz.js
   Responsibilities:
   - Load selected_quiz_tab from localStorage
   - Fetch that sheet, parse rows into question objects
   - Render question, options
   - Manage per-question timer and overall progression
   - Create question navigation bar (numbers)
   - On finish, create results object and save to localStorage, then redirect to results.html
*/

if (!isLoggedIn()) window.location.href = 'index.html';

const selectedTab = localStorage.getItem('selected_quiz_tab');
const selectedDisplay = localStorage.getItem('selected_quiz_display') || selectedTab;
const TIME_PER_Q = Number(localStorage.getItem('selected_quiz_timePerQ') || 60);

if (!selectedTab) {
  alert('No quiz selected. Returning to dashboard.');
  window.location.href = 'dashboard.html';
}

document.getElementById('quizTitle').textContent = selectedDisplay;

// Helper - fetch sheet as before (same parsing logic)
async function fetchSheetAsJson(sheetName) {
  const SHEET_ID = document.querySelector('script[src="dashboard.js"]') ? null : null;
  // We assume dashboard.js already set SHEET_ID (but not accessible here). Instead, use the same replacement:
  // To avoid duplication, we'll extract SHEET_ID from dashboard.js or ask user to set global var.
  // Simpler approach: extract from localStorage; user should set SHEET_ID in dashboard.js and also set it here if needed.
  // For simplicity, we'll require the same SHEET_ID to be set at top of this file if needed.
  // But to avoid requiring changes, try reading SHEET_ID from a global 'SHEET_ID' if present, else ask user to set in dashboard.js.
  let SHEET_ID = null;
  try {
    // Try to get it from a global var (if user included it globally)
    if (typeof window.SHEET_ID !== 'undefined') SHEET_ID = window.SHEET_ID;
  } catch (e) { /* ignore */ }
  if (!SHEET_ID) {
    // fallback: parse from dashboard.js path by fetching that file (not possible cross-origin in GitHub pages). So we ask user to set SHEET_ID in dashboard.js only.
    // We'll prompt user to ensure they set SHEET_ID in dashboard.js if fetch fails.
    SHEET_ID = prompt('Please paste your Google SHEET ID (for quiz fetch):', '');
    if (!SHEET_ID) throw new Error('No SHEET_ID provided');
  }

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  const text = await res.text();
  const jsonText = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
  if (!jsonText) throw new Error('Unexpected sheet response');
  const data = JSON.parse(jsonText[1]);
  return data;
}

function parseRowsToQuestions(data) {
  const cols = data.table.cols.map(c => (c.label || c.id).toLowerCase());
  const rows = data.table.rows.map(r => {
    const cellVals = r.c.map(c => (c ? c.v : ""));
    // map by column name
    const obj = {};
    cols.forEach((col, i) => obj[col] = cellVals[i] || '');
    return {
      question: obj['question'] || obj['q'] || '',
      options: [obj['option1']||'', obj['option2']||'', obj['option3']||'', obj['option4']||''].filter(o=>o!==''),
      answer: (obj['answer']||'').toString(),
      solution: obj['solution'] || ''
    };
  });
  return rows.filter(r => r.question);
}

/* UI elements */
const questionText = document.getElementById('questionText');
const optionsArea = document.getElementById('optionsArea');
const qnumEl = document.getElementById('qnum');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const qnav = document.getElementById('qnav');
const timerEl = document.getElementById('timer');

let questions = [];
let currentIndex = 0;
let answers = []; // user answers
let perQuestionRemaining = TIME_PER_Q; // seconds
let intervalId;

/* load questions and init */
(async function init() {
  try {
    const data = await fetchSheetAsJson(selectedTab);
    questions = parseRowsToQuestions(data);
    if (!questions.length) throw new Error('No questions found in selected tab.');
    answers = new Array(questions.length).fill(null);
    renderQuestion(currentIndex);
    renderNav();
    startTimer();
  } catch (err) {
    alert('Error loading quiz: ' + err.message);
    console.error(err);
    window.location.href = 'dashboard.html';
  }
})();

function renderQuestion(i) {
  const q = questions[i];
  qnumEl.textContent = `Question ${i+1} of ${questions.length}`;
  questionText.innerHTML = q.question;
  optionsArea.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.dataset.opt = opt;
    if (answers[i] === opt) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      answers[i] = opt;
      // highlight choice
      [...optionsArea.querySelectorAll('button')].forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      // reset timer for next if you want — currently continue
      renderNav(); // mark visited
    });
    optionsArea.appendChild(btn);
  });

  // update prev/next button states
  prevBtn.disabled = (i === 0);
  nextBtn.textContent = (i === questions.length - 1) ? 'Finish' : 'Next';
  currentIndex = i;
  perQuestionRemaining = TIME_PER_Q;
  updateTimerDisplay();
}

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion(currentIndex);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion(currentIndex);
  } else {
    if (confirm('Submit quiz and view results?')) {
      finishQuizAndShowResults();
    }
  }
});

/* Navigation bar (question numbers) */
function renderNav() {
  qnav.innerHTML = '';
  questions.forEach((q, idx) => {
    const b = document.createElement('button');
    b.textContent = idx + 1;
    if (idx === currentIndex) b.classList.add('current');
    if (answers[idx] !== null) b.style.borderColor = 'var(--accent)';
    b.addEventListener('click', () => {
      currentIndex = idx;
      renderQuestion(idx);
    });
    qnav.appendChild(b);
  });
}

/* Timer logic */
function startTimer() {
  clearInterval(intervalId);
  perQuestionRemaining = TIME_PER_Q;
  updateTimerDisplay();
  intervalId = setInterval(() => {
    perQuestionRemaining--;
    updateTimerDisplay();
    if (perQuestionRemaining <= 0) {
      // auto move to next Q or finish
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion(currentIndex);
      } else {
        finishQuizAndShowResults();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mm = Math.floor(perQuestionRemaining / 60).toString().padStart(2, '0');
  const ss = (perQuestionRemaining % 60).toString().padStart(2, '0');
  timerEl.textContent = `${mm}:${ss}`;
}

/* finish quiz */
function finishQuizAndShowResults() {
  clearInterval(intervalId);
  const results = questions.map((q, i) => ({
    question: q.question,
    options: q.options,
    correctAnswer: q.answer,
    yourAnswer: answers[i] || '',
    solution: q.solution || ''
  }));
  // compute score
  const total = results.length;
  const correct = results.reduce((acc, r) => acc + ((String(r.yourAnswer).trim() === String(r.correctAnswer).trim()) ? 1 : 0), 0);
  const summary = { total, correct, percent: Math.round((correct / total) * 100) };
  localStorage.setItem('last_quiz_results', JSON.stringify({ summary, results, quizTitle: selectedDisplay }));
  window.location.href = 'results.html';
}
