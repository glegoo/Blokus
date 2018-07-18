import { GameClient } from "../GameClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AppStart extends cc.Component {

    @property(cc.Label)
    loadingProgess: cc.Label = null;

    private _mainScene: string = ""
    private _splash: cc.Node = null;

    onLoad() {
        if (!cc.sys.isNative && cc.sys.isMobile) {
            let cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        GameClient.instance.initMgr();
        console.log('haha');
        this._mainScene = 'loading';
        this.showSplash(function () {
            this.getServerInfo();
        });
        GameClient.instance.labToast = this.loadingProgess;
    }

    showSplash(callback) {
        let self = this;
        let SHOW_TIME = 3000;
        let FADE_TIME = 0.5;
        this._splash = cc.find("Canvas/splash");
        this._splash.active = true;
        let finished = cc.callFunc(callback, this);
        let seq = cc.sequence(cc.fadeOut(FADE_TIME), finished);
        setTimeout(() => {
            self._splash.runAction(seq);
        }, SHOW_TIME);
    }

    getServerInfo() {
        let self = this;
        let onGetVersion = function (ret) {
            if (ret.version == null) {
                console.log("error.");
            }
            else {
                GameClient.instance.serverInfo = ret;
                GameClient.instance.toast("Loading...")
                GameClient.instance.startPreloading(function () {
                    GameClient.instance.toast("Start Login")
                    GameClient.instance.userMgr.guestAuth();
                })
            }
        };

        let xhr = null;
        let complete = false;
        let fnRequest = function () {
            GameClient.instance.toast("Connenting...")
            xhr = GameClient.instance.http.sendRequest("/get_serverinfo", null, function (ret) {
                xhr = null;
                complete = true;
                onGetVersion(ret);
            });
            setTimeout(fn, 5000);
        }

        let fn = function () {
            if (!complete) {
                if (xhr) {
                    xhr.abort();
                    GameClient.instance.toast("Connection Faild, Retry")
                    setTimeout(function () {
                        fnRequest();
                    }, 5000);
                }
                else {
                    fnRequest();
                }
            }
        };
        fn();
    }
}
