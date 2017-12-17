cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _reconnect: null,
        _reconnCount: null,
        _repeate: null,
    },

    // use this for initialization
    onLoad: function () {
        this._repeate = 4;
        // cc.log("onLoad of ReConnect");
        this._reconnect = cc.find("Canvas/reconnect");
        var self = this;
        var btnOk = cc.find("Canvas/reconnect/btn_ok");

        var fn = function (data) {
            // self.node.off('disconnect of ReConnect',fn);
            console.log("received disconnect data");
            self._reconnect.active = false; //关掉提示框
            cc.vv.wc.show(); //开始转圈
            self._reconnCount = 0; //清零计时器
            //重复4次
            cc.vv.timeout.timeoutRepeat(self.reConnectCallback, self, 3, self._repeate, 1);
        };

        this.node.on('disconnect', fn);

        this.node.on('reConnect_ok', function (data) {
            console.log('reConnect_ok of reConnect.js');
            cc.vv.wc.hide();
            cc.vv.timeout.unschedule(self.reConnectCallback, self);
        });

        if (btnOk) {
            cc.vv.utils.addClickEvent(btnOk, this.node, "ReConnect", "onReconnect");
        }

        //
        var btn_connect = cc.find("Canvas/btnReconn");
        if (btn_connect) {
            cc.vv.utils.addClickEvent(btn_connect, this.node, "ReConnect", "onReconnect");
        }
    },

    reConnectCallback: function () {
        if (this._reconnCount++ == this._repeate) {
            console.log("stop");
            this._reconnect.active = true;
            cc.vv.wc.hide();
            return;
        }
        cc.vv.gameNetMgr.reConnectGameServer();
    },

    onBtnOK: function () {
        console.log("onBtnOK ReConnect.js");
        cc.director.loadScene("hall");
    },
    onReconnect: function () {
        this._reconnect.active = false;
        this.node.emit('disconnect');
    },

    retryInfs: function () {
        cc.log("start of reconnect");
        var account = cc.sys.localStorage.getItem("wx_account");
        var sign = cc.sys.localStorage.getItem("wx_sign");
        if (account != null && sign != null) {
            cc.log("start", "account=" + account + "sign=" + sign);
            var ret = {
                errcode: 0,
                account: account,
                sign: sign
            }
            cc.vv.http.sendRequest("/login", {
                account: account,
                sign: sign
            }, this.onLogin);
        } else {
            cc.log("bug----------------------------", "account or sign is null");
        }

    },
    onLogin: function (ret) {

        if (ret.errcode !== 0) {

        } else {
            if (!ret.userid) {
                //jump to register user info.
            } else {
                console.log(ret, cc.vv.isReconnect);
                if (cc.vv.isReconnect) {
                    return;
                }
                cc.vv.isReconnect = true;
                if (cc.vv.gameType.isCardGame()) {
                    self.roomData_reconnect = ret.room;
                }
                cc.director.loadScene("hall");
            }
        }
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        // if(this._reconnect){
        //     if(this._reconnect.active){
        //             if(cc.vv.net_isConnect){
        //             this._reconnect.active=false;
        //         }
        //     }      
        // }
    },
});