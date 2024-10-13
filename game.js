const gameBoard = document.getElementById("game-board");
const resetBtn = document.getElementById("reset-btn");
const modeBtn = document.getElementById("mode-btn");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const popupInput = document.getElementById("popup-input");
const closeBtn = document.getElementById("close-btn");
const popupBtn = document.getElementById("popup-btn");

const playerX = "X";
const playerO = "O";
let currentPlayer = playerX;
let gameMode = "";
let board = Array(9).fill(null);
let player1Name = "";
let player2Name = "AI";
let aiLevel = 1;

function chooseGameMode() {
    showCustomPopup(
        "Choose game mode: type 'ai' for AI or 'pvp' for Player vs Player", 
        handleGameMode,
        true
    );
}

function handleGameMode(input) {
    const mode = input.toLowerCase();
    if (mode === "ai") {
        gameMode = "ai";
        player1Name = "Player 1";
        initializeBoard();
    } else if (mode === "pvp") {
        gameMode = "pvp";
        getPlayerNames();
    } else {
        showCustomPopup("Invalid selection. Please refresh and try again.");
    }
}

function getPlayerNames() {
    showCustomPopup("Enter name for Player 1 (X):", name => {
        player1Name = name;
        showCustomPopup("Enter name for Player 2 (O):", name => {
            player2Name = name;
            initializeBoard();
        }, true);
    }, true);
}

function initializeBoard() {
    gameBoard.innerHTML = "";
    board = Array(9).fill(null);
    currentPlayer = playerX;
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.addEventListener("click", onCellClick);
        gameBoard.appendChild(cell);
    }
}

function onCellClick(event) {
    const index = event.target.dataset.index;
    if (!board[index]) {
        markCell(index, currentPlayer);
        if (checkWin(currentPlayer)) {
            const winnerName = currentPlayer === playerX ? player1Name : player2Name;
            showCustomPopup(`${winnerName} wins!`);
            return;
        } else if (isDraw()) {
            showCustomPopup("It's a draw!");
            return;
        }
        switchTurn();
        if (gameMode === "ai" && currentPlayer === playerO) {
            aiMove();
        }
    }
}

function markCell(index, player) {
    board[index] = player;
    const cell = document.querySelector(`.cell[data-index='${index}']`);
    cell.textContent = player;
}

function switchTurn() {
    currentPlayer = currentPlayer === playerX ? playerO : playerX;
}

function checkWin(player) {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    return winPatterns.some(pattern => {
        return pattern.every(index => board[index] === player);
    });
}

function isDraw() {
    return board.every(cell => cell);
}

function aiMove() {
    const bestMove = aiLevel === 0 ? randomMove() : minimaxMove();
    markCell(bestMove, playerO);
    if (checkWin(playerO)) {
        showCustomPopup("AI wins!");
        return;
    } else if (isDraw()) {
        showCustomPopup("It's a draw!");
        return;
    }
    switchTurn();
}

function randomMove() {
    const availableMoves = board
        .map((val, index) => (val === null ? index : null))
        .filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function minimaxMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
            board[i] = playerO;
            let score = minimax(board, 0, false);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(newBoard, depth, isMaximizing) {
    if (checkWin(playerO)) return 1;
    if (checkWin(playerX)) return -1;
    if (isDraw()) return 0;
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (!newBoard[i]) {
                newBoard[i] = playerO;
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (!newBoard[i]) {
                newBoard[i] = playerX;
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function showCustomPopup(message, callback = null, showInput = false) {
    popupText.textContent = message;
    if (showInput) {
        popupInput.style.display = "block";
        popupInput.value = ""; // Clear any previous value
    } else {
        popupInput.style.display = "none";
    }
    popup.style.display = "block";
    popupBtn.onclick = () => {
        if (showInput) {
            const input = popupInput.value;
            popup.style.display = "none";
            callback(input);
        } else {
            popup.style.display = "none";
            if (callback) callback();
        }
    };
}

closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
});

popupBtn.addEventListener("click", () => {
    popup.style.display = "none";
});

resetBtn.addEventListener("click", initializeBoard);
modeBtn.addEventListener("click", () => {
    gameMode = gameMode === "pvp" ? "ai" : "pvp";
    showCustomPopup(`Game mode switched to: ${gameMode.toUpperCase()}`);
    initializeBoard();
});

window.onload = chooseGameMode;
