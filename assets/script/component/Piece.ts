import { GameDefine } from "../GameDefine";
import { Grid } from "../Grid";
import { Utils } from "../Utils";
import GameCtrl from "./GameCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Piece extends cc.Component {

    // 边界方块
    @property([cc.Node])
    boundBlocks: cc.Node[] = [];

    // 离开plate时的位置
    lastPlateIndex: number = 0;

    private _moveable: boolean = false;
    private _onDrag: boolean = false;
    private _shadow: cc.Node = null;
    private _touchTiming: number = 0;

    private get _inBoard() {
        return this.node.parent.name === "board";
    }

    get onDrag() {
        return this._onDrag;
    }

    onLoad() {
        this._shadow = cc.instantiate(this.node);
        this._shadow.getComponent(Piece).enabled = false;
        this._shadow.setScale(1);
        this._shadow.active = false;
        this._shadow.parent = GameCtrl.instance.board.node;
        this._shadow.opacity = 155;
    }

    start() {
        this._moveable = true;
        this.initDragStuffs();
    }

    initDragStuffs() {
        let self = this;
        //break if it's not my turn.
        this.node.on(cc.Node.EventType.TOUCH_START, function (touch: cc.Touch) {
            console.log("cc.Node.EventType.TOUCH_START", self.name, self.node.getContentSize());
            if (self._moveable) {
                // 棋盘中直接可以移动
                if (self._inBoard) {
                    self.onTouchStart(touch);
                }
                else {
                    self._touchTiming = Date.now();
                }
            }
        });

        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (touch: cc.Touch) {
            // console.log("cc.Node.EventType.TOUCH_MOVE", self.name, self.node.getContentSize());
            if (self._moveable) {
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
            console.log("cc.Node.EventType.TOUCH_END", self.name, self.node.getContentSize());
            if (self._moveable) {
                if (self.onDrag) {
                    self.onTouchEnd(touch);
                }
                self._touchTiming = 0;
            }
        });

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (touch: cc.Touch) {
            console.log("cc.Node.EventType.MOUSE_LEAVE", self.name, self.node.getContentSize());
            if (self._moveable) {
                if (self.onDrag) {
                    self.onTouchEnd(touch);
                    GameCtrl.instance.plate.onPieceDroped(self);
                }
                self._touchTiming = 0;
            }
        });
    }

    onTouchStart(touch: cc.Touch) {
        console.log("piece touch start")
        if (!this._inBoard) {
            let action: cc.ActionInterval = cc.scaleBy(0.1, GameDefine.ZOOM_SCALE);
            this.node.runAction(action)
            let sv = this.node.parent.parent.parent.getComponent(cc.ScrollView);
            sv.enabled = false;
            GameCtrl.instance.plate.onPiecePicked(this);
        }
        this._onDrag = true;
    }

    onMove(touch: cc.Touch) {
        // let pos: cc.Vec2 = touch.getDelta();
        let parent = this.node.parent;
        let pos: cc.Vec2 = parent.convertTouchToNodeSpaceAR(touch)
        this.node.x = pos.x;
        this.node.y = pos.y;

        // console.log(touch.getLocation(), pos, parent.convertTouchToNodeSpaceAR(touch))
        if (touch.getLocationY() > 260) {
            if (!this._inBoard) {
                this.enterBoard();
            }
            this.updateShadow();
        }
        else {
            if (this._inBoard) {
                this.enterPlate();
            }
        }
        GameCtrl.instance.onPieceMove(this);
    }

    enterBoard() {
        Utils.changeParent(this.node, GameCtrl.instance.board.node)
        this._shadow.active = true;
        GameCtrl.instance.onPieceIntoBoard(this);
    }

    enterPlate() {
        Utils.changeParent(this.node, GameCtrl.instance.plate.node);
        this._shadow.active = false;
        GameCtrl.instance.onPieceIntoPlate(this);
    }

    // 被顶替或取消时,回到plate中
    backToPlate(cancel?: boolean) {
        Utils.changeParent(this.node, GameCtrl.instance.plate.node);
        this.node.setSiblingIndex(this.lastPlateIndex);
        this._shadow.active = false;
        if (cancel){
            GameCtrl.instance.onPieceIntoPlate(this);
        }
    }

    onTouchEnd(touch: cc.Touch) {
        // console.log("piece touch end")
        if (!this._inBoard) {
            this.node.y = 0;
            let sv = this.node.parent.parent.parent.getComponent(cc.ScrollView);
            sv.enabled = true;
            GameCtrl.instance.plate.onPieceDroped(this);
        }
        else {
            this.node.setPosition(this._shadow.getPosition())
            GameCtrl.instance.onPieceDropBoard();
        }
        if (Math.abs(this.node.scaleX) != 1) {
            let action: cc.ActionInterval = cc.scaleBy(0.1, 1 / Math.abs(this.node.scaleX));
            this.node.runAction(action)
        }
        this._onDrag = false;
    }

    updateShadow() {
        let pos = this.getBlockOffset(this.boundBlocks[0]);
        if (this.node.scaleX < 0 && this._shadow.scaleX !== -1) {
            this._shadow.scaleX = -1;
        }
        if (this.node.scaleY < 0 && this._shadow.scaleY !== -1) {
            this._shadow.scaleY = -1;
        }
        // 设置影子位置
        this._shadow.setPosition(this.node.getPosition().add(pos));
    }

    // 获取方块位移
    private getBlockOffset(child: cc.Node) {
        let pos = child.getPosition()
        pos.divSelf(this.node.scale);
        pos = Utils.convertToOtherNodeSpaceAR(pos, this.node, GameCtrl.instance.board.node)
        // 获取最近的格子坐标
        let target = Grid.getNearestGridPos(pos);
        // 获取向量差
        pos = target.sub(pos);
        for (let i = 1, len = this.boundBlocks.length; i < len; ++i) {
            let bPos = this.boundBlocks[i].getPosition()
            bPos.divSelf(this.node.scale);
            bPos = Utils.convertToOtherNodeSpaceAR(bPos, this.node, GameCtrl.instance.board.node);
            bPos.addSelf(pos);
            if (bPos.x < 0) {
                pos.x += 0 - bPos.x + GameDefine.BLOCK_SIZE_PIXEL / 2;
            }
            if (bPos.x > GameCtrl.instance.board.node.width) {
                pos.x += GameCtrl.instance.board.node.width - bPos.x - GameDefine.BLOCK_SIZE_PIXEL / 2;
            }
            if (bPos.y < 0) {
                pos.y += 0 - bPos.y + GameDefine.BLOCK_SIZE_PIXEL / 2;
            }
            if (bPos.y > GameCtrl.instance.board.node.height) {
                pos.y += GameCtrl.instance.board.node.height - bPos.y - GameDefine.BLOCK_SIZE_PIXEL / 2;
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
}