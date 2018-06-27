const { ccclass, property } = cc._decorator;

@ccclass
export default class UIGame extends cc.Component {

    // @property(cc.Label)
    // label: cc.Label = null;

    pieceCtrl: cc.Node = null;
    btnOk: cc.Button = null;

    onLoad() {
        this.pieceCtrl = this.node.getChildByName('controller');
        this.btnOk = this.pieceCtrl.getChildByName('ok').getComponent(cc.Button);
    }

    // start() {

    // }

    // update (dt) {}

    showPieceCtrl(show: boolean, setable?: boolean) {
        this.btnOk.interactable = setable;
        this.btnOk.node.color = setable ? cc.color(39, 219, 39) : cc.Color.GRAY;
        this.btnOk.node.children[0].color = this.btnOk.node.color;
        this.pieceCtrl.active = show;
    }

    onPieceControllBtnClicked(event) {
        let name = event.target.name;
        switch (name) {
            case "shun":

                break;

            default:
                break;
        }
    }
}
