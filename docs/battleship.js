
function GameBoard(gridSize = 6, tries = 20) {
    this.gridSize = gridSize;
    this.tries = tries;

    this.shipCells = [];
    this.cellmatrix = [];
    this.GAME_OVER_TEXT = 'GAME OVER!';
    this.YOU_WON_TEXT = 'Congratulations! You won!';

    this.buildBoard = function () {
        this.grid_rows = this.grid_cols = [...Array(this.gridSize).keys()];

        var wrapper = document.getElementById('gridContainer');
        var content = '';
        this.grid_rows.forEach(gridRowId =>
            this.grid_cols.forEach(gridColId => {
                content += '<div '
                    + 'id="row' + gridRowId + 'col' + gridColId + '" class="box" '
                    + ' >&nbsp;</div>';
            }));
        wrapper.innerHTML = content;
        document.getElementById('triesLeft').innerText = this.tries;
    }

    this.arrangeShips = function (shipPlacement) {
        shipPlacement.ships.forEach(ship => {
            var shipcellDetails = [];
            // Draw the ship vertically
            if (ship.orientation == 'vertical') {
                row = ship.coords[0];
                col = ship.coords[1];
                do {
                    cellId = "row" + row + "col" + col;
                    this.cellmatrix.push(cellId);
                    shipcellDetails.push(cellId);
                    row++;
                } while (row < ship.size + ship.coords[0]);
            }
            // Draw the ship horizontally
            if (ship.orientation == 'horizontal') {
                row = ship.coords[0];
                col = ship.coords[1];
                do {
                    cellId = "row" + row + "col" + col;
                    this.cellmatrix.push(cellId);
                    shipcellDetails.push(cellId);
                    col++;
                } while (col < ship.size + ship.coords[1]);
            }
            this.shipCells.push(shipcellDetails);
        });
    }


    this.hasTheUserWon = function () {
        // If all the cells in all the ships are SUNK color, then the use has won!
        return this.shipCells.flat().filter(e => document.getElementById(e).style.backgroundColor != SUNK_COLOR).length == 0;
    }


    this.getBoardIdList = function () {
        var a = [];
        this.grid_rows.forEach(gridRowId =>
            this.grid_cols.forEach(gridColId => {
                a.push('row' + gridRowId + 'col' + gridColId);
            }));
        return a;
    }

    // This will be assigned to every cell's onclick property
    this.checkState = (cellEvent) => {
        var cell = cellEvent.target;

        // Check if we have tries left.
        if (document.getElementById('triesLeft').innerText == this.GAME_OVER_TEXT) { return; }
        document.getElementById('triesLeft').innerText = this.tries;

        // Check if this is an untouched cell
        if (cell.style.backgroundColor == '') {
            // Use up a try
            this.tries--;
            // Set the background color of the clicked cell to one of the three colors.
            cell.style.backgroundColor = this.cellmatrix.includes(cell.id) ? this.checkIfThisMakesTheShipSunk(cell) : MISS_COLOR;

        }
        // Check, if now we have ALL the ships sunk?!
        if (this.hasTheUserWon()) {
            document.getElementById('statusMsg').innerText = this.YOU_WON_TEXT;
            this.tries = -1;
        }

        if (this.tries > 0) {
            document.getElementById('triesLeft').innerText = this.tries;
        } else {
            if (document.getElementById('statusMsg').innerText != this.YOU_WON_TEXT) {
                document.getElementById('statusMsg').innerText = this.GAME_OVER_TEXT;
            }

        }
    }


    this.checkIfThisMakesTheShipSunk = function (cellDetails) {
        // Initialize the color, since it is already a hit
        var colorOfCell = HIT_COLOR;

        this.shipCells.forEach(scd => {
            // Check every ship on the board
            if (scd.includes(cellDetails.id)) {
                var hit = 0;
                scd.forEach(e => {
                    if (e == cellDetails.id) {
                        // Color the cell, if we are the same.
                        document.getElementById(e).style.backgroundColor = HIT_COLOR;
                    }
                    // Count how many cells are HIT of the ship
                    hit += (document.getElementById(e).style.backgroundColor == HIT_COLOR) ? 1 : 0;
                });

                // If the length of the ship is the same as the HIT (including the current one), then SUNK
                if (scd.length == hit) {
                    // Now just set the whole ship to SUNK_COLOR
                    scd.forEach(e => document.getElementById(e).style.backgroundColor = SUNK_COLOR);
                    // And return the SUNK_COLOR for the last cell
                    colorOfCell = SUNK_COLOR;
                }
            }
        });
        return colorOfCell;
    }

};