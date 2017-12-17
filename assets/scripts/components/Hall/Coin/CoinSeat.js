const _seatDirection = ['bottom', 'left', 'top', 'right'];
cc.Class({
    extends: cc.Component,

    properties: {
        nodeSeatIconArr: cc.Node,
        nodeSeatHandArr: cc.Node,
        nodeDiamondArr: cc.Node,
        nodeNameArr: cc.Node,
        lableRoomMsg: cc.Label,
        nodeGameStatus: cc.Node,
        nodeBgMsg: cc.Node,
        l_No: cc.Label,
        _seatData: null,
        _seatNo: null,
        _dispatchNode: null,
        _manage: null,
        _seatInfo: null,
    },
    onLoad: function () {
        // console.log('onLoad coinSeat.js');
    },

    // use this for initialization
    init: function (manage, data) {
        // console.log("CoinSeat init", data);
        this._dispatchNode = manage.node;
        this._manage = manage;
        this._seatData = data;
        this._seatInfo = data.seatInfo;
        const dispatchName = 'coinSeat_' + data.Id;
        this._dispatchNode.on(dispatchName, (data) => {
            // console.log('update coin data=', data.detail);
            data = data.detail;
            this._seatData = data;
            this.initSeat(data.seatInfo);
        });
        this.configSet = cc.vv.gameCoinNetMgr.configSet;
        this.initSeat(data.seatInfo);
    },
    setTableStatus: function (data) {
        //设置默认状态
        this.lableRoomMsg.node.active = true;
        this.nodeBgMsg.active = true;
        this.nodeGameStatus.active = false;
        //第二状态
        if (data[0] && data[0].status === 3) {
            // console.log('this.lableRoomMsg', this.lableRoomMsg);
            // console.log('this.lableRoomMsg.node', this.lableRoomMsg.node);
            this.lableRoomMsg.node.active = false;
            this.nodeBgMsg.active = false;
            this.nodeGameStatus.active = true;
        }
    },

    setLabel: function (node, str) {
        if (str) {
            node.string = str;
        }
    },

    setName: function (nodeName, itemName, isRed) {
        // console.log('itemName=', itemName);
        if (itemName === undefined || itemName === null) {
            itemName = '';
        }
        const nameNode = this.nodeNameArr.getChildByName(nodeName);
        this.setLabel(nameNode.getComponent(cc.Label), cc.vv.gameNetMgr.setName(itemName, 8, true));
        // if (isRed) {
        //     nameNode.color = (new cc.Color()).fromHEX('#DF3A01');
        // }
    },

    //重置显示
    resetNode: function (node, fn) {
        const children = node.children;
        Array.isArray(children) && children.forEach((item, idx) => {
            fn(item, idx);
        });
    },

    initSeat: function (data) {
        this.resetNode(this.nodeSeatIconArr, (iconNode, idx) => {
            iconNode.active = false;
        });
        this.resetNode(this.nodeSeatHandArr, (handNode, idx) => {
            handNode.active = false;
        });
        this.resetNode(this.nodeNameArr, (nameNode, idx) => {
            // nameNode.active = false;
            nameNode.getComponent(cc.Label).string = '';
            // nameNode.color = (new cc.Color()).fromHEX('#FFFFFF');
        });
        this.resetNode(this.nodeDiamondArr, (diamondNode, idx) => {
            diamondNode.active = false;
        });
        this.setLabel(this.lableRoomMsg, ' ');
        this.setLabel(this.l_No, this._seatData.Id);
        //重新显示
        this.setLabel(this.lableRoomMsg, this.configSet.basePointSet[this._seatData.basePoint]);
        this.setSeatData(data, (item, idx) => {
            if (item) {
                // console.log("item=", item);
                const name = _seatDirection[idx];
                this.nodeSeatHandArr.getChildByName(name).active = item.status == 2;
                const iconNode = this.nodeSeatIconArr.getChildByName(name);
                this.setHeadIcon(iconNode, item.userId);
                // if (item.userId) {
                //     iconNode.active = true;
                // }
                this.setName(name, item.name, item.lv == 100);
                this.nodeDiamondArr.getChildByName(name).active = item.lv == 100;
            }
        });
        this.setTableStatus(data);
    },

    setSeatData: function (data, fn) {
        const keys = Object.keys(data);
        Array.isArray(keys) && keys.forEach((item, idx) => {
            fn(data[item], idx);
        });
    },

    setHeadIcon: function (node, userId) {
        const icon = node.getComponent("ImageLoader");
        if (userId) {
            node.active = true;
            icon.setUserID(userId);
        }
    },

    setReadyStatus: function (node, status) {
        if (status === true) {
            node.active = true;
        }
    },

    setLableMsg: function (info) {

    },

    onClickSeat: function (event) {
        console.log("event=", event.currentTarget.name);
        const name = event.currentTarget.name;
        const seatIdx = _seatDirection.indexOf(name);
        console.log('seatIdx', seatIdx);
        // this._seatData.seatIdx=seatIdx;
        // const isActive = this.nodeSeatHandArr.getChildByName(name).active;
        // this.nodeSeatHandArr.getChildByName(name).active = !isActive;
        // this.nodeSeatIconArr.getChildByName(name).active = !isActive;
        cc.vv.gameCoinNetMgr.checkStatus(this._seatData.Id, seatIdx, (ret) => {
            console.log('ret', ret);
            if (ret.errcode === 0) {
                const type = ret.type;
                this.showPage(type, seatIdx, name, ret.userInfo);
            } else {
                cc.vv.alert.show("提示", ret.errmsg);
            }
        });
    },

    showPage: function (type, seatIdx, name, userInfo) {
        //创建桌子
        if (type === 0) {
            this._manage._create_table_script.init({
                tableId: this._seatData.Id,
                seatIndex: seatIdx,
            });
            return;
        }
        //坐桌
        if (type === 1) {
            this._manage._sit_down_script.init({
                tableInfo: this._seatData,
                seatIndex: seatIdx,
            });
            return;
        }
        if (type === 4) {
            const seat = userInfo;
            const iconNode = this.nodeSeatIconArr.getChildByName(name);
            const iconSprite = iconNode.getComponent(cc.Sprite);
            if (seat.userId) {
                if (cc.vv.userCoinInfo) {
                    cc.vv.userCoinInfo.show(seat.name, seat.userId, iconSprite, seat.sex, seat.ip, seat.coins);
                } else {
                    console.log("have a mistake for cc.vv.userCoinInfo");
                }
            }
        }
    },

    test: function () {
        console.log('test is ok');
    },
    onDisable: function () {
        // console.log('onDisable of coinSeat.js');
    },

    onDestroy: function () {
        console.log('onDestory CoinSeat');
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});