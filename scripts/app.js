// Initial Elo Rating
let elo = 1200;
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("elo-rating").innerText = elo;
});

// Task Completion Logic
function completeTask(taskElement, difficulty) {
    let points = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30;
    elo += points;
    updateElo();
    taskElement.remove(); // Remove the completed task
}

// Update Elo UI
function updateElo() {
    document.getElementById("elo-rating").innerText = elo;
}
