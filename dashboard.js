const SHEET_ID = "1wVIukV5iP55Fto9-akfiSycGc3fKrwmY8oAkBuVecKs";

async function loadQuizList() {
    const listContainer = document.getElementById("quiz-list");

    listContainer.innerHTML = "<p>Loading quiz list…</p>";

    try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?`;

        const response = await fetch(url);
        const text = await response.text();

        // Extract sheet names
        const sheetNames = [...text.matchAll(/"([^"]+)"/g)]
            .map(match => match[1])
            .filter(name => 
                name !== "" && 
                !name.includes("gid") && 
                !name.includes("version")
            );

        // Remove duplicates
        const uniqueSheets = [...new Set(sheetNames)];

        // Show only your valid quiz tabs
        const allowedSheets = ["Maths", "Science", "English"];

        const quizzes = uniqueSheets.filter(s => allowedSheets.includes(s));

        if (quizzes.length === 0) {
            listContainer.innerHTML = "<p>No quizzes found.</p>";
            return;
        }

        listContainer.innerHTML = "";

        quizzes.forEach(sheet => {
            const div = document.createElement("div");
            div.className = "quiz-item";
            div.innerHTML = `
                <button class="quiz-btn" onclick="startQuiz('${sheet}')">
                    ${sheet}
                </button>
            `;
            listContainer.appendChild(div);
        });

    } catch (err) {
        console.log(err);
        listContainer.innerHTML = "<p>Error loading quiz list.</p>";
    }
}

function startQuiz(sheet) {
    localStorage.setItem("selectedQuiz", sheet);
    window.location.href = "quiz.html";
}

window.onload = loadQuizList;
