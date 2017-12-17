cc.Class({
    extends: cc.Component,

    properties: {},

    // use this for initialization
    onLoad: function () {

    },

    //播放一个放大又变成原来的大小
    playScaleAnim_1: function (node, scale) {
        let seq = cc.sequence(cc.scaleTo(0.5, scale), cc.scaleTo(0.5, 1));
        node.runAction(seq);
    },

    //播放一个上升的动画
    playRiseAnim_1: function (node, height) {
        node.runAction(cc.moveTo(0.5, cc.p(node.x, height)));
    },

    playDownAnim_1: function (node, height) {
        node.runAction(cc.moveTo(0.5, cc.p(node.x, height)));
    },

    playFadeOut_1: function (node, time) {
        node.stopAllActions();
        node.opacity = 255;
        node.active = true;
        let seq = cc.sequence(cc.delayTime(time), cc.fadeOut(1.0));
        node.runAction(seq);
    },

    playMoveTo: function (node, time, posi) {
        node.stopAllActions;
        node.active = true;
        node.runAction(cc.moveTo(time, posi));
    },

    test: function () {
        console.log('hi');
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});