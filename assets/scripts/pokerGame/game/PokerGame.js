cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
        // console.log('onLoad PokerGame.js');
        cc.vv.gameNetMgr.dataEventHandler = this.node;
        this.addComponent('PokerRoom');
        this.addComponent("ChatUtil");
        this.addComponent("SettingUtil");
        this.addComponent("VoiceUtil");
        // this.addComponent();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});