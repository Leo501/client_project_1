const CompoUtil = require('GetComponent');
cc.Class({
    extends: cc.Component,
    properties: {
        //房号id
        roomIdNode: cc.Node,
        //底分
        difenNode: cc.Node,
        //局数
        zhushuNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {

    },

    setInfo: function (data) {
        CompoUtil.setLabel(this.roomIdNode, data.roomNo);
        CompoUtil.setLabel(this.difenNode, data.difen);
        CompoUtil.setLabel(this.zhushuNode, data.zhushu);
    }


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});