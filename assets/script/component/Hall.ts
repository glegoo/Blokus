import { GameClient } from "../GameClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Hall extends cc.Component {

    @property(cc.Node)
    joinGameWin: cc.Node = null;

    @property(cc.EditBox)
    inputJoin: cc.EditBox = null;

    // use this for initialization
    onLoad() {
        if (!cc.sys.isNative && cc.sys.isMobile) {
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        if (!GameClient.instance) {
            cc.director.loadScene("loading");
            return;
        }

        //var params = GameClient.instance.args;
        var roomId = GameClient.instance.userMgr.oldRoomId
        if (roomId != null) {
            GameClient.instance.userMgr.oldRoomId = null;
            GameClient.instance.userMgr.enterRoom(roomId);
        }
    }

    onJoinGameClicked() {
        this.joinGameWin.active = true;
    }

    onCreateRoomClicked() {
        console.log("onCreateRoomClicked");
    }

    onJoinRoom() {
        let roomId = Number(this.inputJoin.string)
        this.inputJoin.string = "";
        // GameClient.instance.userMgr.enterRoom(roomId, function (ret) {
        //     if (ret.errcode == 0) {
        //         this.node.active = false;
        //     }
        //     else {
        //         var content = "房间[" + roomId + "]不存在，请重新输入!";
        //         if (ret.errcode == 4) {
        //             content = "房间[" + roomId + "]已满!";
        //         }
        //         // cc.vv.alert.show("提示", content);
        //         this.onResetClicked();
        //     }
        // }.bind(this));
    }
}
