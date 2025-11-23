// Your Sheet ID
const SHEET_ID = "1wVIukV5iP55Fto9-akfiSycGc3fKrwmY8oAkBuVecKs";

// HARD-CODED QUIZ LIST (Works 100%)
const QUIZ_TABS = ["Maths", "Science", "English"];

function loadQuizList() {
    const listContainer = document.getElementById("quiz-list");
    listContainer.innerHTML = "";

    QUIZ_TABS.forEach(sheet => {
        const div = document.createElement("div");
        div.className = "quiz-item";

        div.innerHTML = `
            <button class="quiz-btn" onclick="startQuiz('${sheet}')">
                ${sheet}
            </button>
        `;

        listContainer.appendChild(div);
    });
}

function startQuiz(sheet) {
    localStorage.setItem("selectedQuiz", sheet);
    window.location.href = "quiz.html";
}

window.onload = loadQuizList;
