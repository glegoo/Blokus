import Piece from "./Piece";
import { Grid } from "../Grid";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Board extends cc.Component {

    private _grid: Grid = null;
    private _curPiece: Piece = null;

    onLoad() {
        this._grid = new Grid(14);
    }

    start() {

    }

    // piece 进入board
    onPieceIn(piece: Piece) {
        if (this._curPiece) {
            this._curPiece.backToPlate();
        }
        this._curPiece = piece;
    }

    onPieceLeave() {
        this._curPiece = null;
    }

    // update (dt) {}
}
