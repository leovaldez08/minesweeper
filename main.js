class Observer {
    // Update method to be implemented by concrete observers
    update() {}
}

class Subject {
    // List to store observers
    observers = [];

    // Add an observer to the list
    addObserver(observer) {
        this.observers.push(observer);
    }

    // Notifies all observers
    notifyObservers() {
        this.observers.forEach(observer => observer.update());
    }
}

class Cell {
    game = null;

    // Cell properties
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isMine = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.adjacentMines = 0;
    }

    // Set the MinesweeperGame instance for the cell
    setGame(game) {
        this.game = game;
    }

    // Check if the cell contains a mine
    isMineCell() {
        return this.isMine;
    }

    // Reveal the cell
    reveal() {
        if (this.isRevealed || this.isFlagged) {
            return;
        }
        this.isRevealed = true;

        // Check for game win condition
        if (this.game) {
            const revealedCells = this.game.board.flat().filter(cell => cell.isRevealed);
            if (revealedCells.length === this.game.rows * this.game.cols - this.game.numMines) {
                this.game.isGameOver = true;
                this.game.notifyObservers(); 
            }
        }
    }

    // To toggle flag on the cell
    toggleFlag() {
        if (!this.isRevealed) {
            this.isFlagged = !this.isFlagged;
        }
    }
}

// Numbered cells for representing the number of adjacent mines
class NumberedCell extends Cell {
    constructor(row, col, number) {
        super(row, col);
        this.adjacentMines = number;
    }
}

class MinesweeperGame extends Subject {
    rows;
    cols;
    numMines;
    board;
    isGameOver = false;

    // MinesweeperGame properties
    constructor(rows, cols, numMines) {
        super();
        this.rows = rows;
        this.cols = cols;
        this.numMines = numMines;
        this.board = this.generateBoard();
    }

    setCells() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col].setGame(this);
            }
        }
    }

    // Generating the initial game board
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

    // Placing mines randomly on the board
    placeMines(board, numMines) {
        const totalCells = this.rows * this.cols;
        const minePositions = new Set();
    
        while (minePositions.size < numMines) {
            const randomPosition = Math.floor(Math.random() * totalCells);
            minePositions.add(randomPosition);
        }
    
        minePositions.forEach(position => {
            const row = Math.floor(position / this.cols);
            const col = position % this.cols;
            board[row][col].isMine = true;
        });
    }
    
    // Calculating the number of adjacent mines for each cell
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

    // Reveals all mines on the board
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
        this.notifyObservers(); 
    }

    // Recursive function to reveal adjacent cells
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

    // Handling the reveal of a cell
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

    // Checks for a winning condition
    checkForWin() {
        const revealedCells = this.board.flat().filter(cell => cell.isRevealed);
        if (revealedCells.length === this.rows * this.cols - this.numMines) {
            this.isGameOver = true;
            this.notifyObservers(); 
        }
    }
}

class GameRenderer extends Observer {
    game;
    container;

    // GameRenderer properties
    constructor(game, containerId) {
        super();
        this.game = game;
        this.container = document.getElementById(containerId);
        this.game.addObserver(this);
    }

    // Renders the game UI
    render() {
        this.container.innerHTML = '';

        if (this.game.isGameOver) {
            this.displayGameOver();
        } else {
            this.displayGameBoard();
        }
    }

    // Display the game board UI
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
                        this.game.notifyObservers(); 
                    }
                });

                // Handle left-click to reveal cells
                cellElement.addEventListener('click', () => {
                    this.game.handleCellReveal(row, col);
                    this.game.notifyObservers(); 
                });
                this.updateCellUI(cellElement, this.game.board[row][col]);

                rowElement.appendChild(cellElement);
            }

            this.container.appendChild(rowElement);
        }
    }

    // Display the game over screen
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

        // Button to restart the game
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';

        // Creates a new game instance when the button is clicked
        restartButton.addEventListener('click', () => {
            const newGame = new MinesweeperGame(this.game.rows, this.game.cols, this.game.numMines);
            newGame.setCells();
            newGame.placeMines(newGame.board, newGame.numMines);
            newGame.calculateAdjacentMines(newGame.board);
            this.game = newGame;
            this.game.addObserver(this); 
            this.render();
        });

        this.container.appendChild(restartButton);
    }

    // Updates the UI of a cell based on its state
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

    // Calling this method when the observer is notified of a change
    update() {
        this.render();
    }
}

// Initializing a game
const game = new MinesweeperGame(10, 10, 6);
const gameRenderer = new GameRenderer(game, 'game-board');
game.setCells();
game.placeMines(game.board, game.numMines);
game.calculateAdjacentMines(game.board);
gameRenderer.render();