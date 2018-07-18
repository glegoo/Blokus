declare function require(name: string);

export class GameClient {
    constructor() {

    }

    private static _inst: GameClient = null;
    public static get instance(): GameClient {
        if (!GameClient._inst) {
            GameClient._inst = new GameClient();
        }
        return GameClient._inst;
    }

    // 浏览器参数
    public urlArgs = null;
    public serverInfo = null;

    public userMgr = null;
    public audioMgr = null;
    public http = null;
    public net = null;

    public labToast: cc.Label = null;

    // 浏览器参数解析
    urlParse() {
        var params = {};
        if (window.location == null) {
            this.urlArgs = params;
        }
        var name, value;
        var str = window.location.href; //取得整个地址栏
        var num = str.indexOf("?")
        str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]

        var arr = str.split("&"); //各个参数放到数组里
        for (var i = 0; i < arr.length; i++) {
            num = arr[i].indexOf("=");
            if (num > 0) {
                name = arr[i].substring(0, num);
                value = arr[i].substr(num + 1);
                params[name] = value;
            }
        }
        this.urlArgs = params;
    }

    initMgr() {
        let UserMgr = require("UserMgr");
        this.userMgr = new UserMgr();

        let AudioMgr = require("AudioMgr");
        this.audioMgr = new AudioMgr();
        this.audioMgr.init();

        this.http = require("HTTP");
        this.net = require("Net");

        this.urlParse();
    }

    startPreloading(callback) {
        cc.loader.loadResDir("textures", function (err, assets) {
            callback();
        });
    }

    // 广播消息
    boardcastEvent(name: string, data: any) {
        cc.find('Canvas').emit(name, data);
    }

    // 文字提示
    toast(text: string) {
        if (this.labToast) {
            this.labToast.string = text;
        }
    }
}