cc.Class({
    extends: cc.Component,

    properties: {
        //设置时间
        fanPaiTime: 1000,
        //管理节点
        pokerListNode: cc.Node,
        //poker模板
        pokerItemModel: cc.Node,
        _listScripte: null,
    },

    // use this for initialization
    init: function () {
        this._listScripte = this.pokerListNode.getComponent('pokerList');
        // this.node.active = false;

        // G.pokerGame.on('game_poker_holds', (event) => {
        //     console.log('pokerFanPaiAnimation game_poker_holds');
        //     this.startRunFaiPaiAnimation_2(this.fanPaiTime);
        // });
    },

    //运行动画2
    startRunFaiPaiAnimation_2: function (time) {
        let i = 0;
        this.hideAllChild(this.pokerListNode);
        this.node.active = true;
        let name = 'card_back_';
        this.pokerListNode.getChildByName('card_back_7').active = true;
        let timeId = setInterval(() => {
            if (i++ > 5) {
                console.log('end animation');
                clearInterval(timeId);
                // this.node.active = false;
                return;
            }
            let left = (7 - i);
            let right = (7 + i);
            // console.log('left=' + (7 - i), 'right=' + (7 + i));
            this.pokerListNode.getChildByName('card_back_' + left).active = true;
            this.pokerListNode.getChildByName('card_back_' + right).active = true;
        }, time);
        let size = this.pokerListNode.children.lenght;
    },

    //隐藏节点
    hideNode: function () {
        this.node.active = false;
    },

    //隐藏所有子节点
    hideAllChild: function (node) {
        this.node.active = false;
        node.children.forEach((item) => {
            item.active = false;
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});