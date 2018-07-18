import GameCtrl from "./GameCtrl";
import Piece from "./Piece";
import { GameClient } from "../GameClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIGame extends cc.Component {

    // @property(cc.Label)
    // label: cc.Label = null;

    private static _inst: UIGame = null;

    static get instance() {
        return UIGame._inst;
    }

    pieceCtrl: cc.Node = null;
    btnOk: cc.Button = null;


    onLoad() {
        UIGame._inst = this;
        this.pieceCtrl = this.node.getChildByName('controller');
        this.btnOk = this.pieceCtrl.getChildByName('ok').getComponent(cc.Button);
    }

    start() {
        this.initEventHandlers();
    }

    initEventHandlers() {
        let self = this;
        this.node.on('on_piece_move', function (data) {
            self.showPieceCtrl(false);
        });
    }

    // update (dt) {}

    showPieceCtrl(show: boolean, setable?: boolean) {
        this.btnOk.interactable = setable;
        this.btnOk.node.color = setable ? cc.color(39, 219, 39) : cc.Color.GRAY;
        this.btnOk.node.children[0].color = this.btnOk.node.color;
        this.pieceCtrl.active = show;
    }

    onPieceControllBtnClicked(event) {
        let name = event.target.name;
        GameClient.instance.boardcastEvent('piece_ctrl_clicked', name)
    }
}
