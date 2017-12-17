cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _popuproot: null,
        _settings: null,
        _dissolveNotice: null,

        _endTime: -1,
        _extraInfo: null,
        _noticeLabel: null,
    },

    // use this for initialization
    onLoad: function () {
        // console.log("onLoad of PopupMgr.js");
        if (cc.vv == null) {
            return;
        }

        cc.vv.popupMgr = this;

        this._popuproot = cc.find("Canvas/popups");
        this._settings = cc.find("Canvas/popups/settings");
        this._dissolveNotice = cc.find("Canvas/popups/dissolve_notice");
        this._noticeLabel = this._dissolveNotice.getChildByName("info").getComponent(cc.Label);
        this._sqjsfj = cc.find("Canvas/popups/settings/btn_sqjsfj");
        this._btn_back = cc.find("Canvas/popups/settings/btn_back");
        this.closeAll();

        this.addBtnHandler("settings/btn_close");
        this.addBtnHandler("settings/btn_sqjsfj");
        this.addBtnHandler("dissolve_notice/btn_agree");
        this.addBtnHandler("dissolve_notice/btn_reject");
        this.addBtnHandler("dissolve_notice/btn_ok");
        this.addBtnHandler('settings/btn_back');

        var self = this;
        this.node.on("dissolve_notice", function (event) {
            var data = event.detail;
            self.showDissolveNotice(data);
        });

        this.node.on("dissolve_cancel", function (event) {
            self.closeAll();
        });

        this.node.on("game_over", function (event) {
            console.log("game_over");
            self._popuproot.active = false;
        });
    },

    addBtnHandler: function (btnName) {
        var btn = cc.find("Canvas/popups/" + btnName);
        this.addClickEvent(btn, this.node, "PopupMgr", "onBtnClicked");
    },

    addClickEvent: function (node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

    onBtnClicked: function (event) {
        this.closeAll();
        var btnName = event.target.name;
        if (btnName == "btn_agree") {
            cc.vv.net.send("dissolve_agree");
        } else if (btnName == "btn_reject") {
            cc.vv.net.send("dissolve_reject");
        } else if (btnName == "btn_sqjsfj") {
            cc.vv.net.send("dissolve_request");
        } else if (btnName == 'btn_back') {
            console.log('exit coin table');
            cc.vv.alert.show('提示', '您确定退出游戏么？确定退出后，您将赔付本桌所有玩家每人5倍的底分金币。', () => {
                console.log('yes I am exit game');
                cc.vv.net.send("exit");
            }, true);
        }
    },

    closeAll: function () {
        this._popuproot.active = false;
        this._settings.active = false;
        this._dissolveNotice.active = false;
    },

    showSettings: function () {
        this.closeAll();
        this._popuproot.active = true;
        this._settings.active = true;
        this._btn_back.active = false;
        this._sqjsfj.active = false /*(!cc.find("Canvas/prepare").active) || (!cc.find("Canvas/prepare/btnExit").active) && (!cc.find("Canvas/prepare/btnDissolve").active) */;//游戏开始后才显示申请解散房间
        if (cc.vv.gameType.isCoinGame()) {
            console.log('enter coingame');
            this._btn_back.active = (!cc.find("Canvas/prepare").active); /*cc.vv.gameStatusHandle.isPlaying() || cc.vv.gameStatusHandle.isDingQue();*/
            this._sqjsfj.active = false;
        }
    },

    showDissolveRequest: function () {
        this.closeAll();
        this._popuproot.active = true;
    },

    showDissolveNotice: function (data) {
        cc.log("showDissolveNotice ", data);
        if (this._endTime < 0) {

        }
        this.closeAll();
        this._popuproot.active = true;
        this._dissolveNotice.active = true;

        // cc.log("cc.vv.gameNetMgr.seats",cc.vv.gameNetMgr.seats);
        this._endTime = Date.now() / 1000 + data.time;
        this._extraInfo = "";
        var seats = cc.vv.gameNetMgr.seats;
        for (var i = 0; i < seats.length; ++i) {
            var b = data.states[i];
            var name = cc.vv.gameNetMgr.seats[i].name;
            if (b) {
                this._extraInfo += "\n[已同意] " + name;
            } else {
                this._extraInfo += "\n[待确认] " + name;
            }
        }

    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this._endTime > 0) {
            var lastTime = this._endTime - Date.now() / 1000;
            if (lastTime < 0) {
                this._endTime = -1;
            }

            var m = Math.floor(lastTime / 60);
            var s = Math.ceil(lastTime - m * 60);
            s %= 61;
            var str = "";
            if (m > 0) {
                str += m + "分";
            }

            this._noticeLabel.string = str + s + "秒后房间将自动解散" + this._extraInfo;
        }
    },
});