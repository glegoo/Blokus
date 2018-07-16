export abstract class GameDefine {
    static ZOOM_SCALE: number = 1.25;
    static BLOCK_SIZE_PIXEL: number = 44;           // 每个block单边像素
}

export enum BlockCheckResult {
    NotEmpty,
    Edge,
    OK,
    Conner
}