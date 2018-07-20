import { GameDefine } from "../GameDefine";
import { Grid } from "../Grid";
import { Utils } from "../Utils";
import { GameClient } from "../GameClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Piece extends cc.Component {

    // 边界方块
    @property({
        type: [cc.Node],
        tooltip: '边界方块'
    })
    boundBlocks: cc.Node[] = [];

    // 离开plate时的位置
    lastPlateIndex: number = 0;
    onDrag: boolean = false;
    moveable: boolean = false;
    // 数组中的下标, 代替ID
    index: number = 0;

    private _shadow: cc.Node = null;
    private _touchTiming: number = 0;
    private _board: cc.Node = null;

    get inBoard() {
        return this.node.parent.name === "board";
    }

    onLoad() {
        this._board = cc.find('Canvas/board')
        this.createShadow();
    }

    start() {
        this.moveable = true;
        this.initDragStuffs();
    }

    // 设置颜色
    set color(color: cc.Color) {
        this.node.children.forEach(node => {
            node.color = color
        })
    }

    initDragStuffs() {
        let self = this;
        //break if it's not my turn.
        this.node.on(cc.Node.EventType.TOUCH_START, function (touch: cc.Touch) {
            // console.log("cc.Node.EventType.TOUCH_START", self.name, self.node.getContentSize());
            if (self.moveable) {
                // 棋盘中直接可以移动
                if (self.inBoard) {
                    self.onTouchStart(touch);
                }
                else {
                    self._touchTiming = Date.now();
                }
            }
        });

        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (touch: cc.Touch) {
            // console.log("cc.Node.EventType.TOUCH_MOVE", self.name, self.node.getContentSize());
            if (self.moveable) {
                if (!self.onDrag) {
                    // 托盘中只有向上移动才能拖走, 保证可以左右滑动
                    if (touch.getDelta().y > 5) {
                        self.onTouchStart(touch);
                    }
                }
                else {
                    self.onMove(touch);
                }
            }
        });

        this.node.on(cc.Node.EventType.TOUCH_END, function (touch: cc.Touch) {
            // console.log("cc.Node.EventType.TOUCH_END", self.name, self.node.getContentSize());
            if (self.moveable) {
                if (self.onDrag) {
                    self.onTouchEnd(touch);
                }
                self._touchTiming = 0;
            }
        });

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (touch: cc.Touch) {
            // console.log("cc.Node.EventType.MOUSE_LEAVE", self.name, self.node.getContentSize());
            if (self.moveable) {
                if (self.onDrag) {
                    self.onTouchEnd(touch);
                }
                self._touchTiming = 0;
            }
        });
    }

    onTouchStart(touch: cc.Touch) {
        // console.log("piece touch start")
        if (!this.inBoard) {
            // 放大动画
            let action: cc.ActionInterval = cc.scaleBy(0.1, GameDefine.ZOOM_SCALE);
            this.node.runAction(action)
        }
        else {
            this.showShadow(true);
        }
        this.onDrag = true;
        GameClient.instance.boardcastEvent('on_piece_picked', this);
    }

    onMove(touch: cc.Touch) {
        // let pos: cc.Vec2 = touch.getDelta();
        let parent = this.node.parent;
        let pos: cc.Vec2 = parent.convertTouchToNodeSpaceAR(touch)
        this.node.x = pos.x;
        this.node.y = pos.y;

        // 判断piece位置在plate还是board
        if (touch.getLocationY() > 260) {
            if (!this.inBoard) {
                this.plateToBoard();
            }
            this.updateShadow();
        }
        else {
            if (this.inBoard) {
                this.boardToPlate();
            }
        }
        GameClient.instance.boardcastEvent('on_piece_move', this);
    }

    plateToBoard() {
        GameClient.instance.boardcastEvent('on_piece_leave_plate', this);
        GameClient.instance.boardcastEvent('on_piece_into_board', this);
        this.showShadow(true);
    }

    boardToPlate() {
        GameClient.instance.boardcastEvent('on_piece_leave_board', this);
        GameClient.instance.boardcastEvent('on_piece_into_plate', this);
        this.showShadow(false);
    }

    // 被顶替或取消时,回到plate中
    backToPlate(cancel?: boolean) {
        GameClient.instance.boardcastEvent('on_piece_leave_board', this);
        GameClient.instance.boardcastEvent('on_piece_into_plate', this);
        // 设置位置为离开时的位置
        this.node.setSiblingIndex(this.lastPlateIndex);
        this.showShadow(false);
    }

    onTouchEnd(touch: cc.Touch) {
        // console.log("piece touch end")
        if (!this.inBoard) {
            this.node.y = 0;
        }
        else {
            this.node.setPosition(this._shadow.getPosition())
        }

        // 还原大小
        if (Math.abs(this.node.scaleX) != 1) {
            let action: cc.ActionInterval = cc.scaleBy(0.1, 1 / Math.abs(this.node.scaleX));
            this.node.runAction(action)
        }

        this.onDrag = false;
        GameClient.instance.boardcastEvent('on_piece_droped', this);
        this.showShadow(false);
    }

    createShadow() {
        this._shadow = cc.instantiate(this.node);
        this.showShadow(false);
        this._shadow.getComponent(Piece).enabled = false;
        this._shadow.setScale(cc.v2(this.node.scaleX, this.node.scaleY));
        this._shadow.parent = this._board;
        this._shadow.opacity = 155;
    }

    showShadow(show: boolean) {
        // console.log(show)
        if (show) {
            if (this.node.scaleX * this._shadow.scaleX < 0) {
                this._shadow.scaleX = this.node.scaleX / Math.abs(this.node.scaleX);
            }
            if (this.node.scaleY * this._shadow.scaleY < 0) {
                this._shadow.scaleY = this.node.scaleY / Math.abs(this.node.scaleY);
            }
            this._shadow.rotation = this.node.rotation;
            this._shadow.setSiblingIndex(0);
        }
        this._shadow.active = show;
    }

    updateShadow() {
        let pos = this.getBlockOffset(this.boundBlocks[0]);
        // 设置影子位置
        this._shadow.setPosition(this.node.getPosition().add(pos));
    }

    // 获取方块位移
    private getBlockOffset(child: cc.Node) {
        let pos = child.getPosition()
        pos.x /= Math.abs(this.node.scaleX);
        pos.y /= Math.abs(this.node.scaleY);
        pos = Utils.convertToOtherNodeSpaceAR(pos, this.node, this._board)
        // 获取最近的格子坐标
        let target = Grid.getNearestGridPos(pos);
        // 获取向量差
        pos = target.sub(pos);
        for (let i = 1, len = this.boundBlocks.length; i < len; ++i) {
            let bPos = this.boundBlocks[i].getPosition()
            bPos.x /= Math.abs(this.node.scaleX);
            bPos.y /= Math.abs(this.node.scaleY);
            bPos = Utils.convertToOtherNodeSpaceAR(bPos, this.node, this._board);
            bPos.addSelf(pos);
            if (bPos.x < 0) {
                pos.x += 0 - bPos.x + GameDefine.BLOCK_SIZE_PIXEL / 2;
            }
            if (bPos.x > this._board.width) {
                pos.x += this._board.width - bPos.x - GameDefine.BLOCK_SIZE_PIXEL / 2;
            }
            if (bPos.y < 0) {
                pos.y += 0 - bPos.y + GameDefine.BLOCK_SIZE_PIXEL / 2;
            }
            if (bPos.y > this._board.height) {
                pos.y += this._board.height - bPos.y - GameDefine.BLOCK_SIZE_PIXEL / 2;
            }
        }
        return pos;
    }

    update(dt) {
        let longPress = (Date.now() - this._touchTiming > 300);
        if (longPress && !this.onDrag && this._touchTiming !== 0) {
            this.onTouchStart(null);
        }
    }

    rotate(shun: boolean) {
        this.node.rotation += shun ? 90 : -90;
        this.reposition();
    }

    flip(horizontal: boolean) {
        // 旋转90或270度,yx轴反转
        let yx = this.node.rotation % 180 !== 0;
        if (yx !== horizontal) {
            this.node.scaleX *= -1;
        }
        else {
            this.node.scaleY *= -1;
        }
        this.reposition();
    }

    reposition() {
        this.updateShadow();
        this.node.setPosition(this._shadow.getPosition())
    }

    getBlockCoords(): Array<cc.Vec2> {
        let coords: Array<cc.Vec2> = new Array(this.node.childrenCount);
        // 获取所有格子坐标
        for (let i = 0, len = this.node.childrenCount; i < len; ++i) {
            let child = this.node.children[i];
            let pos = child.getPosition()
            pos.x /= Math.abs(this.node.scaleX);
            pos.y /= Math.abs(this.node.scaleY);
            pos = Utils.convertToOtherNodeSpaceAR(pos, this.node, this._board);
            let coord = Grid.getCoord(pos);
            coords[i] = coord;
        }
        return coords;
    }
}