/**
 * 用于上传log(日记) 以http方式
 * 通过cc.vv.httpLog使用
 */
// var URLLOG = "http://101.37.81.210:3000";
var URLLOG = "http://139.129.109.236:3000";
cc.VERSION = 20161204;

var HTTPLOG = cc.Class({
    extends: cc.Component,
    properties: {
        schTimer: null,
        _userId: null,
        _userName: null,
    },

    onLoad: function () {
        this.schTimer = 1;
        this.schedule(this.updateData, 0.5);
        console.log("启动日志网络服务");
    },

    /**取消定时器 */
    closeSchedule: function () {
        if (this.schTimer) {
            console.log("取消定时器");
            this.unschedule(this.updateData);
            this.schTimer = 0;
            return;
        }
    },

    /**发送消息去服务 */
    sendLogToServer: function (retLogs) {
        console.log("发送消息去服务");
        var self = this;
        if (this._userId == null) {
            this._userId = 9999999;
        }
        if (this._userName == null) {
            this._userName = "hotUpdate";
        }
        var data = {
            log: retLogs,
            account: this._userId,
            nick: this._userName
        };
        HTTPLOG.sendRequest("/api/log/uplog", data, function (ret) {
            console.log("返回=" + JSON.stringify(ret));
            // console.log(self._tempLogs);
            // if (ret.errcode != 0) {
            //     self._tempLogs.shift();
            // }
        });
        // console.log("请求");
    },

    sendLog: function (data) {
        HTTPLOG.sendRequest("/api/log/uplog", data, function (ret) {
            console.log("返回=" + JSON.stringify(ret));
        });
    },

    updateData: function () {
        if (cc.vv.LogUtil) {
            if (this._userId == null) {
                this._userId = cc.vv.LogUtil.getUserId();
                this._userName = cc.vv.LogUtil.getUserName();
            }
            var tempLogs = cc.vv.LogUtil.getOneLogByTempLogs();
            if (tempLogs != null) {
                var retLogs = tempLogs[0];
                var logConfTemp = tempLogs[1];
                if (retLogs == null) {
                    return;
                }
                if (logConfTemp) {
                    this.sendLogToServer(retLogs);
                }
            }
        }
    },

    statics: {
        sessionId: 0,
        userId: 0,
        master_url: URLLOG,
        url: URLLOG,
        sendRequest: function (path, data, handler, extraUrl) {
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = 5000;
            var str = "?";
            for (var k in data) {
                if (str != "?") {
                    str += "&";
                }
                str += k + "=" + data[k];
            }
            if (extraUrl == null) {
                extraUrl = HTTPLOG.url;
            }
            var requestURL = extraUrl + path + encodeURI(str);
            // console.log("RequestURL:" + requestURL);
            xhr.open("GET", requestURL, true);
            if (cc.sys.isNative) {
                xhr.setRequestHeader("Accept-Encoding", "gzip,deflate", "text/html;charset=UTF-8");
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                    // console.log("HTTPLOG res(" + xhr.responseText.length + "):" + xhr.responseText);
                    try {
                        var ret = JSON.parse(xhr.responseText);
                        if (handler !== null) {
                            handler(ret);
                        } /* code */
                    } catch (e) {
                        console.log(e);
                    } finally {
                        if (cc.vv && cc.vv.wc) {
                            //       cc.vv.wc.hide();    
                        }
                    }
                }
            };
            if (cc.vv && cc.vv.wc) {
                //cc.vv.wc.show();
            }
            xhr.send();
        },
    },
});