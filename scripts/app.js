let currentElo = 1200;
let tasks = [];
let focusArea = 'general';
let eloHistory = [];
let currentDate = new Date().toDateString();

// Chart initialization
const ctx = document.getElementById('eloChart').getContext('2d');
let eloChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Elo Rating',
            data: [],
            borderColor: '#779556',
            tension: 0.1,
            pointBackgroundColor: '#ffd700',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                grid: { color: '#4a4a4a' },
                ticks: { color: '#ffffff' }
            },
            x: {
                grid: { color: '#4a4a4a' },
                ticks: { color: '#ffffff' }
            }
        },
        plugins: {
            legend: { labels: { color: '#ffffff' } }
        }
    }
});

// Core Functions
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const newTask = {
        text: taskText,
        difficulty: document.getElementById('difficultySelect').value,
        category: document.getElementById('categorySelect').value,
        added: new Date().toISOString(),
        completed: false
    };

    tasks.push(newTask);
    taskInput.value = '';
    displayTasks();
    saveData();
}

function completeTask(index) {
    const task = tasks[index];
    const eloChange = calculateEloChange(task, true);
    
    currentElo += eloChange;
    tasks.splice(index, 1);
    
    updateEloDisplay();
    recordEloChange();
    saveData();
    displayTasks();
}

function missTask(index) {
    const task = tasks[index];
    const eloChange = calculateEloChange(task, false);
    
    currentElo += eloChange;
    tasks.splice(index, 1);
    
    updateEloDisplay();
    recordEloChange();
    saveData();
    displayTasks();
}

// Elo Calculations
function calculateEloChange(task, isCompletion) {
    const difficultyWeights = { easy: 5, medium: 10, hard: 20 };
    const categoryMultipliers = { general: 1, fitness: 1.5, study: 1.3 };
    
    let change = difficultyWeights[task.difficulty] * categoryMultipliers[task.category];
    if (task.category === focusArea) change *= 1.5;
    
    return isCompletion ? change : -Math.abs(change * 0.7);
}

// Display Functions
function displayTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <div>
                <span class="difficulty">${'⭐'.repeat(task.difficulty === 'easy' ? 1 : task.difficulty === 'medium' ? 2 : 3)}</span>
                <span class="task-text">${task.text}</span>
                <span class="task-category">${getCategoryIcon(task.category)}</span>
            </div>
            <div class="task-actions">
                <button class="complete-btn" onclick="completeTask(${index})">✓ Complete</button>
                <button class="miss-btn" onclick="missTask(${index})">✕ Miss</button>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

function getCategoryIcon(category) {
    const icons = { general: '📦', fitness: '🏋️', study: '📖' };
    return icons[category] || '';
}

// Data Management
function saveData() {
    localStorage.setItem('eloData', JSON.stringify({
        currentElo,
        tasks,
        eloHistory,
        focusArea,
        lastAccess: new Date().toISOString()
    }));
}

function loadData() {
    const data = JSON.parse(localStorage.getItem('eloData'));
    if (data) {
        currentElo = data.currentElo || 1200;
        tasks = data.tasks || [];
        eloHistory = data.eloHistory || [];
        focusArea = data.focusArea || 'general';
        checkDailyReset(data.lastAccess);
    }
    updateEloDisplay();
    updateChart();
    updateFocusDisplay();
}

// Daily Reset System
function checkDailyReset(lastAccess) {
    const lastDate = new Date(lastAccess).toDateString();
    const today = new Date().toDateString();
    if (lastDate !== today) {
        tasks = [];
        currentDate = today;
        saveData();
    }
}

// UI Updates
function updateEloDisplay() {
    document.getElementById('eloScore').textContent = Math.round(currentElo);
}

function recordEloChange() {
    eloHistory.push(currentElo);
    if (eloHistory.length > 30) eloHistory.shift();
    updateChart();
}

function updateChart() {
    eloChart.data.labels = Array.from({length: eloHistory.length}, (_, i) => i + 1);
    eloChart.data.datasets[0].data = eloHistory;
    eloChart.update();
}

function setFocus(area) {
    focusArea = area;
    updateFocusDisplay();
    saveData();
}

function updateFocusDisplay() {
    document.getElementById('focusSelect').value = focusArea;
}

// Initialize App
function initApp() {
    loadData();
    displayTasks();
    setFocus(focusArea);
}

// Start Application
initApp();