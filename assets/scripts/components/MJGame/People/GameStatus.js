cc.Class({
    extends: cc.Component,

    properties: {
        _curStatus: null,
        _nowStatus: null,
    },

    // use this for initialization
    init: function () {
        console.log("init cc.vv.gameStatusHandle");
        cc.vv.GameStatus = {
            DINGQUE: 0, //定缺
            PYAYING: 1, // 开始
            GAMEOVER: 2, //游戏结束
            IDLE: 3, //空闲
        };
    },

    isIdle: function () {
        return cc.vv.gameNetMgr.gamestate == cc.vv.GameStatus.IDLE;
    },

    isDingQue: function () {
        return cc.vv.gameNetMgr.gamestate == cc.vv.GameStatus.DINGQUE;
    },

    isPlaying: function () {
        return cc.vv.gameNetMgr.gamestate == cc.vv.GameStatus.PYAYING;
    },

    isGameOver: function () {
        return cc.vv.gameNetMgr.gamestate == cc.vv.GameStatus.GAMEOVER;
    },

    //执行对应状态的回调数据
    runStatusAction: function (idle, dingQue, playing, gameOver) {
        switch (cc.vv.gameNetMgr.gamestate) {
            case cc.vv.GameStatus.IDLE:
                this.callBack(idle);
                break;
            case cc.vv.GameStatus.DINGQUE:
                this.callBack(dingQue);
                break;
            case cc.vv.GameStatus.PYAYING:
                this.callBack(playing);
                break;
            case cc.vv.GameStatus.GAMEOVER:
                this.callBack(gameOver);
                break;
        }
    },

    callBack: function (call) {
        if (typeof (call) == "function") {
            call();
            return;
        }
        console.log("call is " + typeof (call));
    }

});