import Piece from "./Piece";
import { Grid } from "../Grid";
import UIGame from "./UIGame";
import { Utils } from "../Utils";
import GameCtrl from "./GameCtrl";
import { BlockCheckResult } from "../GameDefine";
import { GameClient } from "../GameClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Board extends cc.Component {

    private _grid: Grid = null;
    private _board: cc.Node = null;
    private _curPiece: Piece = null;

    onLoad() {
        this._grid = new Grid(14);
        this._board = cc.find('Canvas/board')
    }

    start() {
        this.initEventHandlers();
    }

    initEventHandlers() {
        let self = this;
        this.node.on('on_piece_droped', function (data) {
            let piece: Piece = data.detail;
            if (piece.inBoard) {
                self.onPieceDroped(piece);
            }
        });
        this.node.on('on_piece_into_board', function (data) {
            let piece: Piece = data.detail;
            self.onPieceIn(piece);
        });
        this.node.on('on_piece_leave_board', function (data) {
            self.onPieceLeave();
        });
        this.node.on('piece_ctrl_clicked', function (data) {
            self.onPieceControllBtnClicked(data.detail)
        })
    }

    // piece 进入board
    private onPieceIn(piece: Piece) {
        if (this._curPiece) {
            this._curPiece.backToPlate();
        }
        Utils.changeParent(piece.node, this._board);
        this._curPiece = piece;
    }

    private onPieceDroped(piece: Piece) {
        UIGame.instance.showPieceCtrl(true, this.pieceSetable(piece));
    }

    private onPieceLeave() {
        this._curPiece = null;
    }

    private onPieceControllBtnClicked(name: string) {
        if (this._curPiece) {
            switch (name) {
                case "shun":
                    this._curPiece.rotate(true);
                    UIGame.instance.showPieceCtrl(true, this.pieceSetable(this._curPiece));
                    break;
                case "ni":
                    this._curPiece.rotate(false);
                    UIGame.instance.showPieceCtrl(true, this.pieceSetable(this._curPiece));
                    break;
                case "heng":
                    this._curPiece.flip(true);
                    UIGame.instance.showPieceCtrl(true, this.pieceSetable(this._curPiece));
                    break;
                case "shu":
                    this._curPiece.flip(false);
                    UIGame.instance.showPieceCtrl(true, this.pieceSetable(this._curPiece));
                    break;
                case "ok":
                    this.setPiece(GameCtrl.instance.seat);
                    UIGame.instance.showPieceCtrl(false);
                    break;
                case "cancel":
                    this._curPiece.backToPlate(true);
                    UIGame.instance.showPieceCtrl(false);
                    break;

                default:
                    break;
            }
        }
    }

    // 检查是否可放置
    private pieceSetable(piece: Piece): boolean {
        let coords: Array<cc.Vec2> = piece.getBlockCoords();

        if (GameCtrl.instance.firstStep) {
            // 第一手检查
            // TODO:此处为duo玩法原点
            let origin: cc.Vec2[] = [new cc.Vec2(4, 9), new cc.Vec2(9, 4)];
            return coords.filter(element => {
                return (element.x == origin[0].x && element.y == origin[0].y)
                    || (element.x == origin[1].x && element.y == origin[1].y);
            }).length > 0;
        }
        else {
            let jiao: boolean = false;
            for (let i = 0, len = coords.length; i < len; ++i) {
                let result = this._grid.blockCheck(coords[i], GameCtrl.instance.seat);
                if (result == BlockCheckResult.NotEmpty || result == BlockCheckResult.Edge) {
                    console.log("false")
                    return false;
                }
                else if (result == BlockCheckResult.Conner) {
                    jiao = true;
                    console.log("true")
                }
            }
            console.log(jiao)
            return jiao;
        }
    }

    // 设置piece
    private setPiece(seat) {
        if (this._curPiece) {
            let coords = this._curPiece.getBlockCoords();
            for (let i = 0, len = coords.length; i < len; ++i) {
                let coord = coords[i];
                this._grid.setBlock(coord.x, coord.y, seat);
            }
            this._curPiece.getComponent(Piece).moveable = false
            GameClient.instance.boardcastEvent('on_set_piece', this._curPiece)
            this._curPiece = null;
        }
    }

    // update (dt) {}
}
