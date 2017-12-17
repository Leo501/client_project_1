const Actor = require('Actor');
cc.Class({
    extends: Actor,

    properties: {
        _ready: null,
        _emoji: null,
        _offline: null,
        _voicemsg: null,
        _chatBubble: null,
        _lastChatTime: -1,
    },

    // use this for initialization
    onLoad: function () {
        this._super();
        // console.log('onLoad SeatBase.js');
        this.init();
        this.initStatue();
        // this.setUserInfo('438438', '大哺大型', 9);
        // console.log('this._lblName.string', this._lblName.string);
    },

    
    //初始化
    init: function () {
        this._super();
        this._ready = this.node.getChildByName("ready");
        this._emoji = this.node.getChildByName("emoji");
        this._offline = this.node.getChildByName("offline");
        this._voicemsg = this.node.getChildByName("voicemsg");
        this._chatBubble = this.node.getChildByName("ChatBubble");
    },

    //初始状态
    initStatue: function () {
        this._ready && (this._ready.active = false);
        this._emoji && (this._emoji.active = false);
        this._offline && (this._offline.active = false);
        this._voicemsg && (this._voicemsg.active = false);
        this._chatBubble && (this._chatBubble.active = false);
    },

    setReady: function (value) {
        this._ready && (this._ready.active = value);
    },

    setOffline: function (value) {
        this._offline && (this._offline.active = value);
    },

    chat: function (content) {
        if (this._chatBubble == null || this._emoji == null) {
            return;
        }
        this._emoji.active = false;
        this._chatBubble.active = true;
        this._chatBubble.getComponent(cc.Label).string = content;
        this._chatBubble.getChildByName("New Label").getComponent(cc.Label).string = content;
        this._lastChatTime = 3;
        this.stopAction();
    },

    emoji: function (emoji) {
        //emoji = JSON.parse(emoji);
        if (this._emoji == null || this._emoji == null) {
            return;
        }
        console.log(emoji);
        this._chatBubble.active = false;
        this._emoji.active = true;
        this._emoji.getComponent(cc.Animation).play(emoji);
        this._lastChatTime = 3;
        this.stopAction();
    },

    voiceMsg: function (show) {
        if (this._voicemsg) {
            this._voicemsg.active = show;
        }
    },

    stopAction: function () {
        setTimeout(() => {
            this._chatBubble.active = false;
            this._emoji.active = false;
            this._emoji.getComponent(cc.Animation).stop();
        }, 3000);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        // if (this._lastChatTime > 0) {
        //     this._lastChatTime -= dt;
        //     if (this._lastChatTime < 0) {
        //         this._chatBubble.active = false;
        //         this._emoji.active = false;
        //         this._emoji.getComponent(cc.Animation).stop();
        //     }
        // }
    },
});