const arrayRange = (start, stop, step) =>
    Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );

const Colors = {
    Default: '#dddddd',
    Exact: '#469121',
    WrongPlace: '#dddb39',
    Missing: '#727260'
};

// Reference: https://javascript.plainenglish.io/create-an-array-of-alphabet-characters-in-javascript-with-this-simple-trick-930033079dd3
const alphabet = Array.from(Array(26)).map((e, i) => i + 65).map((x) => String.fromCharCode(x));

class Logger {
    static debug(msg) {
        if (window.localStorage.getItem('isDebugOn')) { console.log(msg); }
    }
}



class WordleBoard {
    rows = arrayRange(1, 6, 1);
    cols = arrayRange(1, 5, 1);

    constructor(domElement, alphabetsDomElement) {
        // Build the main grid in the DOM, is what the WordleBoard class does.
        // var content = '';
        // this.rows.forEach(r => {
        //     this.cols.forEach(c => {
        //         content += '<div '
        //             + 'id="' + 'row' + r + 'col' + c + '" class="box" '
        //             + ' >&nbsp;</div>';
        //     });

        // });
        // domElement.innerHTML = content;

        // Build the `letters used` grid
        // content = '';
        // alphabet.forEach(l => {
        //     content += '<div id="letter' + l + '" class="letter never-used">' + l + '</div>';
        // })
        // alphabetsDomElement.innerHTML = content;
    }

    getCellByKey(cellKey) {
        return document.getElementById(cellKey);
    }

    flipLettter(letterIdx, resolved) {
        document.getElementById('letter' + letterIdx).style.backgroundColor = resolved;
        document.getElementById('letter' + letterIdx).style.color = '#fff';
    }

    flipCells(resolution) {
        // The first element is the attempt/row integer
        var rowId = resolution.shift();
        Logger.debug("Current row:" + rowId);
        [1, 2, 3, 4, 5].forEach(c => {
            var cell = this.getCellByKey('row' + rowId + 'col' + c);
            cell.style.backgroundColor = resolution[c - 1];
            this.flipLettter(cell.innerText.toUpperCase(), resolution[c - 1]);
        })
    }

}

const stat_keys = ['wins', 'losses', 'tries'];
class Stats {

    tries = 0;
    wins = 0;
    losses = 0;

    static nextTry() {
        Logger.debug("NextTry()");
        stat_keys.forEach(k =>
            document.getElementById('stats-' + k).innerHTML = window.localStorage.getItem(k)
        );
        window.localStorage.setItem('tries', Number(window.localStorage.getItem('plays') ? window.localStorage.getItem('plays') : 0) + 1);
    }

    static getStats() {
        return stat_keys.map(k => window.localStorage.getItem(k));
    }
}

class WordleEngine {
    status = 'guessing';
    todaysWord = '';
    currentWord = '';
    attempts = 1;
    posInWord = 1;

    constructor() {
        // Set initial focus
        this.board = new WordleBoard();
        document.getElementById('row1col1').style.border = '1px solid #fff';
    }

    checkCharacter(ch, idx) {
        Logger.debug("Check character:" + ch + " and index:" + idx);
        if (this.todaysWord.split('')[idx] === ch) {
            return Colors.Exact;
        }

        if (this.todaysWord.indexOf(ch) > -1) {
            return Colors.WrongPlace;
        }
        return Colors.Missing;
    }

    setAttempt(i) {
        this.attempts = i;
    }

    isSolved() {
        Logger.debug("isSolved() todaysWord:" + this.todaysWord + " currentWord:" + this.currentWord + " attempts:" + this.attempts);

        // Determine that the current row gets which color cells
        var a = this.currentWord.split('').map((c, i, r) => this.checkCharacter(c, i));
        a.unshift(this.attempts);
        this.board.flipCells(a);

        // Check status based on the colors
        const exactMatches = a.reduce((u, cv) => u += (cv === Colors.Exact) ? 1 : 0, 0);
        this.status = (exactMatches === 5) ? 'solved' : 'guessing';
        Logger.debug("The calculated status is: " + this.status);

        return this.status == 'solved';
    }

    setSolution(w) {
        this.todaysWord = w.toUpperCase();
        console.log("The solution to the puzzle is:" + this.todaysWord);
    }

    userHasWon() {
        Logger.debug("Did the user win?!");
        console.log("userHasWon " + this.status);
        return (this.attempts <= 6 && this.status == 'solved');
    }

    userHasLost() {
        Logger.debug("Did the user lost?");
        return (this.attempts > 6 && !this.userHasWon());
    }

    clearWord() {
        // Clear the attempt row content
        [...Array(5).keys()].forEach(k => {
            var cellKey = 'row' + this.attempts + 'col' + (k + 1);
            document.getElementById(cellKey).style.border = 'none';
            document.getElementById(cellKey).innerHTML = '';
            document.getElementById(cellKey).style.backgroundColor = Colors.Default;
        });
        this.currentWord = '';
        this.posInWord = 1;
        Logger.debug("Cleared the guessed word. Reattempt");
    }

    nextTry() {
        this.attemps++;
        this.currentWord = '';
        this.posInWord = 1;
    }

    showGameOver() {
        // Note: This is Bootstrap specific, and uses jQuery instead of pure Javascript.
        $('#defaultModalLabel').html('Game Over');
        $('#defaultModalBody').html('<p>Sorry about that, '
            + 'but you did not find the correct word in 6 attempts.</p>');
        $('#defaultModal').modal('show');
    }

    showWinner() {
        // Note: This is Bootstrap specific, and uses jQuery instead of pure Javascript.
        $('#defaultModalLabel').html('Congratulations!');
        $('#defaultModalBody').html('<p>You WON! You have correctly guessed the right word..</p>');
        $('#defaultModal').modal('show');
    }

    analyzeKeyEvent(ke) {
        Logger.debug('Attempts:' + this.attempts + ' LetterPosition:' + this.posInWord + ' CurrentWord:' + this.currentWord + " Status:" + this.status);

        if (this.attempts > 6) {
            this.status = 'gameover';
            alert('Sorry, but you have lost.');
            window.localStorage.setItem('losses', 1);
            return;
        }
        // Handle backspace
        if (ke.keyCode === 8) {
            // Handle backspace
            Logger.debug("Handling backspace. Roll back ");
            // Position focus on previous field
            this.posInWord -= this.posInWord === 1 ? 0 : 1;

            // Clear current cell
            var cellKey = 'row' + this.attempts + 'col' + (this.posInWord + 1);
            document.getElementById(cellKey).style.border = 'none';
            document.getElementById(cellKey).style.innerHTML = '';

            // Remove current letter from guess word
            this.currentWord = this.posInWord === 1 ? '' : this.currentWord.substring(0, this.posInWord);
            Logger.debug("Shortened word now:" + this.currentWord + " position"
                + this.posInWord);

            var cellKey = 'row' + this.attempts + 'col' + this.posInWord;
            document.getElementById(cellKey).style.border = '1px solid #000';
            document.getElementById(cellKey).innerHTML = '';
        }

        if ((ke.keyCode >= 65 && ke.keyCode <= 90) || (ke.keyCode >= 97 && ke.keyCode <= 122)) {

            this.currentWord += ke.key.toUpperCase();
            if (this.posInWord <= 5) {
                var cellKey = 'row' + this.attempts + 'col' + this.posInWord;
                document.getElementById(cellKey).innerHTML = ke.key.toUpperCase();
                document.getElementById(cellKey).style.border = 'none';

                if (this.posInWord == 5) {
                    //var isValid = Utilities.validateWithDictionary(this.currentWord);
                    //console.log("IsValid:" + isValid);

                    var currentGuess = this.currentWord;
                    var attemptCount = this.attempts;
                    Utilities.isValidDictionaryWord(currentGuess).then((isValid) => {
                        if (isValid) {
                            if (this.isSolved()) {
                                this.showWinner();
                            } else {
                                Logger.debug("the puzzle is not solved at attempts " + attemptCount);

                                if (attemptCount == 6) {
                                    this.status = 'gameover';
                                    this.showGameOver();
                                    //alert('You have unfortunately lost. Please try again, by reloading the page.');
                                }
                                // Not solved, onto the next attempt
                                this.nextTry();
                                attemptCount++;
                                this.attempts++;
                            }
                        } else {
                            // Do not advance, roll back the current word.
                            this.clearWord();
                            // Pop up a warning about invalid word
                            alert("The word `" + currentGuess + "` is not a valid dictionary word.");
                        }
                    });
                } else {
                    // Advance to the next letter
                    this.posInWord++;
                }
            }

            document.getElementById('row' + this.attempts + 'col' + this.posInWord).style.border = '1px solid #000';
            Logger.debug('Finished evaluating, with status `' + this.status + '` at attempt ' + this.attempts);

            if (this.attempts > 6) {
                this.status = 'over';
                alert("GAME OVER, you lost! LOOOOSER!");
            }

        }
    }
}

class Utilities {

    // Using the Dictionary and Thesaurus APIs from the https://www.dictionaryapi.com/
    // API keys have been obtained with a validated account (signed up for API access)

    static validateWithThesaurus(gw) {
        console.log("getDictionaryResponse.... for " + gw);
        var dictionaryKey = '23ce0b18-bc31-4585-ba00-957b459f0ff0';

        const xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === this.DONE) {
                console.log("Thesaurus Response");
                console.log(this.responseText);
                return 'VALID';
            }
        });

        xhr.open("GET", 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/'
            + gw
            + '?key=9526c19e-5ec9-4f50-bc72-444bd653baf0');
        xhr.send();
    }

    // static validateWithDictionary(gw) {
    //     // https://www.dictionaryapi.com/api/v3/references/collegiate/json/voluminous?key=your-api-key
    //     Logger.debug("Validating against a dictionary " + gw);

    //     const xhr = new XMLHttpRequest();
    //     xhr.addEventListener("readystatechange", function () {
    //         if (this.readyState === this.DONE) {
    //             var o = JSON.parse(this.responseText);
    //             Logger.debug('Dictionary word id: ' + o[0]['meta']['id']);
    //             return false;
    //         }
    //     });
    //     xhr.open("GET", 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/'
    //         + gw
    //         + '?key=23ce0b18-bc31-4585-ba00-957b459f0ff0');
    //     xhr.send();
    // }

    // Using a subscribed API from MiriamWebster dictionary to validate a word
    static async isValidDictionaryWord(gw) {
        Logger.debug("Validating against a dictionary " + gw);
        const response = await fetch('https://www.dictionaryapi.com/api/v3/references/collegiate/json/'
            + gw
            + '?key=23ce0b18-bc31-4585-ba00-957b459f0ff0');
        const responseData = await response.json();
        return responseData.filter(e => typeof (e) === 'object').length > 0;
    }

    static async getARandomWord() {
        const response = await fetch("https://random-word-api.vercel.app/api?words=1&length=5");
        const jsonData = await response.json();
        return jsonData[0];
    }
}
