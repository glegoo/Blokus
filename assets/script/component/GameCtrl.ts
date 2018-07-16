import Piece from "./Piece";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCtrl extends cc.Component {

    private static _inst: GameCtrl;
    static get instance(): GameCtrl {
        return GameCtrl._inst;
    }

    // @property(cc.Label)
    // label: cc.Label = null;

    seat: number = 0;
    firstStep: boolean = false;

    onLoad() {
        GameCtrl._inst = this;
    }

    start() {
        this.initEventHandlers();
        this.gameStart();
    }

    initEventHandlers() {
        let self = this;
        this.node.on('on_set_piece', function (data) {
            self.firstStep = false;
        })
    }

    gameStart() {
        this.firstStep = true;
    }

    // update (dt) {}
}
