const SeatBase = require('SeatBase');
cc.Class({
    extends: SeatBase,

    properties: {
        pokerChuPai: cc.Node,
        pokerFalPaiList: cc.Node,
        pokerNode: cc.Node,
        _pokerStartAnimScript: null,
        _pokerBiPaiScript: null,

    },

    onLoad: function () {
        this._super();
    },


    init: function () {
        // console.log('init PokerPlyer');
        this._super();
        if (this.pokerFalPaiList) {
            this.pokerFalPaiList.active = false;
            this._pokerStartAnimScript = this.pokerFalPaiList.getComponent('PokerFanPaiAnimation');
            this._pokerStartAnimScript.init();
        }
        if (this.pokerNode) {
            this._pokerBiPaiScript = this.pokerNode.getComponent('PikerBiPai');
        }
    },

    onReadyState: function () {
        this.setReady(true);
        this.pokerChuPai.active = false;
        this.pokerFalPaiList.active = false;
        this._pokerBiPaiScript.initByData();
    },

    onGameBeginState: function () {
        this.setReady(false);
        this.pokerNode.active = true;
        this.pokerFalPaiList.active = true;
        //发牌动作
        this._pokerStartAnimScript.startRunFaiPaiAnimation_2(1000);

    },

    onGamePlay: function () {
        // this.pokerFalPaiList.active = false;
    },

    onFinish: function () {
        //出牌动作
        this.pokerChuPai.active = true;
        this.pokerFalPaiList.active = false;
    },

    onGameOver: function () {
        this.this.pokerChuPai.active = false;
    },

    onGameBiPai: function (data) {
        switch (data.type) {
            case 0:
                {
                    this._pokerBiPaiScript.initShowSd(data.data);
                    break;
                }
            case 1:
                {
                    this._pokerBiPaiScript.initShowZd(data.data);
                    break;
                }
            case 2:
                {
                    this._pokerBiPaiScript.initShowWd(data.data);
                    break;
                }
        }
    }





    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});