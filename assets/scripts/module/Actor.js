//不只用于继承，还可以当成组件。
//当成组件时，先要通过init()来进行初始化
cc.Class({
    extends: cc.Component,

    properties: {
        _sprIcon: null,
        _lblName: null,
        _lblScore: null,
        _userId: null,
    },

    // use this for initialization
    onLoad: function () {
        console.log('onLoad Actor.js');
        // this.init();
    },

    init: function (node) {

        let targetNode = null;
        if (node) {
            targetNode = node;
            console.log('targetNode_0=');
        } else {
            targetNode = this.node;
            console.log('targetNode_1=');
        }
        try {
            this._sprIcon = targetNode.getChildByName("icon").getComponent("ImageLoader");
        } catch (error) {
            console.log('icon in null');
        }
        try {
            this._lblName = targetNode.getChildByName("name").getComponent(cc.Label);
        } catch (error) {
            console.log('name is null');
        }
        try {
            this._lblScore = targetNode.getChildByName("score").getComponent(cc.Label);
        } catch (error) {
            console.log('score is null ');
        }
    },



    setUserInfo: function (userId, name, score) {
        this._userId = userId;
        console.log('this._userId =', this._userId);
        if (this._sprIcon) {
            this._sprIcon.setUserID(userId);
        } else {
            console.log('this._sprIcon is null');
        }

        if (this._lblName) {
            this._lblName.string = name;
        } else {
            console.log('this._lblName is null');
        }

        if (this._lblScore) {
            this._lblScore.string = score;
        } else {
            console.log('this._lblScore is null');
        }

    },

    setScore: function (score) {
        if (this._lblScore) {
            this._lblScore.string = score;
        } else {
            console.log('this._lblScore is null');
        }
    },

    setName: function (name) {
        if (this._lblName) {
            this._lblName.string = name;
        } else {
            console.log('this._lblName is null');
        }
    },

    setIcon: function () {
        this._userId = userId;
        if (this._sprIcon) {
            this._sprIcon.setUserID(userId);
        } else {
            console.log('this._sprIcon is null');
        }
    },

    setBtnIcon: function (callback) {
        // cc.vv.utils.addClickEvent(this._btnExit, this.node, "PokerRoom", "onBtnExit");
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});