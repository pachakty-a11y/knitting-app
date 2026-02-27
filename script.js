// ==========================================
// 1. データの準備と初期化
// ==========================================
let count = Number(localStorage.getItem('knittingCount')) || 0;
let yarns = JSON.parse(localStorage.getItem('yarnList')) || [];
const counterText = document.getElementById('counter');

// ページを開いた時の読み込み処理
window.onload = function() {
    renderList();
    loadCurrentProject();
    updateApp();
};

// ==========================================
// 2. メイン機能（カウンター）
// ==========================================
function updateApp() {
    const goal = Number(document.getElementById('displayGoal').innerText);
    counterText.innerText = count;
    localStorage.setItem('knittingCount', count);

    // あと何段かの計算
    const remaining = goal - count;
    document.getElementById('remainingRows').innerText = goal > 0 ? Math.max(0, remaining) : 0;

    // 目標達成時の演出
    if (goal > 0 && count >= goal) {
        counterText.style.color = "#7fbfff";
        if (count === goal) {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            alert("目標達成です！お疲れ様でした🧶");
        }
    } else {
        counterText.style.color = "#2c3e50";
    }
}

function countUp() {
    count++;
    if (navigator.vibrate) navigator.vibrate(50);
    updateApp();
}

function countDown() {
    if (count > 0) {
        count--;
        updateApp();
    }
}

// ==========================================
// 3. 工程管理と履歴
// ==========================================
function updateProject() {
    const process = document.getElementById('processInput').value || "---";
    const yarn = document.getElementById('yarnInput').value || "---";
    const needle = document.getElementById('needleInput').value || "---";
    const goalValue = document.getElementById('goalInput').value || "0";
    const goal = parseInt(goalValue.replace(/[^0-9]/g, '')) || 0;

    setProjectDisplay(process, yarn, needle, goal);
    saveProjectToStorage(process, yarn, needle, goal);

    count = 0;
    updateApp();
    clearInputs();
}

function finishProject() {
    if (confirm("この工程を完了として履歴に保存しますか？")) {
        saveToHistory();
        setProjectDisplay("---", "---", "---", 0);
        clearProjectStorage();
        count = 0;
        updateApp();
    }
}

function saveToHistory() {
    const process = document.getElementById('displayProcess').innerText;
    if (process === "---") return;

    const now = new Date();
    const dateString = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const historyText = `[${dateString}] ${process} (${count}段完了)`;
    
    yarns.unshift(historyText);
    localStorage.setItem('yarnList', JSON.stringify(yarns));
    renderList();
}

function renderList() {
    const listElement = document.getElementById('yarnList');
    listElement.innerHTML = "";
    yarns.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item}</span><button class="delete-btn" onclick="deleteYarn(${index})">✕</button>`;
        listElement.appendChild(li);
    });
}

// ==========================================
// 4. サポート関数（補助機能）
// ==========================================
function resetOnly() {
    if (confirm("カウントを 0 に戻しますか？")) {
        count = 0;
        updateApp();
    }
}

function deleteYarn(index) {
    yarns.splice(index, 1);
    localStorage.setItem('yarnList', JSON.stringify(yarns));
    renderList();
}

function clearAllHistory() {
    if (confirm("すべての履歴を消去しますか？")) {
        yarns = [];
        localStorage.setItem('yarnList', JSON.stringify(yarns));
        renderList();
    }
}

function setProjectDisplay(p, y, n, g) {
    document.getElementById('displayProcess').innerText = p;
    document.getElementById('displayYarn').innerText = y;
    document.getElementById('displayNeedle').innerText = n;
    document.getElementById('displayGoal').innerText = g;
}

function saveProjectToStorage(p, y, n, g) {
    localStorage.setItem('displayProcess', p);
    localStorage.setItem('displayYarn', y);
    localStorage.setItem('displayNeedle', n);
    localStorage.setItem('displayGoal', g);
}

function loadCurrentProject() {
    const p = localStorage.getItem('displayProcess') || "---";
    const y = localStorage.getItem('displayYarn') || "---";
    const n = localStorage.getItem('displayNeedle') || "---";
    const g = localStorage.getItem('displayGoal') || "0";
    setProjectDisplay(p, y, n, g);
}

function clearProjectStorage() {
    ['displayProcess', 'displayYarn', 'displayNeedle', 'displayGoal'].forEach(key => localStorage.removeItem(key));
}

function clearInputs() {
    ['processInput', 'yarnInput', 'needleInput', 'goalInput'].forEach(id => document.getElementById(id).value = "");
}