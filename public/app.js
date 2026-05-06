async function loadQuestions() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/questions?page=1&limit=10`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    const result = await response.json();

    const container = document.getElementById("questions");
    const summary = document.getElementById("summary");

    container.innerHTML = "";
    summary.textContent = `${result.total} questions • Page ${result.page} of ${result.totalPages}`;

    result.data.forEach((question) => {
      const div = document.createElement("div");
      div.className = "question-card";

      div.innerHTML = `
        ${
          question.imageUrl
            ? `<img class="question-image" src="${question.imageUrl}" alt="Question image">`
            : `<div class="image-placeholder">No Image</div>`
        }

        <div class="card-content">
          <div class="status-row">
            <span class="${question.solved ? "status solved" : "status not-solved"}">
              ${question.solved ? "Solved" : "Not Solved"}
            </span>
            <span class="attempts">${question.attemptCount} attempts</span>
          </div>

          <h3>${question.question}</h3>

          <p class="answer">
            <strong>Answer:</strong> ${question.answer}
          </p>

          <p class="author">
            Created by ${question.userName}
          </p>

          <div class="keywords">
            ${question.keywords.map((k) => `<span>${k}</span>`).join("")}
          </div>
        </div>
      `;

      container.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    document.getElementById("summary").textContent = "Failed to load questions";
  }
}

loadQuestions();