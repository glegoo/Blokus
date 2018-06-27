import { BlockType, GameDefine } from "./GameDefine";

export class Grid {

    private static _size: number = 0;
    private _grid: Array<BlockType> = null;

    constructor(size: number) {
        Grid._size = size;
        this._grid = new Array(size * size);
    }

    getBlock(x: number, y: number): BlockType {
        let index = x + y * Grid._size;
        if (index < Math.pow(Grid._size, 2)) {
            return this._grid[index];
        }
        return null;
    }

    setBlock(x: number, y: number, type: BlockType) {
        let index = x + y * Grid._size;
        if (index < Math.pow(Grid._size, 2)) {
            this._grid[index] = type;
        }
    }

    static getPosition(x: number, y: number): cc.Vec2 {
        return new cc.Vec2((x + 0.5) * GameDefine.BLOCK_SIZE_PIXEL, (y + 0.5) * GameDefine.BLOCK_SIZE_PIXEL);
    }

    static getCoord(pos: cc.Vec2): cc.Vec2 {
        let x = Math.floor(pos.x / GameDefine.BLOCK_SIZE_PIXEL);
        x = Math.min(x, Grid._size - 1);
        x = Math.max(x, 0);
        let y = Math.floor(pos.y / GameDefine.BLOCK_SIZE_PIXEL);
        y = Math.min(y, Grid._size - 1);
        y = Math.max(y, 0);
        return new cc.Vec2(x, y);
    }

    static getNearestGridPos(pos: cc.Vec2): cc.Vec2 {
        let coord = Grid.getCoord(pos);
        return Grid.getPosition(coord.x, coord.y)
    }
}