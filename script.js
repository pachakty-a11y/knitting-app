        let yarns = JSON.parse(localStorage.getItem('yarnList')) || [];
        renderList();

        //毛糸の名前更新
        document.getElementById('yarnName').innerText = localStorage.getItem('yarnName') || "---";

        function updateYarn(){
            const input = document.getElementById('yarnInput');
            const display = document.getElementById('yarnName');
            const name = input.value;

            if (name) {
                // --- A. メインの表示（現在の毛糸）を更新 ---
                display.innerText = input.value;
                localStorage.setItem('yarnName', name);

                // --- B. リスト（在庫）にも追加 ---
                yarns.push(name);
                localStorage.setItem('yarnList', JSON.stringify(yarns));

                // --- C. リストの表示を更新 ---
                renderList();

                input.value = "";
            }
        }

        function renderList(){
            const listElement = document.getElementById('yarnList');
            listElement.innerHTML = "";

            yarns.forEach((yarn) => {
                const li = document.createElement('li');
                li.innerText = yarn;
                listElement.appendChild(li);
            });
        }

        //ページを開いたときに保存された数字を読み込む
        let count = Number(localStorage.getItem('knittingCount')) || 0;

        //画面の表示を保存されていた数字に更新する
        const counterText = document.getElementById('counter');
        counterText.innerText = count;

        //カウントアップ
        function countUp() {
            count++;
            counterText.innerText = count;
            localStorage.setItem('knittingCount', count);
        }

        function reset() {
            if(confirm("本当にリセットしますか？")){
                count = 0;
                counterText.innerText = count;
                localStorage.setItem('knittingCount', count);
            }
            
        }