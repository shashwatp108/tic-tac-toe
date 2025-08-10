// --- DOM Element Selection ---
        const boardElement = document.getElementById('board');
        const statusElement = document.getElementById('status');
        const restartButton = document.getElementById('restartButton');
        const pvcButton = document.getElementById('pvcButton');
        const pvpButton = document.getElementById('pvpButton');
        
        // --- SVG Icons ---
        const x_icon = `<svg class="icon-x" viewBox="0 0 52 52"><path d="M10 10 L42 42 M42 10 L10 42"/></svg>`;
        const o_icon = `<svg class="icon-o" viewBox="0 0 52 52"><circle cx="26" cy="26" r="20"/></svg>`;

        // --- Game State Variables ---
        let currentPlayer = 'X';
        let gameActive = true;
        let gameState = Array(9).fill("");
        let gameMode = 'pvc';

        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        // --- Core Game Functions ---
        function handleCellClick(e) {
            const cell = e.target;
            const index = parseInt(cell.getAttribute('data-cell-index'));
            if (gameState[index] !== "" || !gameActive || (gameMode === 'pvc' && currentPlayer === 'O')) return;
            processMove(cell, index);
        }

        function processMove(cell, index) {
            handleCellPlayed(cell, index);
            if (handleResultValidation()) return;
            handlePlayerChange();
        }

        function handleCellPlayed(cell, index) {
            gameState[index] = currentPlayer;
            cell.innerHTML = currentPlayer === 'X' ? x_icon : o_icon;
            cell.classList.add(currentPlayer.toLowerCase());
        }

        function handleResultValidation() {
            let roundWon = false;
            let winningLine = [];
            for (const condition of winningConditions) {
                const [a, b, c] = condition;
                if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                    roundWon = true;
                    winningLine = condition;
                    break;
                }
            }

            if (roundWon) {
                const winner = currentPlayer === 'X' ? 'Player X' : (gameMode === 'pvc' ? 'The AI' : 'Player O');
                statusElement.innerHTML = `${winner} has won! 🎉`;
                gameActive = false;
                winningLine.forEach(index => document.querySelector(`[data-cell-index='${index}']`).classList.add('win'));
                return true;
            }

            if (!gameState.includes("")) {
                statusElement.innerHTML = `Game ended in a draw! 🤝`;
                gameActive = false;
                return true;
            }
            return false;
        }

        function handlePlayerChange() {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            const turnText = currentPlayer === 'X' ? "Player X's Turn" : (gameMode === 'pvc' ? "AI is thinking..." : "Player O's Turn");
            statusElement.innerHTML = turnText;

            if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
                boardElement.classList.add('board-disabled');
                setTimeout(makeComputerMove, 800);
            }
        }
        
        // --- AI Logic ---
        function makeComputerMove() {
            const bestMoveIndex = findBestMove();
            const cell = document.querySelector(`[data-cell-index='${bestMoveIndex}']`);
            boardElement.classList.remove('board-disabled');
            processMove(cell, bestMoveIndex);
        }

        function findBestMove() {
            const check = (player) => {
                for (let i = 0; i < 9; i++) {
                    if (gameState[i] === "") {
                        gameState[i] = player;
                        if (checkWinnerFor(player)) {
                            gameState[i] = ""; return i;
                        }
                        gameState[i] = "";
                    }
                }
                return -1;
            };

            let move = check('O'); // Win
            if (move !== -1) return move;
            move = check('X'); // Block
            if (move !== -1) return move;

            if (gameState[4] === "") return 4; // Center
            const corners = [0, 2, 6, 8].filter(i => gameState[i] === "");
            if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
            
            const available = gameState.map((v, i) => v === "" ? i : null).filter(v => v !== null);
            return available[Math.floor(Math.random() * available.length)];
        }

        function checkWinnerFor(player) {
            return winningConditions.some(condition => condition.every(index => gameState[index] === player));
        }

        // --- Game Setup and Control ---
        function handleRestartGame() {
            gameActive = true;
            currentPlayer = "X";
            gameState.fill("");
            statusElement.innerHTML = `Player X's Turn`;
            document.querySelectorAll('.cell').forEach(cell => {
                cell.innerHTML = "";
                cell.classList.remove('x', 'o', 'win');
            });
            boardElement.classList.remove('board-disabled');
        }
        
        function setGameMode(newMode) {
            gameMode = newMode;
            pvcButton.classList.toggle('btn-active', newMode === 'pvc');
            pvpButton.classList.toggle('btn-active', newMode === 'pvp');
            handleRestartGame();
        }

        function initializeGame() {
            for (let i = 0; i < 9; i++) {
                const cell = document.createElement('div');
                cell.classList.add('cell', 'w-full', 'h-24', 'sm:h-28', 'rounded-lg', 'flex', 'items-center', 'justify-center', 'cursor-pointer');
                cell.setAttribute('data-cell-index', i);
                cell.addEventListener('click', handleCellClick);
                boardElement.appendChild(cell);
            }
            statusElement.innerHTML = `Player X's Turn`;
        }

        // --- Event Listeners ---
        restartButton.addEventListener('click', handleRestartGame);
        pvcButton.addEventListener('click', () => setGameMode('pvc'));
        pvpButton.addEventListener('click', () => setGameMode('pvp'));

        // --- Game Initialization ---
        initializeGame();