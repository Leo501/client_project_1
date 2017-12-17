cc.Class({
    extends: cc.Component,

    properties: {
        dian: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        var self = this;
        this.node.on("init_login_push", function (date) {});

        this.node.on("enter_login_push", function (data) {
            self.confirmClick();
        });

        if (!cc.sys.isNative) {
            this.confirmClick();
        }
    },

    confirmClick: function () {
        for (var i = 0; i < this.dian.children.length; ++i) {
            this.dian.children[i].active = false;
        }
        this.initMgr();
        this.checkVersion();

    },

    initMgr: function () {
        cc.vv = {};
        /**日志工具 */
        var LogUtil_ = require("LogUtil");
        cc.vv.LogUtil = LogUtil_.getInstance();

        cc.vv.http_isConnect = true;
        cc.vv.net_isConnect = false;
        var UserMgr = require("UserMgr");
        cc.vv.userMgr = new UserMgr();

        var ReplayMgr = require("ReplayMgr");
        cc.vv.replayMgr = new ReplayMgr();

        cc.vv.http = require("HTTP");
        cc.vv.net = require("Net");
        //用于区分是金币还是房卡。
        cc.vv.gameType = require('GameType');
        cc.vv.gameType.isCoinGame();

        let WebUtil = require("WebUtil");
        cc.vv.WebUtil = new WebUtil();
        cc.vv.WebUtil.init();

        cc.vv.initVersion = require("InitVersion");
        cc.vv.initVersion.init();

        cc.vv.location = require("Location");
        cc.vv.location.init();

        var GameNetMgr = require("GameNetMgr");
        cc.vv.gameNetMgr = new GameNetMgr();
        cc.vv.gameNetMgr.initHandlers();

        //金币场网络通信
        let GameCoinNetMgr = require('GameCoinNetMsg');
        cc.vv.gameCoinNetMgr = new GameCoinNetMgr();
        cc.vv.gameCoinNetMgr.init();

        var AnysdkMgr = require("AnysdkMgr");
        cc.vv.anysdkMgr = new AnysdkMgr();
        cc.vv.anysdkMgr.init();

        var VoiceMgr = require("VoiceMgr");
        cc.vv.voiceMgr = new VoiceMgr();
        cc.vv.voiceMgr.init();

        var AudioMgr = require("AudioMgr");
        cc.vv.audioMgr = new AudioMgr();
        cc.vv.audioMgr.init();

        var Utils = require("Utils");
        cc.vv.utils = new Utils();

        var SetPeople = require("SetPeople");
        cc.vv.setPeople = new SetPeople();

        cc.vv.timeout = require("CheckTimeout");

        var GameStatus = require('GameStatus');
        cc.vv.gameStatusHandle = new GameStatus();
        cc.vv.gameStatusHandle.init();

        cc.args = this.urlParse();

        console.log('add alert component');
        this.node.addComponent('Alert');
        cc.vv.audioMgr.playBGM("game_bg2.mp3");


    },

    checkVersion: function () {
        var self = this;
        if (cc.sys.isBrowser) {
            var onGetVersion = function (ret) {
                console.log("ret", ret);
                cc.vv.SI = ret;
                //加入金币场ip地址,用于浏览器使用。
                cc.vv.http.coinUrl = ret.goldHallAddr;
                // console.log(cc.vv.http.coinUrl);
                self.startPreloading();
                cc.vv.timeout.unschedule(self.getInfoCallback, self);
            };
            var devi = cc.sys.os == cc.sys.OS_ANDROID ? "android" : (cc.sys.os == cc.sys.OS_IOS ? "ios" : "other");
            cc.vv.http.sendRequest("/get_serverinfo", {
                device: devi
            }, onGetVersion);
            cc.vv.timeout.timeoutOne(self.getInfoCallback, self, 7);
            return;
        }

        self.startPreloading();
    },

    getInfoCallback: function () {
        if (cc.sys.os == cc.sys.OS_IOS) {
            this.startPreloading();
            return;
        }
        cc.vv.alert.show("提示", "获取信息失败，请检查网络后 \n 重新启动软件！");
    },

    startPreloading: function () {
        var self = this;
        console.log("startPreloading of LoadingLogic");

        //用于检查是否已有微信账号
        if (cc.sys.os == cc.sys.OS_IOS) {
            var account = cc.sys.localStorage.getItem("wx_account");
            var sign = cc.sys.localStorage.getItem("wx_sign");
            cc.log(account, sign);

            if (!account || !sign) {
                cc.log("not account or sign");
                self.onLoadComplete();
                return;
            }
        }

        cc.loader.loadResDir("textures", function (err, assets) {
            self.onLoadComplete();
        });

        cc.loader.onProgress = function (completedCount, totalCount, item) {};

        cc.loader.onComplete = function (error, items) {
            self.onLoadComplete();
        }

        // cc.loader.loadResDir("comfigData", function (err, assets) {
        //     console.log('assets=', assets);
        //     self.onLoadComplete();
        // });
    },

    urlParse: function () {
        var params = {};
        if (window.location == null) {
            return params;
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
        return params;
    },

    onLoadComplete: function () {
        console.log("onLoadComplete of LoadingLogic.js")
        cc.director.loadScene("login");
    },

    update: function (dt) {
        for (var i = 0; i < this.dian.children.length; ++i) {
            this.dian.children[i].active = false;
        }
        var t = Math.floor(Date.now() / 1000) % this.dian.children.length;
        this.dian.children[t].active = true;
    }
});