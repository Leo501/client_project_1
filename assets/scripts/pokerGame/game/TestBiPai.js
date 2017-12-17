cc.Class({
    extends: cc.Component,

    properties: {
        seats: {
            default: [],
            type: [cc.Node]
        }
    },

    // use this for initialization
    onLoad: function () {
        this.startRunBiPaiAnim_1();
    },

    //开始比牌
    startRunBiPaiAnim_1: function () {
        let size = this.seats.length;
        let i = 0;
        let count = size * 3 - 1;
        let timeId = setInterval(() => {
            console.log('startRunBiPaiAnim_1', 'setInterval');
            if (i > count) {
                // console.log('end i=', i);
                clearInterval(timeId);
                return;
            }
            let node = this.seats[i % size];
            let script = node.getComponent('PokerBiPai');
            let san = parseInt(i / size);
            if (san % 3 == 0) {
                script.initShowSd();
            } else if (san % 3 == 1) {
                script.initShowZd();
            } else if (san % 3 == 2) {
                script.initShowWd();
            }
            i++;
        }, 1000);

    },

    // //得到一个动作
    // getNodeAction: function (data) {
    //     console.log('getNodeAction');
    //     return cc.callFunc(this.getCallFuncSd, this, data);
    // },

    // //一个回调动作
    // getCallFuncSd: function (data) {
    //     console.log('getCallFuncSd');
    //     let seat = this.seats[data.idx];
    //     let script = seat.getComponent('PokerBiPai');
    //     script.initShowsd();
    // },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
