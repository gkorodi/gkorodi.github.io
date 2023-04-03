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

// Reference: https://javascript.plainenglish.io/create-an-array-of-alphabet-characters-in-javascript-with-this-simple-trick-930033079dd3
const alphabet = Array.from(Array(26)).map((e, i) => i + 65).map((x) => String.fromCharCode(x));
console.log(alphabet);


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

    constructor(domElement, alphabetsDomElement) {
        // Build the main grid in the DOM, is what the WordleBoard class does.
        var content = '';
        this.rows.forEach(r => {
            this.cols.forEach(c => {
                content += '<div '
                    + 'id="' + 'row' + r + 'col' + c + '" class="box" '
                    + ' >&nbsp;</div>';
            });

        });
        domElement.innerHTML = content;

        // Build the `letters used` grid
        content = '';
        alphabet.forEach(l => {
            content += '<div id="letter' + l + '" class="letter never-used">' + l + '</div>';
        })
        alphabetsDomElement.innerHTML = content;
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
        [1, 2, 3, 4, 5].forEach(c => {
            var cell = this.getCellByKey('row' + rowId + 'col' + c);
            cell.style.backgroundColor = resolution[c - 1];
            this.flipLettter(cell.innerText.toUpperCase(), resolution[c - 1]);
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

    isSolved() {
        console.log("solved() todaysWord:" + this.todaysWord + " currentWord:" + this.currentWord + " attempts:" + this.attempts);

        // Determine that the current row gets which color cells
        console.log("CurrentWord: " + this.currentWord);

        var a = this.currentWord.split('').map((c, i, r) => this.checkCharacter(c, i));
        a.unshift(this.attempts);
        this.board.flipCells(a);

        // Check status based on the colors
        const exactMatches = a.reduce((u, cv) => u += (cv === Colors.Exact) ? 1 : 0, 0);
        this.status = (exactMatches === 5) ? 'solved' : 'guessing';
        console.log("isSolved: " + this.status);

        return this.status == 'solved';
    }

    setSolution(w) {
        console.log("The solution this time is `" + w + "`");
        this.todaysWord = w.toUpperCase();
    }

    userHasWon() {
        return (this.attempts <= 6 && this.status == 'solved');
    }

    userHasLost() {
        return (this.attempts > 6 && !this.userHasWon());
    }


    analyzeKeyEvent(ke) {
        if ((ke.keyCode >= 65 && ke.keyCode <= 90) || (ke.keyCode >= 97 && ke.keyCode <= 122)) {

            this.currentWord += ke.key.toUpperCase();
            if (this.posInWord <= 5) {
                var cellKey = 'row' + this.attempts + 'col' + this.posInWord;
                document.getElementById(cellKey).innerHTML = ke.key.toUpperCase();
                document.getElementById(cellKey).style.border = 'none';

                if (this.posInWord == 5) {
                    //var isValid = Utilities.validateWithDictionary(this.currentWord);
                    //console.log("IsValid:" + isValid);

                    if (this.isSolved()) {
                        console.log("Solved TRUE");
                    } else {
                        var currentGuess = this.currentWord;
                        Utilities.isValidDictionaryWord(currentGuess).then((isValid) => {
                            console.log("lllllll" + isValid);
                            if (isValid) {
                                // Reset some of the internal states for another attempt
                                this.attempts++;

                            } else {
                                // Do not advance, roll back the current word.
                                this.currentWord = '';
                                this.posInWord = 1;
                                // Pop up a warning about invalid word
                                alert("The word `" + currentGuess + "` is not a valid dictionary word.");
                            }
                        });
                    }
                    this.currentWord = '';
                    this.posInWord = 1;

                } else {
                    // Advance to the next letter
                    this.posInWord++;
                }
            }
            document.getElementById('row' + this.attempts + 'col' + this.posInWord).style.border = '1 solid #000';



            if (this.attempts > 6) {
                this.status = 'over';
                alert("GAME OVER, you lost! LOOOOSER!");
            }

            Logger.debug('Attempts:' + this.attempts + ' LetterPosition:' + this.posInWord + ' CurrentWord:' + this.currentWord + " Status:" + this.status);
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

    static validateWithDictionary(gw) {
        // https://www.dictionaryapi.com/api/v3/references/collegiate/json/voluminous?key=your-api-key
        console.log("validateWithDictionary() " + gw);

        const xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === this.DONE) {
                var o = JSON.parse(this.responseText);
                console.log("Done...");
                console.log(o[0]['meta']['id']);
                return false;
            }
        });
        xhr.open("GET", 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/'
            + gw
            + '?key=23ce0b18-bc31-4585-ba00-957b459f0ff0');
        xhr.send();
    }

    // Using a subscribed API from MiriamWebster dictionary to validate a word
    static async isValidDictionaryWord(gw) {
        console.log("isValidDictionaryWord() start " + gw);
        const response = await fetch('https://www.dictionaryapi.com/api/v3/references/collegiate/json/'
            + gw
            + '?key=23ce0b18-bc31-4585-ba00-957b459f0ff0');
        const responseData = await response.json();
        return responseData.filter(e => typeof (e) === 'object').length > 0;
    }
}
