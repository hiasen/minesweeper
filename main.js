function randIntUnder(max) {
    return Math.floor(Math.random()*max);
}
function sampleRandomInts(n, maxInt) {
    let set = new Set;
    while (set.size < n) {
        set.add(randIntUnder(maxInt));
    }
    return set;
}

class MineSquare {
    constructor() {
        this.isMine = false;
        this.neighboringMines = 0;
        this.visited = false;
        this.isFlagged = false;
    }
}

class MineField {
    constructor(height, width, mineCount, eventTarget=document) {
        this.height = height;
        this.width = width;
        this.mineCount = mineCount;
        this.field = new Array(height);
        this.eventTarget = eventTarget;
        this.gameOver = false;
        
        for (let i = 0; i < height; i++ ) {
            this.field[i] = new Array(width);
            for (let j = 0; j < width; j++) {
                this.field[i][j] = new MineSquare;
            }
        }
        let minePositions = this.getRandomMinePositions();
        for (let [i, j] of minePositions) {
            this.field[i][j].isMine = true;
            for (let [x, y] of this.getNeighborIndices(i, j)) {
                this.field[x][y].neighboringMines++;
            }
        }
    }
    getNeighborIndices(i, j) {
        let rows = [i-1, i, i+1].filter((x) => (0<=x) && (x<this.height));
        let cols = [j-1, j, j+1].filter((x) => (0<=x) && (x<this.width));
        let indices = [];
        for (let x of rows) {
            for (let y of cols) {
                indices.push([x, y]);
            }
        }
        return indices.filter(([x, y]) => (x!=i) || (y!=j));
    }

    getRandomMinePositions() {
        let minePositions = sampleRandomInts(this.mineCount, this.height * this.width);
        return Array.from(minePositions).map((value) => [Math.floor(value / this.width), value % this.width]);
    }
    getSquare(i, j) {
        return this.field[i][j];
    }
    check(i, j) {
        let square = this.getSquare(i, j);
        if (!square.visited && !square.isFlagged && !this.gameOver) {
            square.visited = true;
            this.eventTarget.dispatchEvent(new CustomEvent("squareOpened", {detail: {pos: [i, j], square: square}}));
            if (square.isMine) {
                this.eventTarget.dispatchEvent(new CustomEvent("gameOver", {detail: this}));
                this.gameOver = true;
            }
            if (square.neighboringMines == 0) {
                for (let [ii, jj] of this.getNeighborIndices(i, j)) {
                    this.check(ii, jj);
                }
            }
        }
    }
    flag(i, j) {
        let square = this.getSquare(i, j);
        square.isFlagged = !square.isFlagged;
        return square;
    }
}

function getIndicesOfCell(cell) {
    return [cell.parentNode.rowIndex, cell.cellIndex];
}


function createField(mineField) {
    function clickHandler(e) {
        mineField.check(...getIndicesOfCell(this));
    }
    let table = document.createElement("table");
    table.mineField = mineField;
    for (let i = 0; i < mineField.height; i++) {
        let row = table.insertRow();
        for (let j = 0; j < mineField.width; j++) {
            let cell = row.insertCell();
            cell.addEventListener("click", clickHandler);
        }
    }
    mineField.eventTarget.addEventListener("squareOpened", function(e) {
        let [i, j] = e.detail.pos;
        let cell = table.rows[i].cells[j];
        updateCell(cell, e.detail.square);
    });
    mineField.eventTarget.addEventListener("gameOver", function(e) {
        alert("Game over!");
    })
    return table;
}

function updateCell(cell, square) {
    if (square.visited) {
        if (square.isMine) {
            cell.className = "explodedMine";
        } else {
            cell.className = `cleared mines${square.neighboringMines}`;
            cell.textContent = square.neighboringMines;
        }
    } else {
        if (square.isFlagged) {
            cell.className = "flagged";
        } else {
            cell.className = "";
        }
    }
}



let mineField = new MineField(10, 20, 30);
let table = createField(mineField);
let body = document.getElementsByTagName("body")[0];
body.appendChild(table);
