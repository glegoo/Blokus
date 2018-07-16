import { GameDefine, BlockCheckResult } from "./GameDefine";

export class Grid {

    private static _size: number = 0;
    private _grid: Array<number> = null;

    constructor(size: number) {
        Grid._size = size;
        this._grid = new Array(size * size);
    }

    getBlock(x: number, y: number): number {
        let index = x + y * Grid._size;
        if (index < Math.pow(Grid._size, 2)) {
            return this._grid[index];
        }
        return null;
    }

    setBlock(x: number, y: number, type: number) {
        let index = x + y * Grid._size;
        if (index < Math.pow(Grid._size, 2)) {
            this._grid[index] = type;
        }
    }

    blockCheck(coord: cc.Vec2, seat: number): BlockCheckResult {
        let jiao = false;
        for (let i = -1; i <= 1; ++i) {
            for (let j = -1; j <= 1; ++j) {
                if (i === 0 && j === 0) {
                    continue;
                }
                // 被占了
                if (this.getBlock(coord.x, coord.y) !== undefined) {
                    return BlockCheckResult.NotEmpty;
                }
                
                let x = coord.x + i, y = coord.y + j;
                if (this.getBlock(x, y) == seat) {
                    if (i * j === 0) {
                        // 边了
                        return BlockCheckResult.Edge;
                    } else {
                        // 角了
                        jiao = true;
                    }
                }
            }
        }
        return jiao ? BlockCheckResult.Conner : BlockCheckResult.OK;
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