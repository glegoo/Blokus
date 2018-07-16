cc.Class({
    extends: cc.Component,
    properties: {
        account: null,
        userId: null,
        userName: null,
        lv: 0,
        exp: 0,
        coins: 0,
        gems: 0,
        sign: 0,
        ip: "",
        sex: 0,
        roomData: null,

        oldRoomId: null,
    },

    guestAuth: function () {
        var account = cc.args["account"];
        if (account == null) {
            account = cc.sys.localStorage.getItem("account");
        }

        if (account == null) {
            account = Date.now();
            cc.sys.localStorage.setItem("account", account);
        }

        GameClient.instance.http.sendRequest("/guest", { account: account }, this.onAuth);
    },

    onAuth: function (ret) {
        var self = GameClient.instance.userMgr;
        if (ret.errcode !== 0) {
            console.log(ret.errmsg);
        }
        else {
            self.account = ret.account;
            self.sign = ret.sign;
            GameClient.instance.http.url = "http://" + GameClient.instance.SI.hall;
            self.login();
        }
    },

    login: function () {
        var self = this;
        var onLogin = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            }
            else {
                if (!ret.userid) {
                    //jump to register user info.
                    // cc.director.loadScene("createrole");

                    var name = "Player" + Math.floor(Math.random() * 10000)
                    self.create("")
                }
                else {
                    console.log(ret);
                    self.account = ret.account;
                    self.userId = ret.userid;
                    self.userName = ret.name;
                    self.lv = ret.lv;
                    self.exp = ret.exp;
                    self.coins = ret.coins;
                    self.gems = ret.gems;
                    self.roomData = ret.roomid;
                    self.sex = ret.sex;
                    self.ip = ret.ip;
                    cc.director.loadScene("hall");
                }
            }
        };
        GameClient.instance.wc.show("正在登录游戏");
        GameClient.instance.http.sendRequest("/login", { account: this.account, sign: this.sign }, onLogin);
    },

    create: function (name) {
        var self = this;
        var onCreate = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            }
            else {
                self.login();
            }
        };

        var data = {
            account: this.account,
            sign: this.sign,
            name: name
        };
        GameClient.instance.http.sendRequest("/create_user", data, onCreate);
    },

    enterRoom: function (roomId, callback) {
        var self = this;
        var onEnter = function (ret) {
            if (ret.errcode !== 0) {
                if (ret.errcode == -1) {
                    setTimeout(function () {
                        self.enterRoom(roomId, callback);
                    }, 5000);
                }
                else {
                    GameClient.instance.wc.hide();
                    if (callback != null) {
                        callback(ret);
                    }
                }
            }
            else {
                GameClient.instance.wc.hide();
                if (callback != null) {
                    callback(ret);
                }
                GameClient.instance.gameNetMgr.connectGameServer(ret);
            }
        };

        var data = {
            account: GameClient.instance.userMgr.account,
            sign: GameClient.instance.userMgr.sign,
            roomid: roomId
        };
        GameClient.instance.wc.show("正在进入房间 " + roomId);
        GameClient.instance.http.sendRequest("/enter_private_room", data, onEnter);
    },
    getHistoryList: function (callback) {
        var self = this;
        var onGet = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            }
            else {
                console.log(ret.history);
                if (callback != null) {
                    callback(ret.history);
                }
            }
        };

        var data = {
            account: GameClient.instance.userMgr.account,
            sign: GameClient.instance.userMgr.sign,
        };
        GameClient.instance.http.sendRequest("/get_history_list", data, onGet);
    },
    getGamesOfRoom: function (uuid, callback) {
        var self = this;
        var onGet = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            }
            else {
                console.log(ret.data);
                callback(ret.data);
            }
        };

        var data = {
            account: GameClient.instance.userMgr.account,
            sign: GameClient.instance.userMgr.sign,
            uuid: uuid,
        };
        GameClient.instance.http.sendRequest("/get_games_of_room", data, onGet);
    },

    getDetailOfGame: function (uuid, index, callback) {
        var self = this;
        var onGet = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            }
            else {
                console.log(ret.data);
                callback(ret.data);
            }
        };

        var data = {
            account: GameClient.instance.userMgr.account,
            sign: GameClient.instance.userMgr.sign,
            uuid: uuid,
            index: index,
        };
        GameClient.instance.http.sendRequest("/get_detail_of_game", data, onGet);
    }
});
