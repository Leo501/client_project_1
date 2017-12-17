/**
 * 用户账号类
 * 通过cc.vv.userNgr使用。
 */
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
        roomData_reconnect: null,
        oldRoomId: null,
        login_id: null,
        img_url: null,
        //取得钻石配置
        creatRoomComfig: null,
    },

    guestAuth: function () {

        console.log("guestAuth");
        //从浏览器地址栏取得名称
        var account = cc.args["account"];
        if (account == null) {
            //从数据库中取得名称
            account = cc.sys.localStorage.getItem("account");
        } else {
            account = 'guest_' + account;
        }

        //如果以上两种方法都取不到，自己生成一个。
        if (account === null || account === "null") {
            account = 'guest_' + Date.now();
            cc.sys.localStorage.setItem("account", account);
        }

        cc.vv.http.sendRequest("/guest", {
            account: account
        }, this.onAuth);
    },

    removeAccoutMsg: function () {
        cc.sys.localStorage.removeItem("wx_account");
        cc.sys.localStorage.removeItem("wx_sign");
        cc.sys.localStorage.removeItem("account");
        cc.sys.localStorage.removeItem("sign");
    },

    preLoadSrc: function () {
        if (cc.sys.os == cc.sys.OS_IOS && cc.vv.isFirstLogin) {
            cc.loader.loadResDir("textures", function (err, assets) {
                console.log("loadResDis ok");
                cc.vv.isFirstLogin = false;
            });
        }
    },

    /**
     * 获取用户信息回调函数
     * ret.errcode =0 返回用户信息成功
     * ret.errcode <0 返回用户信息失败
     */
    onAuth: function (ret) {
        var self = cc.vv.userMgr;
        if (ret.errcode !== 0) {
            switch (ret.errcode) {
                case -6:
                    cc.vv.login_alert.show("提示", ret.errmsg, function () {
                        cc.game.restart();
                    });
                    break;
                default:
                    cc.vv.login_alert.show("提示", "微信授权失败，请重新授权！\n 错误码:" + ret.errcode);
                    break;
            }
            cc.vv.LogUtil.sendLog('/wechat_auth  onAuth', 'fail，errcode=' + ret.errcode);
        } else {
            self.account = ret.account;
            self.sign = ret.sign;
            cc.sys.localStorage.setItem("account", ret.account);
            cc.sys.localStorage.setItem("sign", ret.sign);
            if (cc.vv.SI.hall == undefined) {
                return;
            }
            cc.vv.http.url = "http://" + cc.vv.SI.hall;
            self.login();
        }
    },

    login: function () {
        var self = this;
        var onLogin = function (ret) {
            cc.vv.timeout.unschedule(self.checkLogin, self);
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
                cc.vv.login_alert.show("提示", "登陆失败，请重新登陆！\n 错误码为：" + ret.errcode);
                this.removeAccoutMsg();
                cc.vv.wc.hide();
                cc.vv.LogUtil.sendLog('/login', 'login hall fail，ret.errmsg=' + ret.errmsg);
            } else {
                if (!ret.userid) {
                    //如果是浏览器，那就是加载注册场景
                    if (cc.sys.isBrowser) {
                        cc.director.loadScene("createrole");
                        return;
                    }
                    this.removeAccoutMsg();
                    cc.vv.login_alert.show("提示", "获取用户信息失败，请重新登陆");
                    cc.vv.wc.hide();
                    cc.vv.LogUtil.sendLog('/login', 'login hall fail，ret.userid为null ret.errmsg=' + ret.errmsg);
                } else {
                    console.log("login of ret=", ret);
                    self.account = ret.account;
                    self.userId = ret.userid;
                    self.userName = ret.name;
                    self.lv = ret.lv;
                    self.exp = ret.exp;
                    self.coins = ret.coins;
                    self.gems = ret.gems;
                    self.roomData = ret.room;
                    self.roomData_reconnect = ret.room;
                    self.login_id = ret.userid;
                    self.img_url = ret.headimg;
                    self.sex = ret.sex;
                    self.ip = ret.ip;
                    //预加载大厅头像图片
                    cc.director.loadScene("hall");
                    self.getComfigCreateRoom();
                }
            }
        };
        cc.vv.wc.show("正在登录游戏");
        cc.vv.http.sendRequest("/login", {
            account: this.account,
            sign: this.sign
        }, onLogin);
        cc.vv.timeout.timeoutOne(self.checkLogin, self, 13);
        cc.vv.LogUtil.sendLog('/login', 'loading login ');
    },

    //取得麻将配置
    getComfigCreateRoom: function () {
        cc.vv.http.sendRequest("/get_room_cost_config", {
            // account: this.account,
            // sign: this.sign
        }, (event) => {
            console.log('get_room_cost_config', event);
            this.creatRoomComfig = event.data;
        });
    },

    loginTable: function (fn) {
        var self = this;
        let timeOutId = null;
        var onLogin = function (ret) {
            console.log('loginTable');
            clearTimeout(timeOutId);
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
                cc.vv.wc.hide();
                cc.vv.alert.show("提示", ret.errmsg);
            } else {
                self.tableInfo = ret.tableInfo;
                fn(self.tableInfo);
                console.log("tableInfo =", self.tableInfo);
            }
        };
        cc.vv.http.sendRequest("/login", {
            account: this.account,
            sign: this.sign,
        }, onLogin.bind(this), cc.vv.http.coinUrl);
        timeOutId = setTimeout(function () {
            cc.vv.wc.hide();
            console.log('loginTable timeout');
            cc.vv.alert.show("提示", "获取信息失败，请重新操作");
        }, 15000);
    },

    checkLogin: function (str) {
        cc.vv.wc.hide();
        cc.vv.login_alert.show("提示", "登陆失败！\n请重新登陆！");
    },

    reGetAuth: function () {
        if (!cc.sys.isNative) {
            if (account == null) {
                account = cc.sys.localStorage.getItem("account");
            }

            var onAuth = function (ret) {
                var self = cc.vv.userMgr;
                if (ret.errcode !== 0) {
                    console.log(ret.errmsg);
                } else {
                    console.log("cc.vv.si=" + cc.vv.SI);
                    account = ret.account;
                    sign = ret.sign;
                }
            }
            cc.vv.http.sendRequest("/guest", {
                account: account
            }, onAuth);

        }
    },

    reEnterRoom: function (callback) {
        var account = cc.sys.localStorage.getItem("account");
        var sign = cc.sys.localStorage.getItem("sign");
        if (cc.sys.isNative) {
            account = cc.sys.localStorage.getItem("wx_account");
            sign = cc.sys.localStorage.getItem("wx_sign");
        }

        if (!account || !sign) {
            return callback(null);
        }

        var onLogin = function (ret) {
            if (ret.errcode !== 0) {
                return callback(null);
            }
            if (!ret.userid) {
                return callback(null);
            }
            return callback(ret.room);
        }

        cc.vv.http.sendRequest("/login", {
            account: this.account,
            sign: this.sign,
        }, onLogin);
    },

    create: function (name) {
        var self = this;
        var onCreate = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                self.login();
            }
        };

        var data = {
            account: this.account,
            sign: this.sign,
            name: name
        };
        cc.vv.http.sendRequest("/create_user", data, onCreate);
    },

    enterRoom: function (roomId, callback) {
        var self = this;
        var onEnter = function (ret) {
            cc.vv.timeout.unschedule(self.getCallback, self);
            if (callback != null) {
                callback(ret);
            }
            if (ret.errcode !== 0) {
                cc.vv.wc.hide();
            } else {
                console.log("connectGameServer of enterRoom of userMgr.js");
                cc.vv.userMgr.roomData_reconnect = ret;
                cc.vv.userMgr.roomData = ret;
                ret.gameType = cc.vv.gameType.Type.card;
                cc.vv.gameNetMgr.connectGameServer(ret);
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            roomid: roomId
        };
        cc.vv.wc.show("正在进入房间");
        cc.vv.http.sendRequest("/enter_private_room", data, onEnter);
        cc.vv.timeout.timeoutOne(self.getCallback, self, 7);
    },

    getCallback: function () {
        cc.vv.wc.hide();
        cc.vv.alert.show("提示", "获取信息失败，请检查网络后 \n 再进行操作！");
    },

    getHistoryList: function (callback) {
        var self = this;
        var onGet = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                if (callback != null) {
                    callback(ret.history);
                }
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_history_list", data, onGet);
    },

    getGamesOfRoom: function (uuid, callback) {
        var self = this;
        var onGet = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                console.log(ret.data);
                callback(ret.data);
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            uuid: uuid,
        };
        cc.vv.http.sendRequest("/get_games_of_room", data, onGet);
    },

    getDetailOfGame: function (uuid, index, callback) {
        var self = this;
        var onGet = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                console.log(ret.data);
                callback(ret.data);
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            uuid: uuid,
            index: index,
        };
        cc.vv.http.sendRequest("/get_detail_of_game", data, onGet);
    }
});