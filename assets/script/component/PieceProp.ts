enum RotateType {
    None,
    Rotate_180,
    Rotate_360,
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class PieceProp extends cc.Component {

    // @property(cc.Label)
    // label: cc.Label = null;

    @property(cc.Enum)
    rotateType: RotateType = RotateType.None;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
