if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ?
                args[number] :
                match;
        });
    };
}
cc.Class({
    extends: cc.Component,

    properties: {
        coinLable: cc.Label,
        peopleLable: cc.Label,
        difenLable: cc.Label,
        jipaiLable: cc.Label,
        chongjiLable: cc.Label,
        userIdLable: cc.Label,
        _tableInfo: null,
        _seatIdx: null,
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function (data) {
        this.node.active = true;
        console.log("data", data);
        this._tableInfo = data.tableInfo;
        this._seatIdx = data.seatIndex;
        // this._sitInfo=data.setInfo;
        const configSet = cc.vv.gameCoinNetMgr.configSet;
        console.log('configSet=', configSet);
        this.setString(this.coinLable, '至少要底注的{0}倍才可进入！'.format(cc.vv.gameCoinNetMgr.configSet.minGoldSet[0]) /*configSet.minGoldSet[this._tableInfo.minGold]*/ );
        this.setString(this.peopleLable, configSet.seatTypeSet[this._tableInfo.seatType]);
        this.setString(this.difenLable, configSet.basePointSet[this._tableInfo.basePoint]);
        this.setString(this.userIdLable, this._tableInfo.tableOwner);

        this.setStringArray(this.jipaiLable, this._tableInfo.jiFenConfig.jiPaiRule, configSet.jiPaiRuleSet);
        this.setStringArray(this.chongjiLable, this._tableInfo.jiFenConfig.chongfengJi, configSet.chongfengJiSet);
        // this.setString(this.jipaiLable, configSet.basePointSet[data.jifenConfig.jiPaiRule]);
        // this.setString(this.chongjiLable, configSet.chongfengJiSet[data.jifenConfig.chongfengJi]);
    },

    setStringArray: function (label, arr, set) {
        let str = '';
        if (arr && arr.length > 0) {
            Array.isArray(arr) && arr.forEach((item, idx) => {
                str += (set[item] + ',');
            });
        } else {
            str = "无"
        }
        console.log('setStringArray', str);
        this.setString(label, str);
    },

    onOpen: function (event) {
        cc.vv.audioMgr.playClick_buttomSFX(1);
        this.node.active = true;
    },

    onClose: function (event) {
        cc.vv.audioMgr.playClick_buttomSFX(3);
        this.node.active = false;
    },

    onConfirm: function (event, customEventData) {
        console.log(event.target, customEventData);
        cc.vv.gameCoinNetMgr.seat_table({
            tableId: this._tableInfo.Id,
            seatIndex: this._seatIdx,
        }, (ret) => {
            console.log('ret', ret);
            if (ret.errcode === 0) {
                ret.tableId = this._tableInfo.Id;
                ret.seatIndex = this._seatIdx;
                ret.gameType = cc.vv.gameType.Type.coin;
                ret.ip = cc.vv.gameCoinNetMgr.socketData.ip;
                ret.port = cc.vv.gameCoinNetMgr.socketData.port;
                cc.vv.gameNetMgr.connectGameServer(ret);
            } else {
                cc.vv.alert.show('提示', ret.errmsg);
            }
        });
    },

    setString: function (lable, str) {
        if (lable) {
            lable.string = str;
        } else {
            console.log(" lable is null");
        }
    }


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});