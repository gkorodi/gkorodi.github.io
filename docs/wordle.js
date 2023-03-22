const arrayRange = (start, stop, step) =>
    Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );

const Colors = {
    Exact: '#469121',
    WrongPlace: '#dddb39',
    Missing: '#727260'
};

class Logger {
    static setDebugOn() {
        localStorage.isDebugOn = true;
    }
    static debug(msg) {
        if (localStorage.isDebugOn) { console.log(msg); }
    }
}

class WordleBoard {
    rows = arrayRange(1, 6, 1);
    cols = arrayRange(1, 5, 1);

    constructor(domElement) {
        // Build the grid in the DOM, is what the WordleBoard class does.
        var content = '';
        this.rows.forEach(r => {
            this.cols.forEach(c => {
                content += '<div '
                    + 'id="' + 'row' + r + 'col' + c + '" class="box" '
                    + ' >&nbsp;</div>';
            });

        });
        domElement.innerHTML = content;
    }

    getCellByKey(cellKey) {
        return document.getElementById(cellKey);
    }

    flipCells(resolution) {
        Logger.debug("Resolution:");
        Logger.debug(resolution);

        // The first element is the attempt/row integer
        var rowId = resolution.shift();
        [1, 2, 3, 4, 5].forEach(c => {
            var cell = this.getCellByKey('row' + rowId + 'col' + c);
            cell.style.backgroundColor = resolution[c - 1];
        })
    }

}

class WordleEngine {
    status = 'guessing';
    todaysWord = '';
    currentWord = '';
    attempts = 1;
    posInWord = 1;

    constructor(boardObject) {
        this.board = boardObject;
    }

    checkCharacter(ch, idx) {
        Logger.debug("Check character:" + ch + " and index:" + idx);

        if (this.todaysWord.split('')[idx] === ch) {
            return Colors.Exact;
        }

        if (this.todaysWord.indexOf(ch) > -1) {
            Logger.debug("IndexOf:" + this.todaysWord.indexOf(ch));
            Logger.debug("Current Index:" + idx);
            return Colors.WrongPlace;
        }

        return Colors.Missing;
    }

    solved() {
        Logger.debug("solved() todaysWord:" + this.todaysWord + " currentWord:" + this.currentWord + " attempts:" + this.attempts);

        // Determine that the current row gets which color cells
        var a = this.currentWord.split('').map((c, i, r) => this.checkCharacter(c, i));
        a.unshift(this.attempts);
        this.board.flipCells(a);

        // Check status based on the colors
        const exactMatches = a.reduce((u, cv) => u += (cv === Colors.Exact) ? 1 : 0, 0);
        this.status = (exactMatches === 5) ? 'solved' : 'guessing';

        return this.status == 'solved';
    }

    checkIfSolved() {
        return false;
    }

    setSolution(todaysWord) {
        this.todaysWord = todaysWord;
    }

    userHasWon() {
        return (this.attempts <= 6 && this.status == 'solved');
    }

    userHasLost() {
        return (this.attempts > 6 && !this.userHasWon());
    }


    analyzeKeyEvent(ke) {
        if ((ke.keyCode >= 65 && ke.keyCode <= 90) || (ke.keyCode >= 97 && ke.keyCode <= 122)) {
            this.currentWord += ke.key;

            if (this.posInWord <= 5) {

                var cellKey = 'row' + this.attempts + 'col' + this.posInWord;
                document.getElementById(cellKey).innerHTML = ke.key;

                if (this.posInWord == 5) {
                    this.solved();

                    // Reset some of the internal states for another attempt
                    this.attempts++;
                    this.currentWord = '';
                    this.posInWord = 1;

                } else {
                    // Advance to the next letter
                    this.posInWord++;
                }
            }

            if (this.attempts > 6) {
                this.status = 'over';
                alert("GAME OVER, you lost! LOOOOSER!");
            }

            Logger.debug('Attempts:' + this.attempts + ' LetterPosition:' + this.posInWord + ' CurrentWord:' + this.currentWord + " Status:" + this.status);
        }
    }
}
