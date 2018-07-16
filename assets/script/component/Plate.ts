import Piece from "./Piece";
import { Utils } from "../Utils";

const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class Plate extends cc.Component {

    @property
    spacingX: number = 0;

    private _dragIndex: number = -1;
    private _dragPiece: Piece = null;
    private _scrollView: cc.ScrollView = null;
    private _plate: cc.Node = null;

    onLoad() {
        this._plate = cc.find('Canvas/scrollview/view/content')
        this._scrollView = cc.find('Canvas/scrollview').getComponent(cc.ScrollView);
    }

    start() {
        this.initEventHandlers();
    }

    initEventHandlers() {
        let self = this;
        this.node.on('on_piece_picked', function (data) {
            let piece: Piece = data.detail;
            if (!piece.inBoard) {
                self.onPiecePicked(piece);
            }
        });
        this.node.on('on_piece_droped', function (data) {
            let piece: Piece = data.detail;
            if (!piece.inBoard) {
                self.onPieceDroped(piece);
            }
        });
        this.node.on('on_piece_move', function (data) {
            let piece: Piece = data.detail;
            if (!piece.inBoard) {
                self.onPieceMove(piece);
            }
        })
        this.node.on('on_piece_into_plate', function (data) {
            let piece: Piece = data.detail;
            self.onPieceIntoPlate(piece);
            if (piece.onDrag) {
                self.onPiecePicked(piece);
            }
        })
        this.node.on('on_piece_leave_plate', function (data) {
            let piece: Piece = data.detail;
            self.clearDragPiece(piece);
        })
    }

    private setDragIndex(num: number) {
        this._dragIndex = num;
        if (this._dragPiece) {
            this._dragPiece.lastPlateIndex = num;
        }
    }

    private onPieceIntoPlate(piece: Piece) {
        Utils.changeParent(piece.node, this._plate);
    }

    private onPiecePicked(piece: Piece) {
        this._dragPiece = piece;
        if (piece) {
            this.setDragIndex(piece.node.getSiblingIndex());
            piece.node.setSiblingIndex(this._plate.childrenCount - 1);
            this._scrollView.enabled = false;
        }
    }

    private onPieceMove(piece: Piece) {
        if (this._dragIndex == -1) {
            return;
        }
        let leftOk = this._dragIndex == 0 || piece.node.x > this._plate.children[this._dragIndex - 1].x;
        let rightOk = piece.node.x <= this._plate.children[this._dragIndex].x;

        // 左侧不OK,向左查询位置
        if (!leftOk) {
            for (let i = this._dragIndex; i >= 0; i--) {
                if (piece.node.x > this._plate.children[i].x) {
                    this.setDragIndex(i + 1);
                    break;
                }
                if (i == 0 && piece.node.x <= this._plate.children[i].x) {
                    this.setDragIndex(0);
                }
            }
        }
        else if (!rightOk) {
            for (let i = this._dragIndex + 1; i < this._plate.childrenCount; ++i) {
                if (piece.node.x <= this._plate.children[i].x) {
                    this.setDragIndex(i);
                    break;
                }
            }
        }
    }

    private onPieceDroped(piece: Piece) {
        // piece.node.y = 0;
        piece.node.setSiblingIndex(this._dragIndex);
        this.clearDragPiece(piece);
        this._scrollView.enabled = true;
    }

    private clearDragPiece(piece: Piece) {
        this._dragIndex = -1;
        this._dragPiece = null;
        this.reposition();
    }

    update(dt) {
        this.reposition();
    }

    private reposition() {
        let x = 0;
        for (let i = 0, len = this._plate.childrenCount; i < len; ++i) {

            // piece采用中心锚点
            let child = this._plate.children[i];
            x += child.width / 2 * Math.abs(child.scaleX);

            // 留出拖拽中piece的距离
            if (i == this._dragIndex) {
                x += this._dragPiece.node.width * Math.abs(this._dragPiece.node.scaleX) + this.spacingX;
                // console.log(this._dragPiece.node.width * Math.abs(this._dragPiece.node.scaleX))
            }

            if (!child.getComponent(Piece).onDrag) {
                if (this._dragPiece) {
                    // console.log(i, x)
                }
                if (child.x != x) {
                    if (cc.sys.EDITOR_PAGE){
                        child.x = x;
                    }else{
                        child.x = cc.lerp(child.x, x, 0.2);
                    }
                }
                if (child.y != 0) {
                    child.y = 0;
                }
            }
            x += child.width / 2 * Math.abs(child.scaleX) + this.spacingX;
        }
        this._plate.width = x - this.spacingX + 10;
    }
}
