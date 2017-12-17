cc.Class({
    extends: cc.Component,
    properties: {
        Atlasshaizi: {
            default: null,
            type: cc.SpriteAtlas
        },
        _arrow: null,
        _pointerArr: null,
        _pointer: null,
        _pointerbg: null,
        _timeLabel: null,
        _time: -1,
        _alertTime: -1,
        isStop: true,
        alarm_auId: null,
        isOne: false,
        shaizi1: null,
        shaizi2: null,
        animation: null,
        point1: null,
        point2: null,
        turn_index: null,
    },

    // use this for initialization
    onLoad: function () {
        
        return;
        var gameChild = this.node.getChildByName("game");
        this._arrow = gameChild.getChildByName("arrow_wz");
        this._pointerbg = this._arrow.getChildByName("pointerbg");
        this._pointer = this._arrow.getChildByName("pointer");
        this.initPointerArr();
        this._timeLabel = this._arrow.getChildByName("lblTime").getComponent(cc.Label);
        this._timeLabel.string = "00";
        this._arrow.getChildByName("lblTime").active = false;
        this.shaizi1 = this._arrow.getChildByName("shaizi1").getComponent(cc.Sprite);
        this.shaizi2 = this._arrow.getChildByName("shaizi2").getComponent(cc.Sprite);
        this.animation = this._arrow.getChildByName("shaizi").getComponent(cc.Animation);
        // this.shaizi1.node.active = false;
        // this.shaizi2.node.active = false;
        // this.animation.node.active = false;
        var self = this;
        // if(cc.vv.gameNetMgr.isGameSync)
        // {
        //     this.initPointer();            
        //     self._arrow.getChildByName("shaizi").active = false;
        // }

        this.node.on('show_defect_card_bre', function (data) {
            console.log('show_defect_card_bre /TimePointer.js', data.detail);
            self._arrow.active = true;
            self.shaizi1.node.active = false;
            self.shaizi2.node.active = false;
            self._arrow.getChildByName("lblTime").active = true;
        });

        this.node.on('game_begin', function (data) {
            console.log("game_begin of TimePointer");
            self._arrow.active = true;
            self.shaizi1.node.active = false;
            self.shaizi2.node.active = false;
            self._timeLabel.string = "00";
            self._arrow.getChildByName("lblTime").active = true;
            // self.initPointer();
        });

        this.node.on("game_sync", function (data) {
            console.log("game_sync");
            // self._arrow.active = true;
            if (cc.vv.gameStatusHandle.isPlaying()) {
                var isRunAction = true;
                console.log("game_sync of isPlaying");
                self._arrow.getChildByName("lblTime").active = true;
                console.log(self._arrow.getChildByName("lblTime"), self._timeLabel);
                self._timeLabel.string = "00";
                self.initPointer(isRunAction);
            } else {
                if (cc.vv.gameStatusHandle.isDingQue()) {
                    self._arrow.getChildByName("lblTime").active = true;
                    self._timeLabel.string = "00";
                    // self.initPointer();
                }
            }
            self._arrow.getChildByName("shaizi").active = false;
        });

        //用于最后一家
        this.node.on('banker_push', function (data) {
            console.log("banker_push of TimePointer");
            data = data.detail;
            self._arrow.active = true;
            self.point1 = data.point1;
            self.point2 = data.point2;
            console.log("banker_push point1 =" + self.point1 + "self" + self.point2);
            self.animation.node.active = true;
            self.shaizi1.node.active = false;
            self.shaizi2.node.active = false;
            self.playAnims(cc.vv.gameNetMgr.shaizival);
            cc.vv.gameNetMgr.isshaizi = null;
        });

        this.node.on('game_chupai', function (data) {
            console.log("game_chupai of TimePointer");
            self._time = 10;
            self._alertTime = 3;
            self._arrow.active = true;
            // var turn = cc.vv.gameNetMgr.turn;
            // self.turn_index=cc.vv.gameNetMgr.getLocalIndex(turn);
            var isRunAction = true;
            self.initPointer(isRunAction);
        });

        this.node.on('refresh_sync_infs', function (data) {
            console.log("refresh_sync_infs of TimePointer.js");
            var func1 = function () { //dingQue状态
                self._arrow.active = true;
            }
            var func2 = function () { //playing状态
                self._arrow.active = true;
                var isRunAction = true;
                self.initPointer(isRunAction);
                self._arrow.getChildByName("shaizi").active = false;
                self._arrow.getChildByName("shaizi1").active = false;
                self._arrow.getChildByName("shaizi2").active = false;
            }
            cc.vv.gameStatusHandle.runStatusAction(null, func1, func2, null);
        });

        this.node.on("paidun_push", function (data) {
            console.log("paidun_push....." + data);
            data = data.detail;
            self.point1 = data.point1;
            self.point2 = data.point2;
            self._arrow.getChildByName("lblTime").active = false;
            self._arrow.getChildByName("shaizi").active = true;
            self._arrow.getChildByName("shaizi1").active = false;
            self._arrow.getChildByName("shaizi2").active = false;
            self.playAnims(cc.vv.gameNetMgr.paiDuPos);
        });

        this.node.on("stop_alarm_push", function (data) {
            console.log("stop push");
            self.setWarmingSound(true);
        });

        this.node.on("game_over", function (data) {
            console.log("over push");
            self._time = 0;
            self._timeLabel.string = "00";
            self.setWarmingSound(true);
            self.stopAllActions();
            self.hidePointerArr();
            // self.turn_index!=null&&self.refreshAction(self.turn_index,true);
            // self.turn_index=null;
        });

        // this.node.on('is_mai_or_ding_di',function(data){
        //     console.log("is_mai_or_ding_di of TimePointer.js");
        //     // self._arrow.active = false;
        //     console.log("shaizi is " + self._arrow.getChildByName("shaizi").active)
        //     self._timeLabel.string = "00";
        //     if(self._arrow.active == false)
        //     {
        //         self._arrow.active = true;
        //     }

        // });
    },

    setWarmingSound: function (isStop) {
        this._alertTime = -1;
        if (this.alarm_auId != null) {
            cc.vv.audioMgr.playStop(this.alarm_auId);
        }
    },
    playshaizi: function () {

    },
    playAnims: function (data) {
        var self = this;
        this.animation.play("shaizi");
        this.animation.on('finished', self.shaizi, this);
    },
    shaizi: function () {
        console.log("s1 = " + this.point1 + " s2 = " + this.point2);
        this._arrow.getChildByName("shaizi").active = false;
        this.shaizi1.spriteFrame = cc.vv.mahjongmgr.getshaiziSpriteFrame(this.point1);
        this.shaizi2.spriteFrame = cc.vv.mahjongmgr.getshaiziSpriteFrame(this.point2);
        this.shaizi1.node.active = true;
        this.shaizi2.node.active = true;
    },

    initPointerArr: function () {
        this._pointerArr = [];
        for (var i = 0; i < this._pointer.children.length; ++i) {
            this._pointer.children[i].active = false;
            if (cc.vv.setPeople.hide_single(i)) { //Ϊ1.3����
                // cc.log("initPointerArr","i="+i);
                continue;
            }
            this._pointerArr.push(this._pointer.children[i]);
        }
    },
    hidePointerArr: function () {
        console.log("hidePointerArr ");
        this._pointerArr.forEach((e) => {
            // console.log("element",e);
            e.active = false;
        });
    },

    initPointer: function (isRunAction) {
        if (cc.vv == null) {
            console.log("TimePointer initPointer cc.vv==null");
            return;
        }
        if (this.shaizi1) {
            if (this.shaizi1.node.active) {
                this.shaizi1.node.active = false;
                this.shaizi2.node.active = false;
            }
        }

        this._arrow.getChildByName("lblTime").active = true;
        var turn = cc.vv.gameNetMgr.turn;
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(turn);

        for (var i = 0; i < this._pointerArr.length; ++i) {

            this._pointerArr[i].active = i == localIndex;
        }
        if (isRunAction) {
            console.log("runAction of initPointer");
            this.turn_index = localIndex;
            this.refreshAction(localIndex);
        }
    },

    refreshAction: function (turn_index, isStop) {
        console.log("refreshAction", turn_index + " " + isStop);
        var turn = this._pointerArr[turn_index];
        var action = cc.sequence(
            cc.fadeOut(0.5),
            // cc.delayTime(0.1),
            cc.fadeIn(0.5),
            // cc.delayTime(0.1),
        ).repeatForever();

        if (turn != undefined) {
            if (isStop) {
                turn.stopAction(action);
                return;
            }
            //先停止并移除动作
            turn.stopAllActions();
            turn.runAction(action);
        }
    },

    stopAllActions: function () {
        console.log("stopAllAction");
        for (let i = 0; i < this._pointerArr.length; ++i) {
            var turn = this._pointerArr[i];
            turn.stopAllActions()
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this._time > 0) {
            this._time -= dt;
            if (this._alertTime > 0 && this._time < this._alertTime) {
                this.alarm_auId = cc.vv.audioMgr.playSFX("timeup_alarm.mp3");
                // console.log("---------------------------alarm_auid="+this.alarm_auId);
                this._alertTime = -1;
            }
            var pre = "";
            if (this._time < 0) {
                this._time = 0;
            }

            var t = Math.ceil(this._time);
            if (t < 10) {
                pre = "0";
            }
            this._timeLabel.string = pre + t;
        }
    },
});