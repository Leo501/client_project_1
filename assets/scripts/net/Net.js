var game_ip = "192.168.0.120:8081";
if (window.io == null) {
    // window.io = require("socket-io");
}
/**
 * webSocket通迅类。
 * 通过cc.vv.net使用
 */
var Global = cc.Class({
    extends: cc.Component,
    statics: {
        ip: game_ip,
        sio: null,
        handlers: {},
        addHandler: function (event, fn) {
            //添加事件，如果有就退出。
            if (this.handlers[event]) {
                return;
            }
            var handler = function (data) {
                // console.log(event + "(" + typeof(data) + "):" + (data? data.toString():"null"));
                if (event != "disconnect" && typeof (data) == "string") {
                    data = JSON.parse(data);
                } else {
                    // console.log("disconnect of addHandler/Net.js");
                    // console.log(data);
                }
                fn(data);
            };
            this.handlers[event] = handler;
            //如果存在就直接添加监听
            if (this.sio) {
                this.sio.on(event, handler);
            }
        },
        connect: function (fnConnect, fnError, fnReconnect) {
            // console.log("connect of connect function of Net.js");
            var opts = {
                reconnection: false,
            }
            this.sio = window.io.connect(this.ip, opts);
            this.sio.on('reconnect', fnReconnect);

            this.sio.on('connect', fnConnect);
            for (var key in this.handlers) {
                var value = this.handlers[key];
                if (typeof (value) == "function") {
                    this.sio.on(key, value);
                }
            }
        },
        send: function (event, data) {
            if (data != null && (typeof (data) == "object")) {
                data = JSON.stringify(data);
                console.log(event, data);
            }
            if (!cc.vv.net_isConnect) {
                return;
            }
            this.sio.emit(event, data);
        },

        close: function () {
            this.sio.close();
            this.sio = null;
        }

    },
});