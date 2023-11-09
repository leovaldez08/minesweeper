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
        // Logic to randomly place mines on the board
    }

    calculateAdjacentMines(board) {
        // Logic to calculate the number of adjacent mines for each cell
    }
}

class GameRenderer {
    constructor(game, containerId) {
        this.game = game;
        this.container = document.getElementById(containerId);
    }

    render() {
        if (this.game.isGameOver) {
            this.container.innerHTML = 'You Won!';
            return;
        }

        this.container.innerHTML = '';

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
                    this.game.board[row][col].reveal();
                    this.render(); 
                });
                this.updateCellUI(cellElement, this.game.board[row][col]);

                rowElement.appendChild(cellElement);
            }

            this.container.appendChild(rowElement);
        }
    }

    updateCellUI(cellElement, cell) {
        if (cell.isRevealed) {
            if (cell.isMine) {
                cellElement.classList.add('mine');
            } else {

                cellElement.textContent = cell.adjacentMines;
            }
        } else {
            cellElement.textContent = ''; 
            if (cell.isFlagged) {
                cellElement.textContent = 'F'; 
            } else {
                cellElement.textContent = ''; 
            }
        }
    }
}

const game = new MinesweeperGame(10, 10, 10);
game.setCells(); 
const gameRenderer = new GameRenderer(game, 'game-board');
gameRenderer.render();