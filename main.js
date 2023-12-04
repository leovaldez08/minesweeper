class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isMine = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.adjacentMines = 0;
        this.game = null;
    }

    setGame(game) {
        this.game = game;
    }

    isMineCell() {
        return this.isMine;
    }

    reveal() {
        if (this.isRevealed || this.isFlagged) {
            return;
        }
        this.isRevealed = true;

        if (this.game) {
            const revealedCells = this.game.board.flat().filter(cell => cell.isRevealed);
            if (revealedCells.length === this.game.rows * this.game.cols - this.game.numMines) {
                this.game.isGameOver = true;
            }
        }
    }

    toggleFlag() {
        if (!this.isRevealed) {
            this.isFlagged = !this.isFlagged;
        }
    }
}

class NumberedCell extends Cell {
    constructor(row, col, number) {
        super(row, col);
        this.adjacentMines = number;
    }
}

class MinesweeperGame {
    constructor(rows, cols, numMines) {
        this.rows = rows;
        this.cols = cols;
        this.numMines = numMines;
        this.board = this.generateBoard();
        this.isGameOver = false;
    }

    setCells() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col].setGame(this);
            }
        }
    }

    generateBoard() {
        const board = [];
        for (let row = 0; row < this.rows; row++) {
            let rowCells = [];
            for (let col = 0; col < this.cols; col++) {
                const cell = new Cell(row, col);
                rowCells.push(cell);
            }
            board.push(rowCells);
        }
        this.placeMines(board, this.numMines);
        this.calculateAdjacentMines(board);
        return board;
    }

    placeMines(board, numMines) {
        let minesPlaced = 0;

        while (minesPlaced < numMines) {
            const randomRow = Math.floor(Math.random() * this.rows);
            const randomCol = Math.floor(Math.random() * this.cols);

            const cell = board[randomRow][randomCol];

            if (!cell.isMine) {
                cell.isMine = true;
                minesPlaced++;
            }
        }
    }

    calculateAdjacentMines(board) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = board[row][col];

                if (!cell.isMine) {
                    for (let i = row - 1; i <= row + 1; i++) {
                        for (let j = col - 1; j <= col + 1; j++) {
                            if (i >= 0 && i < this.rows && j >= 0 && j < this.cols) {
                                if (board[i][j].isMine) {
                                    cell.adjacentMines++;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (cell.isMineCell()) {
                    cell.isRevealed = true;
                }
            }
        }
        this.isGameOver = true;
    }

    revealAdjacentCells(row, col) {
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < this.rows && j >= 0 && j < this.cols) {
                    const cell = this.board[i][j];
                    if (!cell.isRevealed && !cell.isFlagged) {
                        cell.reveal();
                        if (cell.adjacentMines === 0) {
                            this.revealAdjacentCells(i, j);
                        }
                    }
                }
            }
        }
    }

    handleCellReveal(row, col) {
        const cell = this.board[row][col];

        if (cell.isMineCell()) {
            this.revealAllMines();
        } else {
            cell.reveal();
            this.checkForWin();

            if (cell.adjacentMines === 0) {
                this.revealAdjacentCells(row, col);
            }
        }
    }

    checkForWin() {
        const revealedCells = this.board.flat().filter(cell => cell.isRevealed);
        if (revealedCells.length === this.rows * this.cols - this.numMines) {
            this.isGameOver = true;
        }
    }
}

class GameRenderer {
    constructor(game, containerId) {
        this.game = game;
        this.container = document.getElementById(containerId);
    }

    render() {
        this.container.innerHTML = ''; 

        if (this.game.isGameOver) {
            this.displayGameOver();
        } else {
            this.displayGameBoard();
        }
    }

    displayGameBoard() {
        for (let row = 0; row < this.game.rows; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';

            for (let col = 0; col < this.game.cols; col++) {
                const cellElement = document.createElement('div');
                cellElement.className = 'cell';

                // Right-click event handling for marking mines
                cellElement.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (e.button === 2) {
                        this.game.board[row][col].toggleFlag();
                        this.render();
                    }
                });

                // Handle left-click to reveal cells
                cellElement.addEventListener('click', () => {
                    this.game.handleCellReveal(row, col);
                    this.render();
                });
                this.updateCellUI(cellElement, this.game.board[row][col]);

                rowElement.appendChild(cellElement);
            }

            this.container.appendChild(rowElement);
        }
    }

    displayGameOver() {
        const gameOverText = document.createElement('div');
        gameOverText.textContent = 'Game Over';
        this.container.appendChild(gameOverText);

        for (let row = 0; row < this.game.rows; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';

            for (let col = 0; col < this.game.cols; col++) {
                const cellElement = document.createElement('div');
                cellElement.className = 'cell';

                this.updateCellUI(cellElement, this.game.board[row][col]);

                rowElement.appendChild(cellElement);
            }

            this.container.appendChild(rowElement);
        }

        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';
        
        restartButton.addEventListener('click', () => {
            const newGame = new MinesweeperGame(this.game.rows, this.game.cols, this.game.numMines);
            newGame.setCells();
            newGame.placeMines(newGame.board, newGame.numMines);
            newGame.calculateAdjacentMines(newGame.board);
            this.game = newGame;
            this.render();
        });

        this.container.appendChild(restartButton);
    }

    updateCellUI(cellElement, cell) {
        if (cell.isRevealed) {
            if (cell.isMineCell()) {
                cellElement.classList.add('mine');
                cellElement.textContent = 'M'; 
            } else {
                cellElement.textContent = cell.adjacentMines;
            }
        } else {
            cellElement.textContent = '';
            if (cell.isFlagged) {
                cellElement.textContent = 'F';
            }
        }
    }
}

// Initialization
const game = new MinesweeperGame(10, 10, 5);
game.setCells();
game.placeMines(game.board, game.numMines);
game.calculateAdjacentMines(game.board);
const gameRenderer = new GameRenderer(game, 'game-board');
gameRenderer.render();