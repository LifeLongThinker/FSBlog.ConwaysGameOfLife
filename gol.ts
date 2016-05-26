/**
 * Holds the x- and y-coordinates on the Grid and operates on neighbor cells.
 */
class Cell
{
    // PRIVATE MEMBERS
    private _x: number;
    private _y: number;

    // CTORS AND FACTORIES
    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }    
    public static fromIndex(hashIndex: string): Cell {
        var coords = hashIndex.split("|");
        return new Cell(Number(coords[0]), Number(coords[1]));
    }

    // PROPERTIES
    public get x(): number {
        return this._x;
    }
    public get y(): number {
        return this._y;
    }
    public get neighbors(): Array<Cell> {
        return [this.leftNeighbor, this.upperLeftNeighbor, this.topNeighbor, this.upperRightNeighbor, this.rightNeighbor, this.lowerRightNeighbor, this.bottomNeighbor, this.lowerLeftNeighbor];
    }

    // PROPERTIES
    public get leftNeighbor(): Cell {
        return new Cell(this.x - 1, this.y);
    }
    public get upperLeftNeighbor(): Cell {
        return new Cell(this.x - 1, this.y - 1);
    }
    public get topNeighbor(): Cell {
        return new Cell(this.x, this.y - 1);
    }
    public get upperRightNeighbor(): Cell {
        return new Cell(this.x + 1, this.y - 1);
    }
    public get rightNeighbor(): Cell {
        return new Cell(this.x + 1, this.y);
    }
    public get lowerRightNeighbor(): Cell {
        return new Cell(this.x + 1, this.y + 1);
    }
    public get bottomNeighbor(): Cell {
        return new Cell(this.x, this.y + 1);
    }
    public get lowerLeftNeighbor(): Cell {
        return new Cell(this.x - 1, this.y + 1);
    }

    // PUBLIC METHODS
    public toString(): string {
        return `${this.x}|${this.y}`;
    }
}

/**
 * Manages the state of cells and keeps track of these.
 */
class Grid
{
    // PRIVATE MEMBERS
    private _size: number;
    private _indicesOfLivingCells: {};

    // CTORS
    constructor(size: number) {
        this._size = size;
        this.clear();
    }

    // PROPERTIES
    public get size(): number {
        return this._size;
    }
    public get livingCells(): Array<Cell> {
        var aliveCells = Array<Cell>();

        for(var index in this._indicesOfLivingCells)
        {
            if(this._indicesOfLivingCells.hasOwnProperty(index))
            {
                var coords = Cell.fromIndex(index);
                aliveCells.push(coords);
            }
        }

        return aliveCells;
    }

    // PUBLIC METHODS
    public clear() {
        this._indicesOfLivingCells = {};
    }
    public makeAlive(cell: Cell) {
        this.setCell(cell, true);
    }
    public makeAliveMany(cells: Array<Cell>) {
        for(var index = 0; index < cells.length; index++)
        {
            var coord = cells[index];
            this.makeAlive(coord);
        }
    }
    public makeAliveAt(x: number, y: number) {
        this.makeAlive(new Cell(x, y))
    }
    public makeDead(cell: Cell) {
        this.setCell(cell, false);
    }
    public makeDeadAt(x: number, y: number) {
        this.makeDead(new Cell(x, y));
    }
    public isAlive(cell: Cell) {
        var index = cell.toString();
        return this._indicesOfLivingCells.hasOwnProperty(index);
    }
    public getNeighbors(cell: Cell): Array<Cell> {
        var neighbors = Array<Cell>();

        var possibleNeighbors = cell.neighbors;
        for(var index = 0; index < possibleNeighbors.length; index++)
        {
            var possibleNeighbor = possibleNeighbors[index];

            if (this.isWithinBounds(possibleNeighbor))
            {
                neighbors.push(possibleNeighbor);
            }
        }

        return neighbors;
    }
    public countLiveNeighbors(cell: Cell): number {
        var neighbors = this.getNeighbors(cell);
        var aliveNeighbors = neighbors.filter(n => this.isAlive(n));
        return aliveNeighbors.length;
    }
    private setCell(cell: Cell, makeAlive: boolean) {
        if(!this.isWithinBounds(cell))
        {
            throw new Error("Coords out of bounds.");
        }

        // already set?
        if(this.isAlive(cell) == makeAlive)
        {
            return;
        }

        var index = cell.toString();

        if(makeAlive)
        {
            this._indicesOfLivingCells[index] = null;
        }
        else
        {
            delete this._indicesOfLivingCells[index];
        }
    }
    public isWithinBounds(cell: Cell): boolean {
        return cell.x >= 0 && cell.y >= 0 && cell.x < this.size && cell.y < this.size;
    }
}

/**
 * Manages the state of the game, i.e. takes care of initialization, turn-based action and reinitialization.
 * Serves as the composition root for all collaborating classes.
 */
class GameOfLife
{
    // PRIVATE MEMBERS
    private _canvas: UniformGridCanvas;
    private _grid: Grid;
    private _turn = 0;

    // CTORS
    constructor(canvas: UniformGridCanvas, gridSize: number)
    {
        this._canvas = canvas;
        this._grid = new Grid(gridSize);
    }

    // PUBLIC METHODS
    public restart() {
        this._canvas.clear();
        this._grid.clear();

        // this.initRandomCells();
        // this.initBlinker();
        this.initTenCellRow();

        this.paint();
    }
    public next() {
        // create next grid
        var nextGrid = new Grid(this._grid.size);

        // get alive cells
        var aliveCells = this._grid.livingCells;

        // get dead neighbor cells of alive cells
        var deadNeighborCells = Array<Cell>();
        for(var index = 0; index < aliveCells.length; index++)
        {
            var aliveCell = aliveCells[index];
            var deadNeighborsOfLiveCell = aliveCell.neighbors.filter(n => this._grid.isWithinBounds(n) && !this._grid.isAlive(n));

            deadNeighborsOfLiveCell.forEach(n => {
                deadNeighborCells.push(n);
            });
        }

        // calculate fate of relevant cells
        var relevantCells = aliveCells.concat(deadNeighborCells);
        var nextLiveCells = relevantCells.filter(c => GameOfLifeRules.willBeAliveNextTurn(c, this._grid));
        nextGrid.makeAliveMany(nextLiveCells);

        this._grid = nextGrid;
        this.paint();
    }
    
    // PRIVATE METHODS
    private paint() {
        this._canvas.paintGrid(this._grid);
    }
    private initBlinker() {
        this._grid.makeAliveAt(30, 50);
        this._grid.makeAliveAt(31, 50);
        this._grid.makeAliveAt(32, 50);
    }
    private initRandomCells() {
        var max = this._grid.size;

        var cellsToCreate = RandomNumberGenerator.get(0, max * max);
        for(var i = 0; i < cellsToCreate; i++)
        {
            var rndX = RandomNumberGenerator.get(0, max);
            var rndY = RandomNumberGenerator.get(0, max);
            this._grid.makeAlive(new Cell(rndX, rndY));
        }
    }
    private initTenCellRow() {
        var cell = new Cell(20, 20);
        this._grid.makeAlive(cell);

        for(var i = 0; i < 9; i++)
        {
            var cell = cell.rightNeighbor;
            this._grid.makeAlive(cell)
        }
    }
}

/**
 * Stores the GoL rules and lets Cells and Grids operate on these.
 */
class GameOfLifeRules {
    static willBeAliveNextTurn(coords: Cell, currentGrid: Grid): boolean {
        var isAlive = currentGrid.isAlive(coords);
        var countLiveNeighbors = currentGrid.countLiveNeighbors(coords);

        // Any live cell with fewer than two live neighbours dies, as if caused by under-population.
        if(isAlive && countLiveNeighbors < 2)
        {
            return false;
        }

        // Any live cell with two or three live neighbours lives on to the next generation.
        if(isAlive && (countLiveNeighbors == 2 || countLiveNeighbors == 3))
        {
            return true;
        }

        // Any live cell with more than three live neighbours dies, as if by over-population.
        if(isAlive && countLiveNeighbors > 3)
        {
            return false;
        }

        // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if(!isAlive && countLiveNeighbors == 3)
        {
            return true;
        }

        return isAlive;
    }
}

/**
 * A very simple random number generator.
 */
class RandomNumberGenerator {
    static get(min: number, max: number): number {
        return Number(Math.floor((Math.random() * max) + min));
    }
}

/**
 * Takes care of visualizing our Grid, i.e. paints the In-Memory Grid onto the HTHML canvas.
 */
class UniformGridCanvas {
    // PRIVATE MEMBERS
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _cellSize: number;
    private _defaultFillStyle = "#222";

    // CTORS
    constructor(canvas: HTMLCanvasElement, cellSize: number = 10) {
        this._canvas = canvas;
        this._context = canvas.getContext("2d");
        this._cellSize = cellSize;
    }

    // PUBLIC METHODS
    public paintGrid(grid: Grid) {
        this.clear();

        var aliveCellCoords = grid.livingCells;

        for (var index in aliveCellCoords) {
            if (!aliveCellCoords.hasOwnProperty(index)) {
                continue;
            }

            var coords = aliveCellCoords[index];
            this.paintCell(coords);
        }
    }
    public paintCell(coords: Cell) {
        this._context.fillStyle = this._defaultFillStyle;
        this._context.fillRect(coords.x * this._cellSize, coords.y * this._cellSize, this._cellSize, this._cellSize);
    }
    public clearCell(coords: Cell) {
        this._context.clearRect(coords.x * this._cellSize, coords.y * this._cellSize, this._cellSize, this._cellSize);
    }
    public clear() {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    // PRIVATE METHODS
    private getCoordsOfCell(x: number, y: number): Cell {
        return new Cell(this._cellSize * x, this._cellSize * y);
    }
}

var canvasElement = <HTMLCanvasElement>document.getElementById("canvas");
var canvas = new UniformGridCanvas(canvasElement);
var game = new GameOfLife(canvas, 500);