import { GameClient } from "../GameClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Hall extends cc.Component {
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
        this.initLabels();

        if (GameClient.instance.gameNetMgr.roomId == null) {
            this.btnJoinGame.active = true;
            this.btnReturnGame.active = false;
        }
        else {
            this.btnJoinGame.active = false;
            this.btnReturnGame.active = true;
        }

        //var params = GameClient.instance.args;
        var roomId = GameClient.instance.userMgr.oldRoomId
        if (roomId != null) {
            GameClient.instance.userMgr.oldRoomId = null;
            GameClient.instance.userMgr.enterRoom(roomId);
        }

        var imgLoader = this.sprHeadImg.node.getComponent("ImageLoader");
        imgLoader.setUserID(GameClient.instance.userMgr.userId);
        GameClient.instance.utils.addClickEvent(this.sprHeadImg.node, this.node, "Hall", "onBtnClicked");


        this.addComponent("UserInfoShow");

        this.initButtonHandler("Canvas/right_bottom/btn_shezhi");
        this.initButtonHandler("Canvas/right_bottom/btn_help");
        this.initButtonHandler("Canvas/right_bottom/btn_xiaoxi");
        this.helpWin.addComponent("OnBack");
        this.xiaoxiWin.addComponent("OnBack");

        if (!GameClient.instance.userMgr.notice) {
            GameClient.instance.userMgr.notice = {
                version: null,
                msg: "数据请求中...",
            }
        }

        if (!GameClient.instance.userMgr.gemstip) {
            GameClient.instance.userMgr.gemstip = {
                version: null,
                msg: "数据请求中...",
            }
        }

        this.lblNotice.string = GameClient.instance.userMgr.notice.msg;

        this.refreshInfo();
        this.refreshNotice();
        this.refreshGemsTip();

        GameClient.instance.audioMgr.playBGM("bgMain.mp3");

        GameClient.instance.utils.addEscEvent(this.node);
    }

    refreshInfo() {
        var self = this;
        var onGet = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            }
            else {
                if (ret.gems != null) {
                    this.lblGems.string = ret.gems;
                }
            }
        };

        var data = {
            account: GameClient.instance.userMgr.account,
            sign: GameClient.instance.userMgr.sign,
        };
        GameClient.instance.http.sendRequest("/get_user_status", data, onGet.bind(this));
    }

    refreshGemsTip() {
        var self = this;
        var onGet = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            }
            else {
                GameClient.instance.userMgr.gemstip.version = ret.version;
                GameClient.instance.userMgr.gemstip.msg = ret.msg.replace("<newline>", "\n");
            }
        };

        var data = {
            account: GameClient.instance.userMgr.account,
            sign: GameClient.instance.userMgr.sign,
            type: "fkgm",
            version: GameClient.instance.userMgr.gemstip.version
        };
        GameClient.instance.http.sendRequest("/get_message", data, onGet.bind(this));
    }

    refreshNotice() {
        var self = this;
        var onGet = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            }
            else {
                GameClient.instance.userMgr.notice.version = ret.version;
                GameClient.instance.userMgr.notice.msg = ret.msg;
                this.lblNotice.string = ret.msg;
            }
        };

        var data = {
            account: GameClient.instance.userMgr.account,
            sign: GameClient.instance.userMgr.sign,
            type: "notice",
            version: GameClient.instance.userMgr.notice.version
        };
        GameClient.instance.http.sendRequest("/get_message", data, onGet.bind(this));
    }

    initButtonHandler(btnPath) {
        var btn = cc.find(btnPath);
        GameClient.instance.utils.addClickEvent(btn, this.node, "Hall", "onBtnClicked");
    }



    initLabels() {
        this.lblName.string = GameClient.instance.userMgr.userName;
        this.lblMoney.string = GameClient.instance.userMgr.coins;
        this.lblGems.string = GameClient.instance.userMgr.gems;
        this.lblID.string = "ID:" + GameClient.instance.userMgr.userId;
    }

    onBtnClicked(event) {
        if (event.target.name == "btn_shezhi") {
            this.settingsWin.active = true;
        }
        else if (event.target.name == "btn_help") {
            this.helpWin.active = true;
        }
        else if (event.target.name == "btn_xiaoxi") {
            this.xiaoxiWin.active = true;
        }
        else if (event.target.name == "head") {
            GameClient.instance.userinfoShow.show(GameClient.instance.userMgr.userName, GameClient.instance.userMgr.userId, this.sprHeadImg, GameClient.instance.userMgr.sex, GameClient.instance.userMgr.ip);
        }
    }

    onJoinGameClicked() {
        this.joinGameWin.active = true;
    }

    onReturnGameClicked() {
        GameClient.instance.wc.show('正在返回游戏房间');
        cc.director.loadScene("mjgame");
    }

    onBtnAddGemsClicked() {
        GameClient.instance.alert.show("提示", GameClient.instance.userMgr.gemstip.msg, function () {
            this.onBtnTaobaoClicked();
        }.bind(this));
        this.refreshInfo();
    }

    onCreateRoomClicked() {
        if (GameClient.instance.gameNetMgr.roomId != null) {
            GameClient.instance.alert.show("提示", "房间已经创建!\n必须解散当前房间才能创建新的房间");
            return;
        }
        console.log("onCreateRoomClicked");
        this.createRoomWin.active = true;
    }

    onBtnTaobaoClicked() {
        cc.sys.openURL('https://shop596732896.taobao.com/');
    }

    // called every frame, uncomment this function to activate update callback
    update(dt) {
        var x = this.lblNotice.node.x;
        x -= dt * 100;
        if (x + this.lblNotice.node.width < -1000) {
            x = 500;
        }
        this.lblNotice.node.x = x;

        if (GameClient.instance && GameClient.instance.userMgr.roomData != null) {
            GameClient.instance.userMgr.enterRoom(GameClient.instance.userMgr.roomData);
            GameClient.instance.userMgr.roomData = null;
        }
    }

}
