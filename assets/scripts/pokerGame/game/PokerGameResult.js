
cc.Class({
    extends: cc.Component,

    properties: {
        //指向Canvas/pokerResult节点
        _thisNode: cc.Node,
        //显示输赢的图标
        _resultIcons: cc.Node,
        //管理成员节点
        _seats: cc.Node,
        //准备下一局节点
        _btnReady: cc.Node,
        //ScorlView组件节点
        _seatScrolView: cc.Node,
        //ScorlView组件中的模板节点
        _seatScoreModel: cc.Node,
        _seatsData: null,
        _seatsUserArr: null,
    },

    // use this for initialization
    onLoad: function () {
        console.log('onLoad PokerGameResult.js')
        this.initView();
        this.addLocalEvent();
    },

    //添加本地事件
    addLocalEvent: function () {
        this.node.on('game_over', (event) => {
            console.log('game_over data=', event.detail);
            let data = event.detail;
        });

        this.node.on('play_out', (event) => {
            console.log('play_out data= pokerGameResult', event.detail);
            let data = event.detail;
            this._seatsData = data;
            // console.log('userDetail', this._seatsData.userDetail);
        });

        //显示
        this.node.on('show_result', (event) => {
            // console.log('show_result=data', event.detail);
            this._thisNode.active = true;
            this.getSeatsIdxArr();
            this.initScoreScrolView(this._seatsData);
            this.initResultIcons(this._seatsData);
        });
        //显示
        this.node.on('game_over', (event) => {
            console.log('game_over=data', event.detail);
            this._thisNode.active = false;
            // this.getSeatsIdxArr();
            // this.initScoreScrolView(this._seatsData);
            // this.initResultIcons(this._seatsData);
        });

    },

    getSeatsIdxArr: function () {
        this._seatsUserArr = [];
        let size = cc.vv.setPeople.getMenPoker();
        let seatIdx = cc.vv.gameNetMgr.seatIndex;
        for (let i = 0; i < size; i++) {
            let userId = cc.vv.gameNetMgr.seats[seatIdx++ % size].userid;
            this._seatsUserArr.push(userId);
            // console.log('child.userid=', userId);
        }
        // console.log('_seatsUserArr', this._seatsUserArr);
    },

    initView: function () {
        this._seats = cc.find('Canvas/pokerResult/seats');
        this._thisNode = cc.find('Canvas/pokerResult');
        this._btnReady = cc.find('Canvas/pokerResult/readyBtn');
        cc.vv.utils.addClickEvent(this._btnReady, this.node, "PokerGameResult", "onBtnReady");
        this._seatScrolView = cc.find('ScoreScrollView/view/content', this._seats);
        this._resultIcons = cc.find('result', this._thisNode);
        this._seatScoreModel = cc.find('user', this._seatScrolView);
        this._seatScrolView.removeAllChildren();
        this._thisNode.active = false;
        // this.initScoreScrolView();
        // this.initResultIcons();
    },

    //初始化并显示每个成员的分数与牌型
    initScoreScrolView: function (seatsData) {
        console.log('initScoreScrolView', seatsData);
        this._seatScrolView.removeAllChildren();
        let size = cc.vv.setPeople.getMenPoker();
        let userDetail = seatsData.userDetail;
        let userScore = seatsData.userScore;
        for (let i = 0; i < size; i++) {
            let newItem = cc.instantiate(this._seatScoreModel);
            console.lo
            //script用于显示数据
            let script = newItem.getComponent('GameResultItem');
            let key = this._seatsUserArr[i];
            if (key === 0) {
                console.log('key =0');
                return;
            }
            let userInfo = cc.vv.gameNetMgr.getSeatByID(key);
            // userInfo.score += userScore[key];
            let userResultData = { pokers: userDetail[key], userInfo: userInfo, score: userScore[key] };
            // console.log('key' + key, userResultData);
            script.initViewByData(userResultData);
            this._seatScrolView.addChild(newItem);
        }
    },

    //显示输赢图片
    initResultIcons: function (seatsData) {
        // console.log('initResultIcons', seatsData);
        let lose = false, win = false, pin = false;
        //取得自己的id
        let userId = cc.vv.userMgr.userId;
        let seatScore = seatsData.userScore[userId];
        // console.log('initResultIcons seatScore', seatScore);
        if (seatScore > 0) {
            win = true;
        } else if (seatScore == 0) {
            pin = true;
        } else {
            lose = true;
        }
        this._resultIcons.getChildByName('gamewin').active = win;
        this._resultIcons.getChildByName('gamepin').active = pin;
        this._resultIcons.getChildByName('gamelose').active = lose;
    },

    // addLocalEvent: function () {
    //     this.node.on('game_over', (event) => {
    //         console.log('game_over data=', event.detail);
    //         this.showSeatInfo(event.detail);
    //     });
    // },

    showScoreReuslt: function (item, data) {
        let iconNode = item.getChildByName('icon');
        const icon = iconNode.getComponent("ImageLoader");
        icon.setUserID(data.userId);
        let scoreNode = item.getChildByName('score');
        let score = scoreNode.getComponent(cc.Label);
        score.string = data.score;
    },

    //显示玩家基本信息
    showSeatInfo: function (seatData) {
        this._thisNode.active = true;
        this._seats.children.forEach((item, idx) => {
            this.showScoreReuslt(item, seatData[idx]);
        });
    },

    //准备下一局
    onBtnReady: function (event) {
        console.log('onBtnReady event', event);
        cc.vv.net.send('ready');
        this._thisNode.active = false;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
