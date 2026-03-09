// ==========================================
// 1. データの準備と初期化
// ==========================================
// プロジェクト全データの配列（LocalStorageから読み込む）
let projects = JSON.parse(localStorage.getItem('knittingProjects')) || [];

// 「今どのプロジェクトを選択しているか」のインデックス（-1は未選択）
let currentProjectIndex = localStorage.getItem('currentProjectIndex') !== null 
    ? Number(localStorage.getItem('currentProjectIndex')) 
    : -1;

// 今までの変数は、選択中のプロジェクトから中身を取り出すようにします
let count = 0; 

// 初期起動時に、選択中のプロジェクトがあればデータをセットする
window.onload = function() {
    // 1. データを読み込む
    const savedProjects = localStorage.getItem('knittingProjects');
    projects = savedProjects ? JSON.parse(savedProjects) : [];
    
    // インデックスも読み込むが、今回は「一覧」を優先するので判定には使わない
    const savedIndex = localStorage.getItem('currentProjectIndex');
    currentProjectIndex = savedIndex !== null ? parseInt(savedIndex) : -1;

    // 2. 強制的に「一覧」を表示する
    // setTimeoutを使うことで、ブラウザがHTMLを描画し終えるのを「一瞬待って」から実行
    setTimeout(() => {
        showView('list'); 
    }, 10); 
};

// 画面切り替え用の関数
function showView(viewName) {
    // すべての画面を一度取得する
    const listView = document.getElementById('listView');
    const createView = document.getElementById('createView');
    const counterView = document.getElementById('counterView');

    // いったん全部隠す
    listView.style.display = 'none';
    createView.style.display = 'none';
    counterView.style.display = 'none';

    // 指定された画面だけを表示する
    if (viewName === 'list') {
        listView.style.display = 'block';
        renderProjectList();
        renderList();
    } else if (viewName === 'create') {
        createView.style.display = 'block';
    } else if (viewName === 'counter') {
        counterView.style.display = 'block';
    }
}

// ==========================================
// 2. メイン機能（カウンター）
// ==========================================
function updateApp() {
    const goal = Number(document.getElementById('displayGoal').innerText);
    // ↓ ここ！ counterText を document.getElementById('counter') に置き換える
    const counterElement = document.getElementById('counter');
    
    counterElement.innerText = count;
    localStorage.setItem('knittingCount', count);

    // あと何段かの計算
    const remaining = goal - count;
    document.getElementById('remainingRows').innerText = goal > 0 ? Math.max(0, remaining) : 0;

    // 目標達成時の演出
    if (goal > 0 && count >= goal) {
        counterElement.style.color = "#7fbfff"; // 色を変える対象も変更
        if (count === goal) {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            alert("目標達成です！お疲れ様でした🧶");
        }
    } else {
        counterElement.style.color = "#2c3e50";
    }
}

function countUp() {
    if (currentProjectIndex === -1) return;
    
    count++;
    projects[currentProjectIndex].count = count;
    saveAll(); // 保存！
    
    if (navigator.vibrate) navigator.vibrate(50);
    updateApp();
}

function countDown() {
    if (count > 0) {
        count--;
        projects[currentProjectIndex].count = count;
        saveAll();
        updateApp();
    }
}

// ==========================================
// 3. 工程管理と履歴
// ==========================================
function updateProject() {
    const process = document.getElementById('processInput').value || "新しい工程";
    const yarn = document.getElementById('yarnInput').value || "---";
    const needle = document.getElementById('needleInput').value || "---";
    const goal = parseInt(document.getElementById('goalInput').value.replace(/[^0-9]/g, '')) || 0;

    // 新しいプロジェクトオブジェクトを作成
    const newProject = {
        process: process,
        yarn: yarn,
        needle: needle,
        goal: goal,
        count: 0
    };

    // 配列の先頭に追加
    projects.unshift(newProject);
    
    // 保存して、今追加したものを「現在操作中」にする
    currentProjectIndex = 0;
    saveAll();
    
    // 表示を更新してカウンター画面へ
    loadProject(0);
    showView('counter');
    clearInputs();
}

// script.js 内
function renderProjectList() {
    const listDiv = document.getElementById('projectList');
    listDiv.innerHTML = "";

    projects.forEach((proj, index) => {
        const item = document.createElement('div');
        item.className = "project-card";
        
        // カード全体をクリックした時の処理
        item.innerHTML = `
            <div onclick="selectAndOpenProject(${index})" style="flex-grow:1;">
                <strong>${proj.process}</strong><br>
                <small>${proj.count} / ${proj.goal}段 (${proj.yarn})</small>
            </div>
            <button class="delete-btn" onclick="deleteProject(${index}, event)">✕</button>
        `;
        listDiv.appendChild(item);
    });
}

// 選択と画面移動をセットで行う新しい関数
function selectAndOpenProject(index) {
    loadProject(index);    // データの読み込み
    showView('counter');   // 管理画面へ切り替え
}

// 選択したプロジェクトのデータを画面に反映させる
function loadProject(index) {
    currentProjectIndex = index;
    const p = projects[index];
    
    count = p.count;
    document.getElementById('displayProcess').innerText = p.process;
    document.getElementById('displayYarn').innerText = p.yarn;
    document.getElementById('displayNeedle').innerText = p.needle;
    document.getElementById('displayGoal').innerText = p.goal;
    
    updateApp(); // 画面上の数字（あと◯段など）を更新
}

// すべてのデータをまとめて保存する関数
function saveAll() {
    localStorage.setItem('knittingProjects', JSON.stringify(projects));
    localStorage.setItem('currentProjectIndex', currentProjectIndex);
}

function finishProject() {
    if (currentProjectIndex === -1) {
        alert("プロジェクトが選択されていません");
        return;
    }

    if (confirm("この工程を完了として履歴に保存しますか？")) {
        // 1. 履歴に保存（今の内容をログに送る）
        saveToHistory();

        // 2. メインの配列から今のプロジェクトを削除
        projects.splice(currentProjectIndex, 1);

        // 3. 選択状態をリセット
        currentProjectIndex = -1;
        count = 0;

        // 4. 保存と表示の更新
        saveAll();
        updateApp();
        renderProjectList(); // リストを再描画
        
        // 5. 完了したら一覧画面に戻る（任意ですが、このほうが自然です）
        showView('list');
        
        alert("お疲れ様でした！プロジェクトを完了しました。");
    }
}

function deleteProject(index, event) {
    // カード自体のクリックイベント（選択処理）が動かないように止める
    event.stopPropagation(); 

    if (confirm("このプロジェクトを削除しますか？")) {
        projects.splice(index, 1); // 配列から削除
        
        // もし今編んでいるものを消したなら、選択状態を解除
        if (currentProjectIndex === index) {
            currentProjectIndex = -1;
        } else if (currentProjectIndex > index) {
            currentProjectIndex--; // インデックスのズレを補正
        }
        
        saveAll();
        renderProjectList();
    }
}

function saveToHistory() {
    // 1. 今のプロジェクト情報を取得（表示されている文字から取る）
    const process = document.getElementById('displayProcess').innerText;
    if (process === "---" || process === "") return;

    // 2. 日時を作成
    const now = new Date();
    const dateString = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const historyText = `[${dateString}] ${process} (${count}段完了)`;

    // 3. ローカルストレージから「現在の履歴リスト」を読み込む
    let currentLogs = JSON.parse(localStorage.getItem('yarnLog')) || [];
    
    // 4. 新しい履歴を先頭に追加
    currentLogs.unshift(historyText);
    
    // 5. 「yarnLog」という名前で保存し直す
    localStorage.setItem('yarnLog', JSON.stringify(currentLogs));
    
    // 6. 画面を更新
    renderList();
}

function renderList() {
    const listElement = document.getElementById('yarnList'); // HTMLのULタグのID
    if (!listElement) return;

    // 保存先を 'yarnLog' に統一して読み込む
    const logs = JSON.parse(localStorage.getItem('yarnLog')) || [];
    
    listElement.innerHTML = '';
    logs.forEach(logText => {
        const li = document.createElement('li');
        li.innerText = logText;
        // ちょっとオシャレにするならスタイルもJSで当てられます
        li.style.padding = "5px 0";
        li.style.borderBottom = "1px solid #eee";
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