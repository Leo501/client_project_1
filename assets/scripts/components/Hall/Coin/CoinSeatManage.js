cc.Class({
    extends: cc.Component,

    properties: {
        viewContent: cc.Node,
        seat_numb: 0,
        seat_column: 0,
        item_width: 0,
        item_heigth: 0,
        _origin_point: null,
        item_template: cc.Node,
        create_table_node: cc.Node,
        sit_down_node: cc.Node,
        _create_table_script: null,
        _sit_down_script: null,
        _seatArrData: null,
        _isFirstIint: true,

    },

    // use this for initialization
    onLoad: function () {
        console.log('onLoad CoinSeatManage.js');
        this.node.addComponent('UserCoinInfo');
        this._origin_point = this.item_template.position;
        this.initSeats(this._seatArrData);
    },

    init: function (type) {
        console.log('init coinSeatManage.js');
        this._create_table_script = this.create_table_node.getComponent('CreateTable');
        this._sit_down_script = this.sit_down_node.getComponent('SitDownTable');
        this._create_table_script.onClickClose();
        this._sit_down_script.onClose();
        cc.vv.wc.show("正在进入自由场");
        //直接进入大厅
        if (type === 1) {
            this.enterHall();
            return;
        }
        //检查是否已经进入游戏。
        cc.vv.userMgr.loginTable(function (data) {
            console.log('socketData=', data);
            cc.vv.gameCoinNetMgr.socketData = data;
            try {
                data.basePointSelect.forEach((item, idx) => {
                    cc.vv.gameCoinNetMgr.configSet.basePointSet[idx] = item;
                })
                cc.vv.gameCoinNetMgr.configSet.minGoldSet[0] = data.baseTimes;
            } catch (error) {
                cc.vv.wc.hide();
                cc.vv.alert.show("提示", "获取数据有误!");
                return;
            }
            console.log('minGoldSet=', cc.vv.gameCoinNetMgr.configSet.minGoldSet);
            if (data.tableconfig) {
                //直接进行游戏。
                data.tableconfig.gameType = cc.vv.gameType.Type.coin;
                cc.vv.gameNetMgr.connectGameServer(data.tableconfig);
                return;
            }
            this.enterHall();

        }.bind(this));
    },

    enterHall: function () {
        //检查是否获得数据。
        cc.vv.gameCoinNetMgr.enterCoinHall((data) => {
            // cc.vv.wc.hide();
            if (data === null) {
                console.log('data is null');
                return;
            }
            this.initCoinHall(data);
            cc.vv.gameCoinNetMgr.setDispatchNode(this.node);
        });
    },

    initCoinHall: function (data) {
        console.log("initCoinHall");
        cc.vv.wc.hide();
        this._seatArrData = data;
        this.node.active = true;
    },
    //进入金币场
    onOpen: function () {
        cc.vv.audioMgr.playClick_buttomSFX(1);
        this.init();
    },

    //关闭
    onClose: function () {
        cc.vv.audioMgr.playClick_buttomSFX(3);
        this.node.active = false;
        //退出金币大厅。
        cc.vv.gameType.setType(cc.vv.gameType.Type.unknown);
    },

    //快速开始
    onQuickStart: function () {
        console.log("quick start");
        cc.vv.audioMgr.playClick_buttomSFX(1);
        // cc.vv.alert.show('提示', '正在开发中！');
        cc.vv.gameCoinNetMgr.quickStart((data) => {
            if (data.errcode === 0) {
                data = data.data;
                const type = data.type;
                if (type === 0) {
                    this._create_table_script.init({
                        tableId: data.tableId,
                        seatIndex: data.seatIndex,
                    });
                    return;
                }
                let tableInfo = {};
                tableInfo.Id = data.tableId;
                tableInfo.basePoint = data.basePoint;
                tableInfo.jiFenConfig = JSON.parse(data.jiFenConfig);
                tableInfo.minGold = data.minGold;
                tableInfo.seatType = data.seatType;
                tableInfo.tableOwner = data.tableOwner;
                //坐桌
                if (type === 1) {
                    this._sit_down_script.init({
                        tableInfo: tableInfo,
                        seatIndex: data.seatIndex,
                    });
                }
            }
        });
    },

    //加载桌子
    initSeats: function (data) {
        this.seat_numb = data.tableNum;
        this.viewContent.removeAllChildren();
        // this.calculateLength(this.viewContent, this.seat_numb, 20, 360);
        const nodePool = G.nodePoolArr['CoinSeat'];
        try {
            for (let i = 0; i < this.seat_numb; i++) {
                let child = null;
                // child = cc.instantiate(this.item_template);
                child = nodePool.getItem();
                this.viewContent.addChild(child);
                const coinSeat = child.getComponent('CoinSeat');
                coinSeat.init(this, data.tableInfo[(i + 1)]);
            }
        } catch (error) {
            console.log('-------------------------error', error);
            //退出金币大厅。
            this.node.active = false;
            cc.vv.gameType.setType(cc.vv.gameType.Type.unknown);
        }
    },

    //计算位置
    calculatePosition: function (No, origin_point, width, heigth) {
        var c = No % this.seat_column; //在第几列，
        var r = Math.floor(No / this.seat_column); //在第几行。
        var x = origin_point.x + c * width;
        var y = origin_point.y - r * heigth;
        return cc.v2(x, y);
    },

    //计算ScolleView长度
    calculateLength: function (node, numb, interval, _default) {
        node.height = (numb < 4) ? _default : (Math.ceil(numb / this.seat_column) * this.item_heigth + interval);
    },

    onDisable: function () {
        // console.log('onDisable of coinSeatmanage.js');
    },

    onDestroy: function () {
        console.log('onDestroy of coinSeatManage.js');
    },

});