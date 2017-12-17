cc.Class({
    extends: cc.Component,

    properties: {
        //头像
        icon: cc.Node,
        //分线
        score: cc.Label,
        //名字
        userName: cc.Label,
        //扑克节点
        pokerNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {

    },

    //显示数据
    initViewByData: function (data) {
        // console.log('initViewByData', data);
        this.initUserInfo(data.userInfo, data.score);
        try {
            this.initPokerSd(data.pokers[0].pai);
            this.initPokerZd(data.pokers[1].pai);
            this.initPokerWd(data.pokers[2].pai);
        } catch (error) {

        }
    },

    //设置用户信息
    initUserInfo: function (data, score) {
        console.log('initUserInfo', data);
        const iconScript = this.icon.getComponent("ImageLoader");
        iconScript.setUserID(data.userid);
        this.score.string = score;
        this.userName.string = data.name;
    },

    //显示尾道
    initPokerWd: function (data) {
        for (let i = 8, j = 0; i < 13; i++ , j++) {
            let item = this.pokerNode.getChildByName('' + i);
            if (item) {
                let sprite = item.getComponent(cc.Sprite);
                let spriteFrame = G.pokerSrcMng.getSpriteFrameByPokerID(data[j]);
                sprite.spriteFrame = spriteFrame;
            } else {
                console.log('error ');
            }
        }
    },

    //显示中道
    initPokerZd: function (data) {
        for (let i = 3, j = 0; i < 8; i++ , j++) {
            let item = this.pokerNode.getChildByName('' + i);
            if (item) {
                let sprite = item.getComponent(cc.Sprite);
                let spriteFrame = G.pokerSrcMng.getSpriteFrameByPokerID(data[j]);
                sprite.spriteFrame = spriteFrame;
            } else {
                console.log('error ');
            }
        }
    },

    //显示首道
    initPokerSd: function (data) {
        for (let i = 0, j = 0; i < 4; i++ , j++) {
            let item = this.pokerNode.getChildByName('' + i);
            if (item) {
                let sprite = item.getComponent(cc.Sprite);
                let spriteFrame = G.pokerSrcMng.getSpriteFrameByPokerID(data[j]);
                sprite.spriteFrame = spriteFrame;
            } else {
                console.log('error ');
            }
        }
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
