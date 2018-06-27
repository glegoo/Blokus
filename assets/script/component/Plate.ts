import Piece from "./Piece";

const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class Plate extends cc.Component {

    @property
    spacingX: number = 0;

    private _dragIndex: number = -1;
    private _dragPiece: Piece = null;
    private _scrollView: cc.ScrollView = null;

    onLoad() {
        this._scrollView = cc.find('Canvas/scrollview').getComponent(cc.ScrollView);
    }

    start() {

    }

    setDragIndex(num: number) {
        this._dragIndex = num;
        if (this._dragPiece) {
            this._dragPiece.lastPlateIndex = num;
        }
    }

    onPiecePicked(piece: Piece) {
        this._dragPiece = piece;
        if (piece) {
            this.setDragIndex(piece.node.getSiblingIndex());
            console.log(this._dragIndex)
            piece.node.setSiblingIndex(this.node.childrenCount - 1);
        }
    }

    onPieceMove(piece: Piece) {
        if (this._dragIndex == -1) {
            return;
        }
        let leftOk = this._dragIndex == 0 || piece.node.x > this.node.children[this._dragIndex - 1].x;
        let rightOk = piece.node.x <= this.node.children[this._dragIndex].x;

        // 左侧不OK,向左查询位置
        if (!leftOk) {
            for (let i = this._dragIndex; i >= 0; i--) {
                if (piece.node.x > this.node.children[i].x) {
                    this.setDragIndex(i + 1);
                    break;
                }
                if (i == 0 && piece.node.x <= this.node.children[i].x) {
                    this.setDragIndex(0);
                }
            }
        }
        else if (!rightOk) {
            for (let i = this._dragIndex + 1; i < this.node.childrenCount; ++i) {
                if (piece.node.x <= this.node.children[i].x) {
                    this.setDragIndex(i);
                    break;
                }
            }
        }
    }

    onPieceDroped(piece: Piece) {
        piece.node.setSiblingIndex(this._dragIndex);
        this.clearDragPiece(piece);
    }

    clearDragPiece(piece: Piece) {
        this._dragIndex = -1;
        this._dragPiece = null;
        this.reposition();
    }

    update(dt) {
        this.reposition();
    }

    reposition() {
        let x = 0;
        for (let i = 0, len = this.node.childrenCount; i < len; ++i) {

            // piece采用中心锚点
            let child = this.node.children[i];
            x += child.width / 2 * Math.abs(child.scaleX);

            // 留出拖拽中piece的距离
            if (i == this._dragIndex) {
                x += this._dragPiece.node.width * Math.abs(this._dragPiece.node.scaleX) + this.spacingX;
            }

            if (!child.getComponent(Piece).onDrag) {
                if (child.x != x) {
                    child.x = cc.lerp(x, child.x, 0.1);
                }
                if (child.y != 0) {
                    child.y = 0;
                }
            }
            x += child.width / 2 * Math.abs(child.scaleX) + this.spacingX;
        }
        this.node.width = x - this.spacingX + 10;
    }
}
