const QuickChat = require('QuickChat');
cc.Class({
    extends: cc.Component,

    properties: {
        _chatRoot: null,
        _tabQuick: null,
        _tabEmoji: null,
        _iptChat: null,

        _quickChatInfo: null,
        _btnChat: null,
        _quickChatList: null,
    },

    // use this for initialization
    onLoad: function () {
        console.log('ChatBase');
        this._chatRoot = this.node.getChildByName("chat");
        this._chatRoot.active = false;

        this._btnChat = cc.find('Canvas/btnNode/btn_chat');
        cc.vv.utils.addClickEvent(this._btnChat, this.node, "ChatUtil", "onBtnChatClicked");

        let bg = this._chatRoot.getChildByName('bg');
        cc.vv.utils.addClickEvent(bg, this.node, "ChatUtil", "onBgClicked");
        this._tabQuick = this._chatRoot.getChildByName("quickchatlist");
        this._tabEmoji = this._chatRoot.getChildByName("emojis");
        let select = this._chatRoot.getChildByName("select");
        cc.vv.utils.addCheckGroupEvent(select, this.node, "ChatUtil", "onTabClicked");
        this._iptChat = this._chatRoot.getChildByName("iptChat").getComponent(cc.EditBox);
        let btnSend = this._chatRoot.getChildByName('btnSend');
        cc.vv.utils.addClickEvent(btnSend, this.node, "ChatUtil", "onBtnSendChatClicked");

        let emojis = this._chatRoot.getChildByName('emojis');
        emojis.children.forEach((item, idx) => {
            cc.vv.utils.addClickEvent(item, this.node, "ChatUtil", "onEmojiItemClicked");
        });
        this._quickChatList = cc.find('quickchatlist/view/content', this._chatRoot);

        this._quickChatInfo = {};
        this.getWZLanguage(this._quickChatInfo, "zy/chat/");
        this.addQuickChatItem(this._quickChatInfo, this._quickChatList);
    },

    addQuickChatItem: function (data, list) {
        // console.log('addQuickChatItem',data);
        let keys = Object.keys(data);
        let model = list.children[0];
        list.removeAllChildren();
        keys.forEach((value) => {
            let item = cc.instantiate(model);
            item.name = value;
            list.addChild(item);
            let label = item.getChildByName('label').getComponent(cc.Label);
            label.string = data[value].content;
            cc.vv.utils.addClickEvent(item, this.node, "ChatUtil", "onQuickChatItemClicked");
        });
    },

    getWZLanguage: function (_quickChatInfo, file) {
        QuickChat.get13Shui(this._quickChatInfo);

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
        console.log('onTabClicked', event);
        if (event.node.name == "tabQuick") {
            this._tabQuick.active = true;
            this._tabEmoji.active = false;
        } else if (event.node.name == "tabEmoji") {
            this._tabQuick.active = false;
            this._tabEmoji.active = true;
        }
    },

    onQuickChatItemClicked: function (event) {
        this._chatRoot.active = false;
        var info = this._quickChatInfo[event.target.name];
        console.log("onQuickChatItemClicked", info.index);
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