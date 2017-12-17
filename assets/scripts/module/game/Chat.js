cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _chatRoot: null,
        _tabQuick: null,
        _tabEmoji: null,
        _iptChat: null,

        _quickChatInfo: null,
        _btnChat: null,
    },

    // use this for initialization
    onLoad: function () {
        if (cc.vv == null) {
            return;
        }

        cc.vv.chat = this;

        this._btnChat = this.node.getChildByName("btn_chat");
        this._btnChat.active = cc.vv.replayMgr.isReplay() == false;

        this._chatRoot = this.node.getChildByName("chat");
        this._chatRoot.active = false;

        this._tabQuick = this._chatRoot.getChildByName("quickchatlist");
        this._tabEmoji = this._chatRoot.getChildByName("emojis");

        this._iptChat = this._chatRoot.getChildByName("iptChat").getComponent(cc.EditBox);


        this._quickChatInfo = {};
        // this.getGYLanguage(this._quickChatInfo, "gy/Chat/");
        this.getWZLanguage(this._quickChatInfo, "zy/chat/");
    },

    getWZLanguage: function (_quickChatInfo, file) {
        _quickChatInfo["item0"] = {
            index: 0,
            content: "幺鸡二条，不打要着!",
            sound: file + "c_1.mp3",
        };
        _quickChatInfo["item1"] = {
            index: 1,
            content: "不好意思我有事先走了!",
            sound: file + "c_2.mp3",
        };
        _quickChatInfo["item2"] = {
            index: 2,
            content: "快点撒 你在研究原子弹啊!",
            sound: file + "c_3.mp3",
        };
        _quickChatInfo["item3"] = {
            index: 3,
            content: "今天这个运气还可以!",
            sound: file + "c_4.mp3",
        };
        _quickChatInfo["item4"] = {
            index: 4,
            content: "之个牌还安逸呢!",
            sound: file + "c_5.mp3",
        };
        _quickChatInfo["item5"] = {
            index: 5,
            content: "牌从门前过，不如摸一个!",
            sound: file + "c_6.mp3",
        };
        _quickChatInfo["item6"] = {
            index: 6,
            content: "出门遇警察!",
            sound: file + "c_7.mp3",
        };
        _quickChatInfo["item7"] = {
            index: 7,
            content: "你真勒是神雕侠侣噢!",
            sound: file + "c_8.mp3",
        };
        _quickChatInfo["item8"] = {
            index: 8,
            content: "好霉噢 简直霉起冬瓜灰!",
            sound: file + "c_9.mp3",
        };
    },

    getGYLanguage: function (_quickChatInfo, file) {
        _quickChatInfo["item0"] = {
            index: 0,
            content: "不好意思，刚刚有点小事!",
            sound: file + "item0.mp3"
        };
        _quickChatInfo["item1"] = {
            index: 1,
            content: "搞快点嘛，赶紧出牌!",
            sound: file + "item1.mp3"
        };
        _quickChatInfo["item2"] = {
            index: 2,
            content: "哈哈，今天真是踩到狗屎运了!",
            sound: file + "item2.mp3"
        };
        _quickChatInfo["item3"] = {
            index: 3,
            content: "天，我这个牌太老火了!",
            sound: file + "item3.mp3"
        };
    },

    getQuickChatInfo(index) {
        var key = "item" + index;
        return this._quickChatInfo[key];
    },

    onBtnChatClicked: function () {
        this._chatRoot.active = true;
    },

    onBgClicked: function () {
        cc.log("onBgClicked");
        this._chatRoot.active = false;
    },

    onTabClicked: function (event) {
        if (event.target.name == "tabQuick") {
            this._tabQuick.active = true;
            this._tabEmoji.active = false;
        } else if (event.target.name == "tabEmoji") {
            this._tabQuick.active = false;
            this._tabEmoji.active = true;
        }
    },

    onQuickChatItemClicked: function (event) {
        console.log("aaa");
        this._chatRoot.active = false;
        var info = this._quickChatInfo[event.target.name];
        cc.vv.net.send("quick_chat", info.index);
    },

    onEmojiItemClicked: function (event) {
        console.log(event.target.name);
        this._chatRoot.active = false;
        cc.vv.net.send("emoji", event.target.name);
    },

    onBtnSendChatClicked: function () {
        this._chatRoot.active = false;
        if (this._iptChat.string == "") {
            return;
        }
        cc.vv.net.send("chat", this._iptChat.string);
        this._iptChat.string = "";
    },
});