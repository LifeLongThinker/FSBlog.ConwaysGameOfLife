/**
 * Holds the x- and y-coordinates on the Grid and operates on neighbor cells.
 */
var Cell = (function () {
    // CTORS AND FACTORIES
    function Cell(x, y) {
        this._x = x;
        this._y = y;
    }
    Cell.fromIndex = function (hashIndex) {
        var coords = hashIndex.split("|");
        return new Cell(Number(coords[0]), Number(coords[1]));
    };
    Object.defineProperty(Cell.prototype, "x", {
        // PROPERTIES
        get: function () {
            return this._x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "y", {
        get: function () {
            return this._y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "neighbors", {
        get: function () {
            return [this.leftNeighbor, this.upperLeftNeighbor, this.topNeighbor, this.upperRightNeighbor, this.rightNeighbor, this.lowerRightNeighbor, this.bottomNeighbor, this.lowerLeftNeighbor];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "leftNeighbor", {
        // PROPERTIES
        get: function () {
            return new Cell(this.x - 1, this.y);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "upperLeftNeighbor", {
        get: function () {
            return new Cell(this.x - 1, this.y - 1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "topNeighbor", {
        get: function () {
            return new Cell(this.x, this.y - 1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "upperRightNeighbor", {
        get: function () {
            return new Cell(this.x + 1, this.y - 1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "rightNeighbor", {
        get: function () {
            return new Cell(this.x + 1, this.y);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "lowerRightNeighbor", {
        get: function () {
            return new Cell(this.x + 1, this.y + 1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "bottomNeighbor", {
        get: function () {
            return new Cell(this.x, this.y + 1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "lowerLeftNeighbor", {
        get: function () {
            return new Cell(this.x - 1, this.y + 1);
        },
        enumerable: true,
        configurable: true
    });
    // PUBLIC METHODS
    Cell.prototype.toString = function () {
        return this.x + "|" + this.y;
    };
    return Cell;
}());
/**
 * Manages the state of cells and keeps track of these.
 */
var Grid = (function () {
    // CTORS
    function Grid(size) {
        this._size = size;
        this.clear();
    }
    Object.defineProperty(Grid.prototype, "size", {
        // PROPERTIES
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Grid.prototype, "livingCells", {
        get: function () {
            var aliveCells = Array();
            for (var index in this._indicesOfLivingCells) {
                if (this._indicesOfLivingCells.hasOwnProperty(index)) {
                    var coords = Cell.fromIndex(index);
                    aliveCells.push(coords);
                }
            }
            return aliveCells;
        },
        enumerable: true,
        configurable: true
    });
    // PUBLIC METHODS
    Grid.prototype.clear = function () {
        this._indicesOfLivingCells = {};
    };
    Grid.prototype.makeAlive = function (cell) {
        this.setCell(cell, true);
    };
    Grid.prototype.makeAliveMany = function (cells) {
        for (var index = 0; index < cells.length; index++) {
            var coord = cells[index];
            this.makeAlive(coord);
        }
    };
    Grid.prototype.makeAliveAt = function (x, y) {
        this.makeAlive(new Cell(x, y));
    };
    Grid.prototype.makeDead = function (cell) {
        this.setCell(cell, false);
    };
    Grid.prototype.makeDeadAt = function (x, y) {
        this.makeDead(new Cell(x, y));
    };
    Grid.prototype.isAlive = function (cell) {
        var index = cell.toString();
        return this._indicesOfLivingCells.hasOwnProperty(index);
    };
    Grid.prototype.getNeighbors = function (cell) {
        var neighbors = Array();
        var possibleNeighbors = cell.neighbors;
        for (var index = 0; index < possibleNeighbors.length; index++) {
            var possibleNeighbor = possibleNeighbors[index];
            if (this.isWithinBounds(possibleNeighbor)) {
                neighbors.push(possibleNeighbor);
            }
        }
        return neighbors;
    };
    Grid.prototype.countLiveNeighbors = function (cell) {
        var _this = this;
        var neighbors = this.getNeighbors(cell);
        var aliveNeighbors = neighbors.filter(function (n) { return _this.isAlive(n); });
        return aliveNeighbors.length;
    };
    Grid.prototype.setCell = function (cell, makeAlive) {
        if (!this.isWithinBounds(cell)) {
            throw new Error("Coords out of bounds.");
        }
        // already set?
        if (this.isAlive(cell) == makeAlive) {
            return;
        }
        var index = cell.toString();
        if (makeAlive) {
            this._indicesOfLivingCells[index] = null;
        }
        else {
            delete this._indicesOfLivingCells[index];
        }
    };
    Grid.prototype.isWithinBounds = function (cell) {
        return cell.x >= 0 && cell.y >= 0 && cell.x < this.size && cell.y < this.size;
    };
    return Grid;
}());
/**
 * Manages the state of the game, i.e. takes care of initialization, turn-based action and reinitialization.
 * Serves as the composition root for all collaborating classes.
 */
var GameOfLife = (function () {
    // CTORS
    function GameOfLife(canvas, gridSize) {
        this._turn = 0;
        this._canvas = canvas;
        this._grid = new Grid(gridSize);
    }
    // PUBLIC METHODS
    GameOfLife.prototype.restart = function () {
        this._canvas.clear();
        this._grid.clear();
        // this.initRandomCells();
        // this.initBlinker();
        this.initTenCellRow();
        this.paint();
    };
    GameOfLife.prototype.next = function () {
        var _this = this;
        // create next grid
        var nextGrid = new Grid(this._grid.size);
        // get alive cells
        var aliveCells = this._grid.livingCells;
        // get dead neighbor cells of alive cells
        var deadNeighborCells = Array();
        for (var index = 0; index < aliveCells.length; index++) {
            var aliveCell = aliveCells[index];
            var deadNeighborsOfLiveCell = aliveCell.neighbors.filter(function (n) { return _this._grid.isWithinBounds(n) && !_this._grid.isAlive(n); });
            deadNeighborsOfLiveCell.forEach(function (n) {
                deadNeighborCells.push(n);
            });
        }
        // calculate fate of relevant cells
        var relevantCells = aliveCells.concat(deadNeighborCells);
        var nextLiveCells = relevantCells.filter(function (c) { return GameOfLifeRules.willBeAliveNextTurn(c, _this._grid); });
        nextGrid.makeAliveMany(nextLiveCells);
        this._grid = nextGrid;
        this.paint();
    };
    // PRIVATE METHODS
    GameOfLife.prototype.paint = function () {
        this._canvas.paintGrid(this._grid);
    };
    GameOfLife.prototype.initBlinker = function () {
        this._grid.makeAliveAt(30, 50);
        this._grid.makeAliveAt(31, 50);
        this._grid.makeAliveAt(32, 50);
    };
    GameOfLife.prototype.initRandomCells = function () {
        var max = this._grid.size;
        var cellsToCreate = RandomNumberGenerator.get(0, max * max);
        for (var i = 0; i < cellsToCreate; i++) {
            var rndX = RandomNumberGenerator.get(0, max);
            var rndY = RandomNumberGenerator.get(0, max);
            this._grid.makeAlive(new Cell(rndX, rndY));
        }
    };
    GameOfLife.prototype.initTenCellRow = function () {
        var cell = new Cell(20, 20);
        this._grid.makeAlive(cell);
        for (var i = 0; i < 9; i++) {
            var cell = cell.rightNeighbor;
            this._grid.makeAlive(cell);
        }
    };
    return GameOfLife;
}());
/**
 * Stores the GoL rules and lets Cells and Grids operate on these.
 */
var GameOfLifeRules = (function () {
    function GameOfLifeRules() {
    }
    GameOfLifeRules.willBeAliveNextTurn = function (coords, currentGrid) {
        var isAlive = currentGrid.isAlive(coords);
        var countLiveNeighbors = currentGrid.countLiveNeighbors(coords);
        // Any live cell with fewer than two live neighbours dies, as if caused by under-population.
        if (isAlive && countLiveNeighbors < 2) {
            return false;
        }
        // Any live cell with two or three live neighbours lives on to the next generation.
        if (isAlive && (countLiveNeighbors == 2 || countLiveNeighbors == 3)) {
            return true;
        }
        // Any live cell with more than three live neighbours dies, as if by over-population.
        if (isAlive && countLiveNeighbors > 3) {
            return false;
        }
        // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if (!isAlive && countLiveNeighbors == 3) {
            return true;
        }
        return isAlive;
    };
    return GameOfLifeRules;
}());
/**
 * A very simple random number generator.
 */
var RandomNumberGenerator = (function () {
    function RandomNumberGenerator() {
    }
    RandomNumberGenerator.get = function (min, max) {
        return Number(Math.floor((Math.random() * max) + min));
    };
    return RandomNumberGenerator;
}());
/**
 * Takes care of visualizing our Grid, i.e. paints the In-Memory Grid onto the HTHML canvas.
 */
var UniformGridCanvas = (function () {
    // CTORS
    function UniformGridCanvas(canvas, cellSizeInPixels) {
        if (cellSizeInPixels === void 0) { cellSizeInPixels = 10; }
        this._defaultFillStyle = "#222";
        this._canvas = canvas;
        this._context = canvas.getContext("2d");
        this._cellSizeInPixels = cellSizeInPixels;
    }
    // PUBLIC METHODS
    UniformGridCanvas.prototype.paintGrid = function (grid) {
        this.clear();
        var aliveCellCoords = grid.livingCells;
        for (var index in aliveCellCoords) {
            if (!aliveCellCoords.hasOwnProperty(index)) {
                continue;
            }
            var coords = aliveCellCoords[index];
            this.paintCell(coords);
        }
    };
    UniformGridCanvas.prototype.paintCell = function (coords) {
        this._context.fillStyle = this._defaultFillStyle;
        this._context.fillRect(coords.x * this._cellSizeInPixels, coords.y * this._cellSizeInPixels, this._cellSizeInPixels, this._cellSizeInPixels);
    };
    UniformGridCanvas.prototype.clearCell = function (coords) {
        this._context.clearRect(coords.x * this._cellSizeInPixels, coords.y * this._cellSizeInPixels, this._cellSizeInPixels, this._cellSizeInPixels);
    };
    UniformGridCanvas.prototype.clear = function () {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    // PRIVATE METHODS
    UniformGridCanvas.prototype.getCoordsOfCell = function (x, y) {
        return new Cell(this._cellSizeInPixels * x, this._cellSizeInPixels * y);
    };
    return UniformGridCanvas;
}());
var canvasElement = document.getElementById("canvas");
var canvas = new UniformGridCanvas(canvasElement, 6);
var game = new GameOfLife(canvas, 100);
//# sourceMappingURL=gol.js.map