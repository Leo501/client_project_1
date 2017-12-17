const basePointSet = {
    0: '100',
    1: '1000',
    2: '1W',
    3: '5W',
    4: '10W',
    5: '50W',
};
const minGoldSet = {
    0: '50',
    // 1: '100万以上',
    // 2: '1千万以上',
};
const seatTypeSet = {
    0: '4人麻将',
    1: '3人麻将',
    2: '2人麻将'
};
const jiPaiRuleSet = {
    0: '金鸡',
    1: '银鸡',
    2: '乌鸡',
    3: '挖鸡',
    4: '翻上下鸡',
};
const chongfengJiSet = {
    0: '冲金鸡',
    1: '冲银鸡',
    2: '冲乌鸡',
    3: '冲挖鸡',
    // 4:'',
};

cc.Class({
    extends: cc.Component,

    properties: {
        tableData: null,
        coinUpdataId: null,
        dispatchNode: null,
        configSet: null,
        socketData: null,
    },

    // use this for initialization
    init: function () {
        this.tableData = {};
        this.tableData.tableTime = null;
        this.tableData.tableNum = null;
        this.tableData.tableInfo = null;
        this.tableData.isHaveData = false;
        this.coinUpdataId = null;
        this.configSet = {
            basePointSet: basePointSet,
            minGoldSet: minGoldSet,
            seatTypeSet: seatTypeSet,
            jiPaiRuleSet: jiPaiRuleSet,
            chongfengJiSet: chongfengJiSet,
        };
        this.socketData = null;
    },

    setDispatchNode: function (node) {
        this.dispatchNode = node;
    },

    dispatchEvent: function (name, data) {
        if (this.dispatchNode) {
            this.dispatchNode.emit(name, data);
        }
    },

    //进入大厅时，查看是否有数据。
    enterCoinHall: function (fn) {
        // console.log("enterCoinHall.js");
        if (this.tableData.tableNum === null || this.tableData.tableInfo === null) {
            // cc.vv.wc.show("正在进入金币场");
            let timeoutId = null;
            this.getData((data) => {
                clearTimeout(timeoutId);
                // cc.vv.wc.hide();
                fn(data);
                this.stopUpdataCoinHallData();
                //如果收到数据，转到定时查询。
                this.updateCoinHallData();
            });
            timeoutId = setTimeout(function () {
                fn(null);
                cc.vv.wc.hide();
                cc.vv.alert.show("提示", "网络超时");
            }, 10000);
        } else {
            fn({
                tableNum: this.tableData.tableNum,
                tableInfo: this.tableData.tableInfo,
            });
        }
    },

    quickStart: function (fn) {
        console.log('quickStart');
        this.sendRequest('/fast_login', {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
        }, fn);
    },

    //获取大厅数据
    getData: function (fn) {
        function fn_first(ret) {
            console.log("getData/ret", ret);
            if (ret.errcode === 0) {
                this.tableData.isHaveData = true;
                this.tableData.tableTime = ret.tableTime;
                this.tableData.tableNum = ret.tableNum;
                this.tableData.tableInfo = ret.tableInfo;
                if (fn) {
                    fn(ret);
                }
            } else {
                console.log("errcode=" + ret.errcode, ret);
            }
        };
        //发送。
        cc.vv.http.sendRequest("/get_table_info", {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            tableTime: null,
        }, fn_first.bind(this), cc.vv.http.coinUrl);
    },

    //第一次获取金币场信息。
    firstGetCoinHallData: function (repeatTime) {
        console.log("firstGetCoinHallData");
        //没有获取过数据。
        if (!this.tableData.isHaveData) {
            let timeoutId = null;
            let time = 0;
            // const self=this;
            //先执行一次
            this.getData(function () {
                clearInterval(timeoutId);
                //如果收到数据，转到定时查询。
                this.updateCoinHallData();
            }.bind(this));

            //执行一次没有收到数据后，定时查询N次
            timeoutId = setInterval(() => {
                console.log("repeat getData");
                if (++time > repeatTime) {
                    console.log("网络有问题，就不用再去发送了");
                    clearInterval(timeoutId);
                    return;
                }
                this.getData(() => {
                    clearInterval(timeoutId);
                    //如果收到数据，转到定时查询。
                    this.updateCoinHallData();
                });
            }, 10000);
        } else {
            console.log('has data');
        }

    },

    //只有当第一次获取到数据时，才会定时查询。
    updateCoinHallData: function () {
        console.log("updateCoinHallData");

        function fn_update(ret) {
            // console.log('updateCoinHallData callback', ret);
            if (ret.errcode === 0) {
                if (ret.tableTime) {
                    // console.log("update tableTime", ret.tableTime);
                    // this.tableData.tableTime = ret.tableTime;
                }
                this.updateHallData(ret.tableInfo, ret.tableTime);
            }
        }
        //定时查询
        this.coinUpdataId = setInterval(function () {
            // console.log("this.tableData.tableTime=", JSON.stringify(this.tableData.tableTime));
            cc.vv.http.sendRequest("/get_table_info", {
                account: cc.vv.userMgr.account,
                tableTime: JSON.stringify(this.tableData.tableTime),
                sign: cc.vv.userMgr.sign,
            }, fn_update.bind(this), cc.vv.http.coinUrl);
        }.bind(this), 10000);
    },

    //停止刷新数据。
    stopUpdataCoinHallData: function () {
        console.log("stopUpdataCoinHallData");
        if (this.coinUpdataId !== null) {
            clearTimeout(this.coinUpdataId);
        }
    },

    sendRequest: function (name, data, fn, url, isTimeOut, time) {
        const sendUrl = (url != undefined) ? url : cc.vv.http.coinUrl;
        console.log("sendUrl=", sendUrl);
        let timeoutId = null;
        cc.vv.http.sendRequest(name, data, (ret) => {
            clearTimeout(timeoutId);
            console.log('request ok', ret);
            fn(ret);
        }, sendUrl);
        if (isTimeOut) {
            timeoutId = setTimeout(() => {
                console.log("setTimeout");
                cc.vv.alert.show("提示", "连接超时!");
            }, time);
        }
    },

    checkStatus: function (seatNo, seatIdx, fn) {
        this.sendRequest('/get_seat_status', {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            tableId: seatNo,
            seatIndex: seatIdx,
        }, fn, undefined, true, 10000);
    },

    create_table: function (data, fn) {
        console.log("create_table");
        this.sendRequest('/create_table_owner', {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            tableId: data.tableId,
            seatIndex: data.seatIndex,
            minGold: data.minGold,
            seatType: data.seatType,
            basePoint: data.basePoint,
            jifenConfig: JSON.stringify(data.jifenConfig),
        }, fn, undefined, true, 10000);
    },

    seat_table: function (data, fn) {
        console.log('seat_table=', data);
        this.sendRequest('/sit_down', {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            tableId: data.tableId,
            seatIndex: data.seatIndex,
        }, fn, undefined, true, 10000);
    },

    //更新并分发数据。
    updateHallData: function (data, tableTime) {
        console.log('updateHallData');
        const keys = Object.keys(data);
        keys.forEach((key) => {
            // console.log('data[key]', data[key]);
            //更新数据
            this.tableData.tableInfo[key] = data[key];
            this.tableData.tableTime[key] = tableTime[key];
            //分发显示数据
            this.dispatchEvent('coinSeat_' + key, data[key]);
        });
    }



});