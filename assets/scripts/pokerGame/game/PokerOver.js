cc.Class({
    extends: cc.Component,

    properties: {
        _seats: cc.Node,
        _seatModel: cc.Node,
        _thisNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.initView();
        this.addLoacalEvent();
    },

    initView: function () {
        console.log('initView PokerOver.js');
        this._thisNode = cc.find('Canvas/pokerOver');
        this._seats = cc.find('Canvas/pokerOver/seats');
        this._seatModel = this._seats.getChildByName('user');
        this._thisNode.active = false;
        this._seats.removeAllChildren();
        let share = cc.find("Canvas/pokerOver/share");
        cc.vv.utils.addClickEvent(share, this.node, "PokerOver", "onWeiXin");
        let exit = cc.find("Canvas/pokerOver/exit");
        cc.vv.utils.addClickEvent(exit, this.node, "PokerOver", "onExit");
        this._thisNode.active = false;
    },
    addLoacalEvent: function () {
        this.node.on('game_over', (event) => {
            let data = event.detail;
            console.log('data', data);
            this._thisNode.active = true;
            this.initViewByData(data);
        });
    },

    initViewByData: function (seatData) {
        let size = cc.vv.setPeople.getMenPoker();
        this._seats.removeAllChildren();
        let keys = Object.keys(seatData);
        for (let i = 0; i < size; i++) {
            let child = cc.instantiate(this._seatModel);
            let key = keys[i];
            this.initItem(child, { userId: key, score: seatData[key].score, name: seatData[key].name });
            this._seats.addChild(child);
        }
    },

    initItem: function (node, data) {
        // let userInfo = cc.vv.gameNetMgr.getSeatByID(data.userId);
        let icon = node.getChildByName('icon');
        let iconScript = icon.getComponent('ImageLoader');
        iconScript.setUserID(data.userId);
        let name = node.getChildByName('name');
        let nameLabel = name.getComponent(cc.Label);
        nameLabel.string = data.name;
        let score = node.getChildByName('score');
        let scoreLabel = score.getComponent(cc.Label);
        scoreLabel.string = data.score;
    },

    onWeiXin: function (event) {
        console.log('weiXin');

    },

    onExit: function (event) {
        console.log('onExit');
        cc.director.loadScene("hall");
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
