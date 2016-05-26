/**
 * Holds the (logical) x- and y-coordinates on the Grid and operates on neighbor cells.
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
 * Manages the (logical) state of cells and keeps track of these.
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
            var livingCells = Array();
            for (var index in this._indicesOfLivingCells) {
                if (this._indicesOfLivingCells.hasOwnProperty(index)) {
                    var cell = Cell.fromIndex(index);
                    livingCells.push(cell);
                }
            }
            return livingCells;
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
    Grid.prototype.countLivingNeighbors = function (cell) {
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
    Grid.prototype.collectLivingCellsAndTheirFringeCells = function () {
        var _this = this;
        var currentlyLivingCells = this.livingCells;
        // get dead neighbor cells of living cells
        var deadNeighborCells = Array();
        for (var index = 0; index < currentlyLivingCells.length; index++) {
            var aliveCell = currentlyLivingCells[index];
            var deadNeighborsOfLiveCell = aliveCell.neighbors.filter(function (n) { return _this.isWithinBounds(n) && !_this.isAlive(n); });
            deadNeighborsOfLiveCell.forEach(function (n) {
                deadNeighborCells.push(n);
            });
        }
        return currentlyLivingCells.concat(deadNeighborCells);
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
    Object.defineProperty(GameOfLife.prototype, "turn", {
        // PROPERTIES
        get: function () {
            return this._turn;
        },
        enumerable: true,
        configurable: true
    });
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
        this._turn++;
        var nextGrid = new Grid(this._grid.size);
        // calculate fate of relevant cells
        var relevantCells = this._grid.collectLivingCellsAndTheirFringeCells();
        var filterLivingCellsForNextTurn = relevantCells.filter(function (c) { return GameOfLifeRules.willBeAliveNextTurn(c, _this._grid); });
        nextGrid.makeAliveMany(filterLivingCellsForNextTurn);
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
    GameOfLifeRules.willBeAliveNextTurn = function (cell, currentGrid) {
        var isAlive = currentGrid.isAlive(cell);
        var countLivingNeighbors = currentGrid.countLivingNeighbors(cell);
        // Any live cell with fewer than two live neighbours dies, as if caused by under-population.
        if (isAlive && countLivingNeighbors < 2) {
            return false;
        }
        // Any live cell with two or three live neighbours lives on to the next generation.
        if (isAlive && (countLivingNeighbors == 2 || countLivingNeighbors == 3)) {
            return true;
        }
        // Any live cell with more than three live neighbours dies, as if by over-population.
        if (isAlive && countLivingNeighbors > 3) {
            return false;
        }
        // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if (!isAlive && countLivingNeighbors == 3) {
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
 * Takes care of visualizing our logical Grid, i.e. paints the logical Grid onto the HTHML canvas.
 */
// TODO: separate logic into handlers for visual coordinates and logical ones
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
        var livingCells = grid.livingCells;
        for (var index in livingCells) {
            if (!livingCells.hasOwnProperty(index)) {
                continue;
            }
            var cells = livingCells[index];
            this.paintCell(cells);
        }
    };
    UniformGridCanvas.prototype.paintCell = function (cell) {
        this._context.fillStyle = this._defaultFillStyle;
        this._context.fillRect(cell.x * this._cellSizeInPixels, cell.y * this._cellSizeInPixels, this._cellSizeInPixels, this._cellSizeInPixels);
    };
    UniformGridCanvas.prototype.clearCell = function (cell) {
        this._context.clearRect(cell.x * this._cellSizeInPixels, cell.y * this._cellSizeInPixels, this._cellSizeInPixels, this._cellSizeInPixels);
    };
    UniformGridCanvas.prototype.clear = function () {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    // PRIVATE METHODS
    UniformGridCanvas.prototype.getVisualCellOfLogicalCoords = function (x, y) {
        return new Cell(this._cellSizeInPixels * x, this._cellSizeInPixels * y);
    };
    return UniformGridCanvas;
}());
var canvasElement = document.getElementById("canvas");
var canvas = new UniformGridCanvas(canvasElement, 6);
var game = new GameOfLife(canvas, 100);
//# sourceMappingURL=gol.js.map