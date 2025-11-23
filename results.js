if (!isLoggedIn()) window.location.href = 'index.html';

const data = JSON.parse(localStorage.getItem('last_quiz_results') || 'null');
if (!data) {
  document.getElementById('scoreHeading').textContent = 'No results found';
  document.getElementById('summary').textContent = 'Take a quiz first.';
} else {
  const { summary, results, quizTitle } = data;
  const scoreHeading = document.getElementById('scoreHeading');
  scoreHeading.textContent = `${quizTitle} — Score: ${summary.correct}/${summary.total} (${summary.percent}%)`;
  document.getElementById('summary').textContent = `You answered ${summary.correct} out of ${summary.total} questions correctly.`;

  const container = document.getElementById('detailedAnswers');
  container.innerHTML = '';
  results.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = 'detailed-item';
    div.innerHTML = `
      <div class="highlight"><strong>Q${i+1}:</strong> ${r.question}</div>
      <p><strong>Your answer:</strong> ${r.yourAnswer || '<em>No answer</em>'}</p>
      <p><strong>Correct answer:</strong> ${r.correctAnswer}</p>
      ${r.solution ? `<div><strong>Solution:</strong><div>${r.solution}</div></div>` : ''}
    `;
    container.appendChild(div);
  });
}
