
class Board {
    constructor() {
        // Build the board, using CSS grid layout
        let b = document.getElementById('board');

        b.className = 'grid-container';
        let content = '';
        for (let c = 1; c <= 3; c++) {
            for (let r = 1; r <= 3; r++) {
                content += '<div id="row' + r + 'col' + c + '" class="grid-item"> </div>';
            }
        }
        b.innerHTML = content;
    }

    message(msg) {
        document.getElementById('system-message').innerHTML = msg;
    }

    alert(msg) {
        this.message('<span style="color: red; font-size: 2em">' + msg + '</span>');
    }
}

class Game {
    isGameOver = false;
    nextPlayer = 'X';

    constructor(boardObject) {
        this.board = boardObject;

        // "Flip a coin" to decide which player starts
        this.nextPlayer = Math.floor(Math.random() * 100) >= 50 ? 'X' : 'O';
    }

    switchPlayer() {
        this.nextPlayer = (this.nextPlayer == 'X') ? 'O' : 'X';
        this.board.message('The next player is ' + this.nextPlayer);
    }


    testGameStatus(clickedCell) {
        if (this.isGameOver) {
            alert("Please refresh the page, to start a new game.");
            return;
        }

        if (clickedCell.innerText != '') {
            alert('You cannot click on this cell. It was already clicked.');
        } else {
            clickedCell.innerText = this.nextPlayer;

            if (this.checkBoard()) {
                this.board.alert('GAME OVER! Player `' + this.nextPlayer + '` Won!');
                this.isGameOver = true;
            } else {
                if (this.isStaleMate()) {
                    this.board.alert('Nobody won. A Stale-Mate.');
                    this.isGameOver = true;
                    return;
                }
                this.switchPlayer();
            }
        }
    }

    cellValue(r, c) {
        return document.getElementById('row' + r + 'col' + c).innerText;
    }

    // Check all rows, then all columns, then the two diagonals
    checkBoard() {
        // TODO: Could be more efficient, by terminating before checking the next section!
        var board1 = Array.from([1, 2, 3], r => Array.from([1, 2, 3], c => this.cellValue(r, c)).join('')).join('|');
        var board2 = Array.from([1, 2, 3], c => Array.from([1, 2, 3], r => this.cellValue(r, c)).join('')).join('|');

        var diag1 = Array.from([1, 2, 3], x => this.cellValue(x, x)).join('');
        var diag2 = Array.from([1, 2, 3], x => this.cellValue((4 - x), x)).join('');

        var checkRows = (board1.indexOf('XXX') > -1 || board1.indexOf('OOO') > -1);
        var checkCols = (board2.indexOf('XXX') > -1 || board2.indexOf('OOO') > -1);

        var checkDiag1 = (diag1.indexOf('XXX') > -1 || diag1.indexOf('OOO') > -1);
        var checkDiag2 = (diag2.indexOf('XXX') > -1 || diag2.indexOf('OOO') > -1);

        if (checkRows || checkCols || checkDiag1 || checkDiag2) {
            return true;
        }
        return false
    }

    isStaleMate() {
        // Using the DOM to store values and check the resulting matrix if 
        // all cells have been filled.
        var cells = [...document.getElementsByClassName('grid-item')].map(e => {
            return e.innerHTML.trim();
        }).join('');
        return cells.length == 9;
    }


}