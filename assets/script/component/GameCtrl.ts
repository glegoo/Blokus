import Plate from "./Plate";
import Board from "./Board";
import Piece from "./Piece";
import UIGame from "./UIGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCtrl extends cc.Component {

    // @property(cc.Label)
    // label: cc.Label = null;

    board: Board = null;
    plate: Plate = null;
    ui: UIGame = null;
    curPiece: Piece = null;

    private static _inst: GameCtrl = null;

    static get instance() {
        return GameCtrl._inst;
    }

    onLoad() {
        GameCtrl._inst = this;
        this.plate = cc.find('Canvas/scrollview/view/content').getComponent(Plate);
        this.board = cc.find('Canvas/board').getComponent(Board);
        this.ui = this.node.getComponent(UIGame);
    }

    start() {

    }

    onPieceIntoBoard(piece: Piece) {
        this.plate.clearDragPiece(piece);
        this.board.onPieceIn(piece);
    }

    onPieceIntoPlate(piece: Piece) {
        if (piece.onDrag) {
            this.plate.onPiecePicked(piece);
        }
        this.board.onPieceLeave();
    }

    onPieceMove(piece: Piece) {
        this.plate.onPieceMove(piece);
        this.ui.showPieceCtrl(false);
    }

    onPieceDropBoard() {
        this.ui.showPieceCtrl(true, false);
    }
    // update (dt) {}
}
