/**
 * Holds the (logical) x- and y-coordinates on the Grid and operates on neighbor cells.
 */
class Cell
{
    // PRIVATE MEMBERS
    private readonly _x: number;
    private readonly _y: number;

    // CTORS AND FACTORIES
    constructor(x: number, y: number)
    {
        this._x = x;
        this._y = y;
    }    
    public static fromIndex(hashIndex: string): Cell
    {
        const coords = hashIndex.split("|");
        return new Cell(Number(coords[0]), Number(coords[1]));
    }

    // PROPERTIES
    public get x(): number
    {
        return this._x;
    }
    public get y(): number
    {
        return this._y;
    }
    public get neighbors(): Array<Cell>
    {
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
    }
    public get leftNeighbor(): Cell
    {
        return new Cell(this.x - 1, this.y);
    }
    public get upperLeftNeighbor(): Cell
    {
        return new Cell(this.x - 1, this.y - 1);
    }
    public get topNeighbor(): Cell
    {
        return new Cell(this.x, this.y - 1);
    }
    public get upperRightNeighbor(): Cell
    {
        return new Cell(this.x + 1, this.y - 1);
    }
    public get rightNeighbor(): Cell
    {
        return new Cell(this.x + 1, this.y);
    }
    public get lowerRightNeighbor(): Cell
    {
        return new Cell(this.x + 1, this.y + 1);
    }
    public get bottomNeighbor(): Cell
    {
        return new Cell(this.x, this.y + 1);
    }
    public get lowerLeftNeighbor(): Cell
    {
        return new Cell(this.x - 1, this.y + 1);
    }

    // PUBLIC METHODS
    public toString(): string
    {
        return `${this.x}|${this.y}`;
    }
}

/**
 * Manages the (logical) state of cells and keeps track of these.
 */
class Grid
{
    // PRIVATE MEMBERS
    private readonly _size: number;
    private _indicesOfLivingCells: {};

    // CTORS
    constructor(size: number)
    {
        this._size = size;
        this.clear();
    }

    // PROPERTIES
    public get size(): number
    {
        return this._size;
    }
    public get livingCells(): Array<Cell>
    {
        const livingCells = Array<Cell>();

        for(const index in this._indicesOfLivingCells)
        {
            if(this._indicesOfLivingCells.hasOwnProperty(index))
            {
                const cell = Cell.fromIndex(index);
                livingCells.push(cell);
            }
        }

        return livingCells;
    }

    // PUBLIC METHODS
    public clear()
    {
        this._indicesOfLivingCells = {};
    }
    public makeAlive(cell: Cell)
    {
        this.setCell(cell, true);
    }
    public makeAliveMany(cells: Array<Cell>)
    {
        for(let index = 0; index < cells.length; index++)
        {
            const coord = cells[index];
            this.makeAlive(coord);
        }
    }
    public makeAliveAt(x: number, y: number)
    {
        this.makeAlive(new Cell(x, y))
    }
    public makeDead(cell: Cell)
    {
        this.setCell(cell, false);
    }
    public makeDeadAt(x: number, y: number)
    {
        this.makeDead(new Cell(x, y));
    }
    public isAlive(cell: Cell)
    {
        const index = cell.toString();
        return this._indicesOfLivingCells.hasOwnProperty(index);
    }
    public getNeighbors(cell: Cell): Array<Cell>
    {
        const neighbors = Array<Cell>();
        const possibleNeighbors = cell.neighbors;

        for(let index = 0; index < possibleNeighbors.length; index++)
        {
            const possibleNeighbor = possibleNeighbors[index];

            if (this.isWithinBounds(possibleNeighbor))
            {
                neighbors.push(possibleNeighbor);
            }
        }

        return neighbors;
    }
    public countLivingNeighbors(cell: Cell): number
    {
        const neighbors = this.getNeighbors(cell);
        const aliveNeighbors = neighbors.filter(n => this.isAlive(n));

        return aliveNeighbors.length;
    }
    private setCell(cell: Cell, makeAlive: boolean)
    {
        if(!this.isWithinBounds(cell))
        {
            throw new Error("Coords out of bounds.");
        }

        // already set?
        if(this.isAlive(cell) == makeAlive)
        {
            return;
        }

        const index = cell.toString();

        if(makeAlive)
        {
            this._indicesOfLivingCells[index] = null;
        }
        else
        {
            delete this._indicesOfLivingCells[index];
        }
    }
    public isWithinBounds(cell: Cell): boolean
    {
        return cell.x >= 0 
            && cell.y >= 0
            && cell.x < this.size
            && cell.y < this.size;
    }
    public collectLivingCellsAndTheirFringeCells(): Array<Cell>
    {
        const currentlyLivingCells = this.livingCells;

        // get dead neighbor cells of living cells
        const deadNeighborCells = Array<Cell>();

        for (let index = 0; index < currentlyLivingCells.length; index++)
        {
            const livingCell = currentlyLivingCells[index];
            const deadNeighborsOfLiveCell = livingCell.neighbors.filter(n => this.isWithinBounds(n) && !this.isAlive(n));

            deadNeighborsOfLiveCell.forEach(n => {
                deadNeighborCells.push(n);
            });
        }

        return currentlyLivingCells.concat(deadNeighborCells);
    }
}

/**
 * Manages the state of the game, i.e. takes care of initialization, turn-based action and reinitialization.
 * Serves as the composition root for all collaborating classes.
 */
class GameOfLife
{
    // PRIVATE MEMBERS
    private readonly _canvas: UniformGridCanvas;
    private _currentGrid: Grid;
    private _turn = 0;

    // CTORS
    constructor(canvas: UniformGridCanvas, gridSize: number)
    {
        this._canvas = canvas;
        this._currentGrid = new Grid(gridSize);
    }

    // PROPERTIES
    public get turn(): number
    {
        return this._turn;
    }

    // PUBLIC METHODS
    public restart()
    {
        this._canvas.clear();
        this._currentGrid.clear();

        this.initRandomCells();
        //this.initBlinker();
        //this.initTenCellRow();

        this.paint();
    }
    public next()
    {
        this._turn++;
        this._currentGrid = this.calculateNextGrid();
        this.paint();
    }
    
    // PRIVATE METHODS
    private calculateNextGrid(): Grid
    {
        var nextGrid = new Grid(this._currentGrid.size);

        // calculate fate of relevant cells
        var relevantCells = this._currentGrid.collectLivingCellsAndTheirFringeCells();
        var filterLivingCellsForNextTurn = relevantCells.filter(c => GameOfLifeRules.willBeAliveNextTurn(c, this._currentGrid));
        nextGrid.makeAliveMany(filterLivingCellsForNextTurn);

        return nextGrid;
    }
    private paint()
    {
        this._canvas.paintGrid(this._currentGrid);
    }
    private initBlinker()
    {
        this._currentGrid.makeAliveAt(30, 50);
        this._currentGrid.makeAliveAt(31, 50);
        this._currentGrid.makeAliveAt(32, 50);
    }
    private initRandomCells()
    {
        const max = this._currentGrid.size;
        const cellsToCreate = RandomNumberGenerator.get(0, max * max);

        for(let i = 0; i < cellsToCreate; i++)
        {
            const rndX = RandomNumberGenerator.get(0, max);
            const rndY = RandomNumberGenerator.get(0, max);
            this._currentGrid.makeAlive(new Cell(rndX, rndY));
        }
    }
}

/**
 * Stores the GoL rules and lets Cells and Grids operate on these.
 */
class GameOfLifeRules {
    static willBeAliveNextTurn(cell: Cell, currentGrid: Grid): boolean
    {
        const isAlive = currentGrid.isAlive(cell);
        const countLivingNeighbors = currentGrid.countLivingNeighbors(cell);

        // Any live cell with fewer than two live neighbours dies, as if caused by under-population.
        if(isAlive && countLivingNeighbors < 2)
        {
            return false;
        }

        // Any live cell with two or three live neighbours lives on to the next generation.
        if(isAlive && (countLivingNeighbors == 2 || countLivingNeighbors == 3))
        {
            return true;
        }

        // Any live cell with more than three live neighbours dies, as if by over-population.
        if(isAlive && countLivingNeighbors > 3)
        {
            return false;
        }

        // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if(!isAlive && countLivingNeighbors == 3)
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
    static get(min: number, max: number): number
    {
        return Math.floor((Math.random() * max) + min);
    }
}

/**
 * Takes care of visualizing our logical Grid, i.e. paints the logical Grid onto the HTHML canvas.
 */
// TODO: separate logic into handlers for visual coordinates and logical ones
class UniformGridCanvas {
    // PRIVATE MEMBERS
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _cellSizeInPixels: number;
    private _defaultFillStyle = "#222";

    // CTORS
    constructor(canvas: HTMLCanvasElement,
        cellSizeInPixels: number = 10)
    {
        this._canvas = canvas;
        this._context = canvas.getContext("2d");
        this._cellSizeInPixels = cellSizeInPixels;
    }

    // PUBLIC METHODS
    public paintGrid(grid: Grid)
    {
        this.clear();

        const livingCells = grid.livingCells;

        for (let index in livingCells)
        {
            if (!livingCells.hasOwnProperty(index))
            {
                continue;
            }

            const cells = livingCells[index];
            this.paintCell(cells);
        }
    }
    public clear()
    {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    public resizeToWindowBounds()
    {
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
    }

    // PRIVATE METHODS
    private paintCell(cell: Cell)
    {
        this._context.fillStyle = this._defaultFillStyle;
        this._context.fillRect(cell.x * this._cellSizeInPixels, cell.y * this._cellSizeInPixels, this._cellSizeInPixels, this._cellSizeInPixels);
    }
}

const cellSizeInPixels = 10;
const gridSizeInCells = 100;

const canvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const grid = new UniformGridCanvas(canvasElement, cellSizeInPixels);
const game = new GameOfLife(grid, gridSizeInCells);

game.restart();

setInterval(() => { 
    game.next(); 
}, 200);