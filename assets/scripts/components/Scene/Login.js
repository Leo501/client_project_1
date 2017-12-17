String.prototype.format = function (args) {
    if (arguments.length > 0) {
        var result = this;
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                var reg = new RegExp("({" + key + "})", "g");
                result = result.replace(reg, args[key]);
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] == undefined) {
                    return "";
                } else {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
        return result;
    } else {
        return this;
    }
};
var hallItem = require('ShowItem');
cc.Class({
    extends: cc.Component,

    properties: {
        _mima: null,
        _mimaIndex: 0,
        _aler_node: null,
        _content: null,
        _btn_ok: null,
        _btn_cancel: null,
        lblNotice: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        if (!cc.vv) {
            cc.director.loadScene("loading");
            return;
        }
        G.curNode = this.node;
        cc.vv.http.url = cc.vv.http.master_url;
        cc.vv.net.addHandler('push_need_create_role', function () {
            console.log("onLoad:push_need_create_role");
            cc.director.loadScene("createrole");
        });
        var notice = cc.find("Canvas/notice");
        notice.active = false;
        const node = cc.find('Canvas/alert_download');
        cc.vv.downloadAlert = node.getComponent('AlertDownload');

        this._mima = ["A", "A", "B", "B", "A", "B", "A", "B", "A", "A", "A", "B", "B", "B"];

        cc.find("Canvas/btn_yk").active = false;
        if (!cc.sys.isNative || cc.sys.os == cc.sys.OS_WINDOWS) {
            cc.find("Canvas/btn_yk").active = true;
        }

        var self = this;
        this.node.on("login_checkout_push", function (event) {
            self.checkLoginTimeout();
        });
        this.resetShowItem();

        // var onGetMsg = function (ret) {
        //     console.log("onGetMsg", ret);
        //     let onDownload = null;
        //     if (ret.isdownload) {
        //         onDownload = function () {
        //             console.log("open ");
        //             cc.vv.WebUtil.open();
        //         };
        //     }
        //     if (ret.errcode == 0) {
        //         cc.vv.downloadAlert.show("提示", ret.msg, () => {
        //             console.log('ok');
        //         }, onDownload);
        //     }
        // };
        // console.log("login aaaa");
        // cc.vv.http.sendRequest("/get_message", {
        //     type: "login_notice",
        //     version: G.VERSION.substr(1)
        // }, onGetMsg);

    },

    //设置只能在第一次进行大厅时，才显示活动页面。从游戏返回大厅无效。
    resetShowItem: function (name) {
        hallItem.resetAccountFromItem('shareItem');
        hallItem.resetAccountFromItem('activityItem');
        // //重置游戏类型
        cc.vv.gameType.setType(cc.vv.gameType.Type.unknown);
    },

    start: function () {
        //用于处理消息
        cc.vv.LoginHandler = this.node;

        cc.log("start of login");
        if (!cc.vv.initVersion.isLastVersion()) {
            console.log("wechat of login");
            cc.sys.localStorage.removeItem("wx_account");
            cc.sys.localStorage.removeItem("wx_sign");
            cc.sys.localStorage.removeItem("hall");
            cc.sys.localStorage.removeItem("appweb");
            cc.sys.localStorage.removeItem("coinUrl"); //去除金币ip
            cc.vv.isFirstLogin = true;
            return;
        }
        var account = cc.sys.localStorage.getItem("wx_account");
        var sign = cc.sys.localStorage.getItem("wx_sign");
        cc.vv.SI = {};
        cc.vv.SI.hall = cc.sys.localStorage.getItem("hall");
        cc.vv.SI.appweb = cc.sys.localStorage.getItem("appweb");
        //从内存取出
        cc.vv.http.coinUrl = JSON.parse(cc.sys.localStorage.getItem("coinUrl"));
        console.log("coinUrl=", cc.vv.http.coinUrl);
        if (account != null && sign != null && cc.vv.SI.hall != null && cc.vv.SI.appweb) {
            console.log("account=" + account + "sign=" + sign);
            var ret = {
                errcode: 0,
                account: account,
                sign: sign
            }
            console.log("hall=" + cc.vv.SI.hall);
            cc.vv.userMgr.onAuth(ret);
            this.checkLoginTimeout();
        } else {
            console.log("account or sign is null");
        }

    },

    uploadVersion: function () {
        var self = this;
        var onGetVersion = function (ret) {
            cc.vv.SI = ret;
            cc.vv.anysdkMgr.login();
            cc.vv.timeout.unschedule(self.getInfoCallback, self);
        };
        var devi = cc.sys.os == cc.sys.OS_ANDROID ? "android" : (cc.sys.os == cc.sys.OS_IOS ? "ios" : "other");
        cc.vv.http.sendRequest("/get_serverinfo", {
            device: devi
        }, onGetVersion);
        cc.vv.timeout.timeoutOne(self.getInfoCallback, self, 7);

    },

    getInfoCallback: function () {
        // cc.vv.wc.hide();
        cc.vv.login_alert.show("提示", "获取信息失败，请检查网络后 \n 重新登陆！");
    },

    onBtnQuickStartClicked: function () {
        cc.vv.userMgr.guestAuth();
        // console.log("cc.vv.userMgr.guestAuth()");
    },

    onBtnWeichatClicked: function () {
        console.log("weichat");
        var self = this;
        cc.vv.anysdkMgr.login();
    },

    onBtnMIMAClicked: function (event) {
        if (this._mima[this._mimaIndex] == event.target.name) {
            this._mimaIndex++;
            if (this._mimaIndex == this._mima.length) {
                cc.find("Canvas/btn_yk").active = true;
            }
        } else {
            console.log("oh ho~~~");
            this._mimaIndex = 0;
        }
    },

    //设置超时，单位 s
    checkLoginTimeout: function () {
        cc.vv.timeout.timeoutOne(function () {
            // console.log("once action ---------------------------------------------");
            cc.vv.wc.hide();
            cc.vv.login_alert.show("提示", "登陆失败！\n请检查网络后重新登陆！", function () {});

        }, this, 14);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (cc.sys.os == cc.sys.OS_IOS) {
            var x = this.lblNotice.node.x;
            x -= dt * 100;
            if (x + this.lblNotice.node.width < -1000) {
                x = 500;
            }
            this.lblNotice.node.x = x;
            // console.log(dt);
        }
    },
});