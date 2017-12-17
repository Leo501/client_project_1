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
        coinCountNode: cc.Node,
        peopleNode: cc.Node,
        difenNode: cc.Node,
        jipaixuanzheNode: cc.Node,
        chongjixuanzheNode: cc.Node,
        l_takeCoins: cc.Label,
        _tableInfo: null,
        _configSet: null,
    },

    // use this for initialization
    // onLoad: function () {
    //     this.init();
    // },

    init: function (data) {
        console.log("init");
        this.node.active = true;
        this._tableInfo = data;
        this._configSet = cc.vv.gameCoinNetMgr.configSet;
        cc.sys.localStorage.setItem('tableData', null);
        this.initGroupCustom(this.difenNode, (item, idx) => {
            console.log('initGroupCustom basePoinitset', this._configSet.basePointSet[idx]);
            const numbLabel = item.getChildByName('numb');
            numbLabel.getComponent(cc.Label).string = this._configSet.basePointSet[idx];
        });
        this.l_takeCoins.string = '注:至少要底注的{0}倍才可进入！'.format(cc.vv.gameCoinNetMgr.configSet.minGoldSet[0]);
        const selectData = JSON.parse(cc.sys.localStorage.getItem('tableData') || '');
        if (selectData !== null && selectData !== 'null') {
            console.log("aaaaaaaaa");
            this.initGroup(this.coinCountNode, selectData.minGold);
            this.initGroup(this.peopleNode, selectData.seatType);
            this.initGroup(this.difenNode, selectData.basePoint);
            this.initToggle(this.chongjixuanzheNode, selectData.jifenConfig.chongfengJi);
            this.initToggle(this.jipaixuanzheNode, selectData.jifenConfig.jiPaiRule, true);
        }
    },

    initGroupCustom: function (node, fn) {
        node.children.forEach((item, idx) => {
            fn(item, idx);
        });
    },

    initGroup: function (node, data) {
        node.children.forEach((item, idx) => {
            if (item.getComponent(cc.Toggle)) {
                item.getComponent(cc.Toggle).isChecked = data === idx;
            }
        });
    },

    initToggle: function (node, data, isJiPai) {
        node.children.forEach((item, idx) => {
            if (item.getComponent(cc.Toggle)) {
                const isChecked = data.indexOf(idx) > 0 ? true : false;
                console.log(item.name, isChecked);
                item.getComponent(cc.Toggle).isChecked = isChecked;
                if (isJiPai && idx < 4) {
                    this.setInteractable(item.name, data.indexOf(idx) > 0 ? true : false);
                }
            }
        });
    },

    getGroup: function (node) {
        let selectIdx = 0;
        console.log("getGroup children=", node.children);
        for (let idx = 0; idx < node.childrenCount; idx++) {
            console.log('every', idx);
            const item = node.children[idx];
            if (item.getComponent(cc.Toggle)) {
                let isChecked = item.getComponent(cc.Toggle).isChecked;
                if (isChecked) {
                    selectIdx = idx;
                    break;
                }
            }
        }
        return selectIdx;
    },

    getToggle: function (node) {
        let selectIdx = [];
        node.children.forEach((item, idx) => {
            if (item.getComponent(cc.Toggle)) {
                if (item.getComponent(cc.Toggle).isChecked) {
                    selectIdx.push(idx);
                }
            }
        });
        return selectIdx;
    },

    setChongjiClick: function (event) {
        // console.log("evnet=", event.target.parent.name);
        const node = event.target.parent;
        const name = node.name;
        const isAble = node.getComponent(cc.Toggle).isChecked;
        this.setInteractable(name, isAble, true);

    },

    setInteractable: function (name, isAble, isChecked) {
        const node = this.chongjixuanzheNode.getChildByName(name);
        if (node) {
            const toggle = node.getComponent(cc.Toggle);
            toggle.interactable = isAble;
            if (isChecked) {
                toggle.isChecked = false;
            }
        }
    },

    onClickConfirm: function (event) {
        const tableData = {};
        tableData.minGold = this.getGroup(this.coinCountNode);
        tableData.seatType = this.getGroup(this.peopleNode);
        tableData.basePoint = this.getGroup(this.difenNode);
        tableData.jifenConfig = {};
        tableData.jifenConfig.jiPaiRule = this.getToggle(this.jipaixuanzheNode);
        tableData.jifenConfig.chongfengJi = this.getToggle(this.chongjixuanzheNode);
        tableData.tableId = this._tableInfo.tableId;
        tableData.seatIndex = this._tableInfo.seatIndex;
        console.log("tableData=", tableData);
        cc.sys.localStorage.setItem('tableData', JSON.stringify(tableData));
        cc.vv.gameCoinNetMgr.create_table(tableData, (ret) => {
            console.log("ret=", ret);
            if (ret.errcode === 0) {
                ret.tableId = this._tableInfo.tableId;
                ret.seatIndex = this._tableInfo.seatIndex;
                ret.gameType = cc.vv.gameType.Type.coin;
                ret.ip = cc.vv.gameCoinNetMgr.socketData.ip;
                ret.port = cc.vv.gameCoinNetMgr.socketData.port;
                cc.vv.gameNetMgr.connectGameServer(ret);
            } else {
                cc.vv.alert.show('提示', ret.errmsg);
            }
            cc.vv.LogUtil.printLog("create_Table", null, "创建一个金币桌子", JSON.stringify(tableData),1);
        })
    },

    onClickOpen: function (event) {
        cc.vv.audioMgr.playClick_buttomSFX(1);
        this.init();
    },
    onClickClose: function (event) {
        cc.vv.audioMgr.playClick_buttomSFX(3);
        this.node.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});