const typeSet = {
    0: '五同',
    1: '同花顺',
    2: '铁支',
    3: '葫芦',
    4: '同花',
    5: '顺子',
    6: '三条',
    7: '两对',
    8: '对子',
};
cc.Class({
    extends: cc.Component,

    properties: {
        //显示牌节点
        poker: cc.Node,
        //显示花色节点
        typeNode: cc.Node,

    },

    // use this for initialization
    onLoad: function () {
        this.initByData();
    },

    initByData: function (data) {
        let wdNode = this.poker.getChildByName('wd');
        wdNode.active = false;
        // this.initShowPoker(wdNode, [1, 2, 3, 4, 5]);
        let zdNode = this.poker.getChildByName('zd');
        zdNode.active = false;
        // this.initShowPoker(zdNode, [15, 16, 17, 18, 19]);
        let sdNode = this.poker.getChildByName('sd');
        sdNode.active = false;
        // this.initShowPoker(sdNode, [2, 25, 17]);
        let wdTypeNode = this.typeNode.getChildByName('wd');
        wdTypeNode.active = false;
        // this.initTypeLabel(wdTypeNode, { type: 1, score: -3 });
        let zdTypeNode = this.typeNode.getChildByName('zd');
        zdTypeNode.active = false;
        // this.initTypeLabel(zdTypeNode, { type: 3, score: 1 });
        let sdTypeNode = this.typeNode.getChildByName('sd');
        sdTypeNode.active = false;
        // this.initTypeLabel(sdTypeNode, { type: 8, score: 1 });
    },

    //显示尾道
    initShowWd: function (data) {
        console.log('initShowWd');
        let wdNode = this.poker.getChildByName('wd');
        wdNode.active = true;
        this.initShowPoker(wdNode, data.pai);
        let wdTypeNode = this.typeNode.getChildByName('wd');
        wdTypeNode.active = true;
        this.initTypeLabel(wdTypeNode, { type: data.type, score: data.score });
    },

    //显示中道
    initShowZd: function (data) {
        console.log('initShowZd');
        let zdNode = this.poker.getChildByName('zd');
        zdNode.active = true;
        this.initShowPoker(zdNode, data.pai);
        let zdTypeNode = this.typeNode.getChildByName('zd');
        zdTypeNode.active = true;
        this.initTypeLabel(zdTypeNode, { type: data.type, score: data.score });
    },

    //显示首道
    initShowSd: function (data) {
        // console.log('initShowSd');
        let sdNode = this.poker.getChildByName('sd');
        sdNode.active = true;
        this.initShowPoker(sdNode, data.pai);
        let sdTypeNode = this.typeNode.getChildByName('sd');
        sdTypeNode.active = true;
        this.initTypeLabel(sdTypeNode, { type: data.type, score: data.score });
    },

    //显示某一道的扑克
    initShowPoker: function (node, data) {
        if (node) {
            node.children.forEach((item, idx) => {
                // console.log('show BiPai=', data[idx]);
                let sprite = item.getComponent(cc.Sprite);
                let spriteFrame = G.pokerSrcMng.getSpriteFrameByPokerID(data[idx]);
                sprite.spriteFrame = spriteFrame;
            });
        }
    },

    //显示某一道的花色与分数
    initTypeLabel: function (node, data) {
        let labelNode = node.getChildByName('score');
        let label = labelNode.getComponent(cc.Label);
        let spriteNode = node.getChildByName('type');
        let sprite = spriteNode.getComponent(cc.Sprite);
        G.animUtil.playScaleAnim_1(spriteNode, 1.2);
        if (label) {
            let type = typeSet[data.type];
            let score = '' + data.score > 0 ? '+' + data.score : data.score;
            label.string = '' + score;
        }
        if (sprite) {
            let spriteFrame = G.pokerSrcMng.getTypeFrameById(data.type);
            sprite.spriteFrame = spriteFrame;
        }
    },

    // //播放一个放大又变成原来的大小。
    // playScaleAnim_1: function (node) {
    //     let seq = cc.sequence(cc.scaleTo(0.5, 1.3), cc.scaleTo(0.5, 1));
    //     node.runAction(seq);
    // },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
