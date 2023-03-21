class WordleEngine {
    status = '';
    todaysWord = '';
    currentWord = '';
    attempts = 1;
    posInWord = 1;

    solved() {
        console.log("Check if solved");
        console.log("This todaysWord : " + this.todaysWord + " this current word: " + this.currentWord + " attempts:" + this.attempts);

        if (this.todaysWord == this.currentWord) {
            this.status = 'solved';
        } else {
            this.status = 'guessing';
        }

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

            console.log('Attempts:' + this.attempts + ' LetterPosition:' + this.posInWord + ' CurrentWord:' + this.currentWord + " Status:" + this.status);
        }
    }
}
