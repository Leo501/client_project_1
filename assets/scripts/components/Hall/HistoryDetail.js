cc.Class({
    extends: cc.Component,

    properties: {
        itemName: cc.Node,
        content: cc.Node,
        items: {
            default: [],
            type: [cc.Node],
        },
        title: cc.Label,
        roomNo: cc.Label,
        time: cc.Label,
        myselfColor: null,
        defaultColor: null,
    },

    // use this for initialization
    init: function (data) {
        this.myselfColer = '#FC5D31';
        this.defaultColor = '#561B06';
        this.node.active = true;
        console.log("myself name=", cc.vv.userMgr.userName);
        this.setInfo(data.info);
        this.showName(data.names, cc.vv.userMgr.userName);
        this.showItemList(data.list, cc.vv.userMgr.userName);
    },

    setInfo: function (data) {
        this.setString(this.title, data.title);
        this.setString(this.roomNo, data.roomNo);
        this.setString(this.time, data.time);
    },

    setString: function (node, info) {
        node.string = info;
    },

    onClickBack: function (event) {
        cc.vv.audioMgr.playClick_buttomSFX(3);
        this.node.active = false;
    },

    resetName: function () {
        const child = this.itemName.children;
        child.forEach((item, idx) => {
            item.active = false;
            this.setColor(item, this.defaultColor);
        })
    },

    showName: function (arr, myselfName) {
        const child = this.itemName.children;
        this.resetItem(this.itemName);
        Array.isArray(arr) && arr.forEach((item, idx) => {
            const node = child[idx];
            if (item !== null) {
                node.getComponent(cc.Label).string = cc.vv.gameNetMgr.setName(item.name, 8, true);
                node.active = true;
                if (myselfName == item.name) {
                    this.setColor(node, this.myselfColer);
                }
            }
        });
    },

    resetItemList: function () {
        this.items.forEach((item, idx) => {
            item.active = false;
        });
    },

    showItemList: function (arr, myselfName) {
        this.resetItemList();
        this.countLengthContentInfs(this.content, arr.length);
        Array.isArray(arr) && arr.forEach((infs, idx) => {
            const item = this.items[idx];
            if (infs !== null) {
                this.showItem(item, infs, myselfName);
                item.active = true;
            }
        });
    },

    resetItem: function (node) {
        const child = node.children;
        child.forEach((item, idx) => {
            item.active = false;
            this.setColor(item, this.defaultColor);
        });
    },

    showItem: function (node, infs, myselfName) {
        const child = node.children;
        this.resetItem(node);
        Array.isArray(infs) && infs.forEach((item, idx) => {
            const node = child[idx];
            if (item !== null) {
                node.getComponent(cc.Label).string = item.score;
                node.active = true;
                if (item.name == myselfName) {
                    this.setColor(node, this.myselfColer);
                }
            }
        });
    },

    //计算内容需要的长度
    countLengthContentInfs: function (node, column) {
        console.log('countLengthContentInfs');
        if (column <= 4) {
            node.height = 180;
            return;
        }
        const numb = column - 4;
        node.height = numb * (40) + 180 + 10;
    },

    setColor: function (node, color) {
        if (node) {
            node.color = (new cc.Color()).fromHEX(color);
        }
    }


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});