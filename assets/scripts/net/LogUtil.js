/**
 * 日志管理工具 
 * */

const sendUtil = new require("HTTPLOG");
var LogUtil = (function () {
    function LogUtil() {
        /**是否开启发送服务 */
        this._isOpenSendServer = true;
        /**发送的url路径 */
        this._sendUrl = "";
        this._date = new Date();
        this._tempLogs = [];
        this._tempLogsConfigs = [];
        this.maxLen = 200;
        this.configLv = 1; //0->不打印单个*****1打印单个******-1关闭日志所有的不上传//默认不打印
    }
    var c = LogUtil,
        p = c.prototype;
    LogUtil.getInstance = function () {
        if (!LogUtil.instance_) {
            LogUtil.instance_ = new LogUtil();
        }
        return LogUtil.instance_;
    };

    /**设置日志配置 */
    p.setLogLev = function (logLv) {
        this.configLv = logLv;
    };

    p.getLogLev = function () {
        return this.configLv;
    };

    /**设置用户id */
    p.setUserId = function (userId) {
        this._userId = userId;
    };
    p.getUserId = function () {
        return this._userId;
    };
    p.setUserName = function (username) {
        this._userName = username;
    };
    p.getUserName = function () {
        return this._userName;
    };
    /**开启发送日志 */
    p.openSendServer = function () {
        this._isOpenSendServer = true;
    };
    /**关闭发送日志 */
    p.closeSendServer = function () {
        this._isOpenSendServer = false;
    };

    /**获取一个暂时存的日志 */
    p.getOneLogByTempLogs = function () {
        if (this._tempLogs.length < 1) {
            return;
        }
        if (this._tempLogs.length != this._tempLogsConfigs.length) {
            return null;
        }
        var logTemp = this._tempLogs.shift();
        var logConfTemp = this._tempLogsConfigs.shift();
        var retLogs = [logTemp, logConfTemp];
        // console.log("this._tempLogs.length=" + this._tempLogs.length +
        //     ";this._tempLogsConfigs.length=" + this._tempLogsConfigs.length);
        return retLogs;
    };

    /**打印日志
     * actionName:消息字段
     * functionName:函数名
     * doc:描述
     * logStr:日志内容
     * config:配置
     */
    p.printLog = function (actionName, functionName, doc, logStr, config) {
        let str = "";
        str = "{actionName:" + actionName + ",functionName:" + functionName + ",doc:" + doc + ",logStr:" + logStr + "}";
        // console.log("打印日志--------->\n" + str);
        if (this.configLv == -1) {
            if (cc.vv.httpLog) {
                cc.vv.httpLog.closeSchedule();
            }
            //不打印
            return;
        }
        if (this.configLv == 0) {
            //全部打印
            config = 1;
        }
        if (!logStr) {
            return;
        }
        if (logStr == null) {
            return;
        }
        if (logStr == "null") {
            return;
        }
        //one
        if (this._tempLogs.length > this.maxLen) {
            return;
        }
        this._tempLogs.push(str);
        this._tempLogsConfigs.push(config);
        return;
        //two
        var timeStr = "" + (this._date.getMonth() + 1) + "月" + this._date.getDate() + "日" + "   " + this._date.getHours() + ":" + this._date.getMinutes() + ":" + this._date.getSeconds();
        var log = timeStr + "   userId:" + this._userId + "   log:" + logStr;
        // console.log(log);
        this._tempLogs.push(logStr);
        // for (var i = 0; i < this._tempLogs.length; i++) {
        if (this.configLv == 0) {
            this.sendLogToServer();
        } else {
            if (config === 1) {
                this.sendLogToServer();
            }
        }

        // }
    };
    /**发送消息去服务 */
    p.sendLogToServer = function () {
        // console.log("发送消息去服务");
        var self = this;
        var sendLog = self._tempLogs.shift();
        var data = {
            log: sendLog,
            account: this._userId,
            nick: this._userName
        };
        cc.vv.httpLog.sendRequest("/api/log/uplog", data, function (ret) {
            console.log("返回=aaaaaa" + JSON.stringify(ret));
            // console.log(self._tempLogs);
            // if (ret.errcode != 0) {
            //     self._tempLogs.shift();
            // }
        });
        // console.log("请求 LogUtils.js");

    };
    p.sendLog = function (actionName, logStr) {
        function getLocalTime(nS) {
            return new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
        }
        try {
            let date = getLocalTime(Date.now());
            let str = "{time:" + date + ",actionName:" + actionName + ",logStr:" + logStr + "}";
            var data = {
                log: str,
                account: cc.vv.userMgr.userId == null ? 9999999 : cc.vv.userMgr.userId,
                nick: cc.vv.userMgr.userName == null ? "testAccount" : cc.vv.userMgr.userName,
            };
            sendUtil.sendRequest("/api/log/uplog", data, function (ret) {
                console.log('account=' + cc.vv.userMgr.userId == null ? 999999 : cc.vv.userMgr.userId, "返回sendLog=" + JSON.stringify(ret));
            });
        } catch (error) {
            console.log("sendLog error=" + error);
        }
    };
    module.exports = LogUtil;
    return LogUtil;
})();