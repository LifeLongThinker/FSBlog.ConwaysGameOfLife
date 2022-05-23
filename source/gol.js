/**
 * Holds the (logical) x- and y-coordinates on the Grid and operates on neighbor cells.
 */
var Cell = /** @class */ (function () {
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "y", {
        get: function () {
            return this._y;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "neighbors", {
        get: function () {
            return [
                this.leftNeighbor,
                this.upperLeftNeighbor,
                this.topNeighbor,
                this.upperRightNeighbor,
                this.rightNeighbor,
                this.lowerRightNeighbor,
                this.bottomNeighbor,
                this.lowerLeftNeighbor
            ];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "leftNeighbor", {
        get: function () {
            return new Cell(this.x - 1, this.y);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "upperLeftNeighbor", {
        get: function () {
            return new Cell(this.x - 1, this.y - 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "topNeighbor", {
        get: function () {
            return new Cell(this.x, this.y - 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "upperRightNeighbor", {
        get: function () {
            return new Cell(this.x + 1, this.y - 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "rightNeighbor", {
        get: function () {
            return new Cell(this.x + 1, this.y);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "lowerRightNeighbor", {
        get: function () {
            return new Cell(this.x + 1, this.y + 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "bottomNeighbor", {
        get: function () {
            return new Cell(this.x, this.y + 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "lowerLeftNeighbor", {
        get: function () {
            return new Cell(this.x - 1, this.y + 1);
        },
        enumerable: false,
        configurable: true
    });
    // PUBLIC METHODS
    Cell.prototype.toString = function () {
        return "".concat(this.x, "|").concat(this.y);
    };
    return Cell;
}());
/**
 * Manages the (logical) state of cells and keeps track of these.
 */
var Grid = /** @class */ (function () {
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
        enumerable: false,
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
        enumerable: false,
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
        return cell.x >= 0
            && cell.y >= 0
            && cell.x < this.size
            && cell.y < this.size;
    };
    Grid.prototype.collectLivingCellsAndTheirFringeCells = function () {
        var _this = this;
        var currentlyLivingCells = this.livingCells;
        // get dead neighbor cells of living cells
        var deadNeighborCells = Array();
        for (var index = 0; index < currentlyLivingCells.length; index++) {
            var livingCell = currentlyLivingCells[index];
            var deadNeighborsOfLiveCell = livingCell.neighbors.filter(function (n) { return _this.isWithinBounds(n) && !_this.isAlive(n); });
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
var GameOfLife = /** @class */ (function () {
    // CTORS
    function GameOfLife(canvas, gridSize) {
        this._turn = 0;
        this._canvas = canvas;
        this._currentGrid = new Grid(gridSize);
    }
    Object.defineProperty(GameOfLife.prototype, "turn", {
        // PROPERTIES
        get: function () {
            return this._turn;
        },
        enumerable: false,
        configurable: true
    });
    // PUBLIC METHODS
    GameOfLife.prototype.restart = function () {
        this._canvas.clear();
        this._currentGrid.clear();
        this.initRandomCells();
        //this.initBlinker();
        //this.initTenCellRow();
        this.paint();
    };
    GameOfLife.prototype.next = function () {
        this._turn++;
        this._currentGrid = this.calculateNextGrid();
        this.paint();
    };
    // PRIVATE METHODS
    GameOfLife.prototype.calculateNextGrid = function () {
        var _this = this;
        var nextGrid = new Grid(this._currentGrid.size);
        // calculate fate of relevant cells
        var relevantCells = this._currentGrid.collectLivingCellsAndTheirFringeCells();
        var filterLivingCellsForNextTurn = relevantCells.filter(function (c) { return GameOfLifeRules.willBeAliveNextTurn(c, _this._currentGrid); });
        nextGrid.makeAliveMany(filterLivingCellsForNextTurn);
        return nextGrid;
    };
    GameOfLife.prototype.paint = function () {
        this._canvas.paintGrid(this._currentGrid);
    };
    GameOfLife.prototype.initBlinker = function () {
        this._currentGrid.makeAliveAt(30, 50);
        this._currentGrid.makeAliveAt(31, 50);
        this._currentGrid.makeAliveAt(32, 50);
    };
    GameOfLife.prototype.initRandomCells = function () {
        var max = this._currentGrid.size;
        var cellsToCreate = RandomNumberGenerator.get(0, max * max);
        for (var i = 0; i < cellsToCreate; i++) {
            var rndX = RandomNumberGenerator.get(0, max);
            var rndY = RandomNumberGenerator.get(0, max);
            this._currentGrid.makeAlive(new Cell(rndX, rndY));
        }
    };
    return GameOfLife;
}());
/**
 * Stores the GoL rules and lets Cells and Grids operate on these.
 */
var GameOfLifeRules = /** @class */ (function () {
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
var RandomNumberGenerator = /** @class */ (function () {
    function RandomNumberGenerator() {
    }
    RandomNumberGenerator.get = function (min, max) {
        return Math.floor((Math.random() * max) + min);
    };
    return RandomNumberGenerator;
}());
/**
 * Takes care of visualizing our logical Grid, i.e. paints the logical Grid onto the HTHML canvas.
 */
// TODO: separate logic into handlers for visual coordinates and logical ones
var UniformGridCanvas = /** @class */ (function () {
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
    UniformGridCanvas.prototype.clear = function () {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    UniformGridCanvas.prototype.resizeToWindowBounds = function () {
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
    };
    // PRIVATE METHODS
    UniformGridCanvas.prototype.paintCell = function (cell) {
        this._context.fillStyle = this._defaultFillStyle;
        this._context.fillRect(cell.x * this._cellSizeInPixels, cell.y * this._cellSizeInPixels, this._cellSizeInPixels, this._cellSizeInPixels);
    };
    return UniformGridCanvas;
}());
var cellSizeInPixels = 10;
var gridSizeInCells = 100;
var canvasElement = document.getElementById("canvas");
var grid = new UniformGridCanvas(canvasElement, cellSizeInPixels);
var game = new GameOfLife(grid, gridSizeInCells);
game.restart();
setInterval(function () {
    game.next();
}, 200);
//# sourceMappingURL=gol.js.map