cc.Class({
    extends: cc.Component,

    properties: {
        _sprIcon: null,
        _zhuang: null,
        _ready: null,
        _offline: null,
        _lblName: null,
        _lblScore: null,
        _scoreBg: null,
        _nddayingjia: null,
        _voicemsg: null,

        _chatBubble: null,
        _emoji: null,
        _lastChatTime: -1,

        _userName: "",
        _score: 0,
        _dayingjia: false,
        _isOffline: false,
        _isReady: false,
        _isZhuang: false,
        _userId: null,

        _winScore: null,
        _loseScore: null,
        zhuang: false,
        _defect_icon: null,
        _ting_icon: null,
        _zeRenNode: null, //责任鸡显示
        _zeRenItemCopy: null,
        _autoIcon: null,
    },

    // use this for initialization
    onLoad: function () {
        if (cc.vv == null) {
            return;
        }
        // console.log("初始化座位");
        this.zhuang = false;
        this._isZhuang = false;
        this._sprIcon = this.node.getChildByName("icon").getComponent("ImageLoader");
        this._lblName = this.node.getChildByName("name").getComponent(cc.Label);
        this._lblScore = this.node.getChildByName("score").getComponent(cc.Label);
        var namestr = this.node.name;
        if (this.node.parent.parent.name == "game") {
            this._defect_icon = this.node.getChildByName("defect_icon"); //defect_icon
            this._defect_icon.active = false;
            this._ting_icon = this.node.getChildByName("ting_icon"); //ting_icon
            this._ting_icon.active = false;
            //显示鸡牌节点
            this._zeRenNode = this.node.getChildByName("zeRenNode"); //zeRenNode
            this._zeRenItemCopy = this._zeRenNode.getChildByName("zeRenItemCopy");
            // this._zeRenItemCopy.parent = this.node;
            this._zeRenItemCopy.active = false;
            this._autoIcon = this.node.getChildByName('autoPlay');
        }
        this._voicemsg = this.node.getChildByName("voicemsg");
        if (this._voicemsg) {
            this._voicemsg.active = false;
        }

        if (this._sprIcon && this._sprIcon.getComponent(cc.Button)) {
            cc.vv.utils.addClickEvent(this._sprIcon, this.node, "Seat", "onIconClicked");
        }


        this._offline = this.node.getChildByName("offline");

        this._ready = this.node.getChildByName("ready");

        this._zhuang = this.node.getChildByName("zhuang");
        this._xi = this.node.getChildByName("xi");
        this._nan = this.node.getChildByName("nan");
        this._bei = this.node.getChildByName("bei");

        this._scoreBg = this.node.getChildByName("Z_money_frame");
        this._nddayingjia = this.node.getChildByName("dayingjia");

        this._chatBubble = this.node.getChildByName("ChatBubble");
        if (this._chatBubble != null) {
            this._chatBubble.active = false;
        }

        this._emoji = this.node.getChildByName("emoji");
        if (this._emoji != null) {
            this._emoji.active = false;
        }

        this.refresh();

        if (this._sprIcon && this._userId) {
            this._sprIcon.setUserID(this._userId);
        }
        if (cc.vv.gameNetMgr.isInitZhuang) {
            // cc.log("isInitZhuang","seats");
            cc.vv.gameNetMgr.dispatchEvent('initZhuang', cc.vv.gameNetMgr.button);
        }

    },
    onEnable: function () {
        console.log('seat onEnable');
    },

    onIconClicked: function () {
        var iconSprite = this._sprIcon.node.getComponent(cc.Sprite);
        if (this._userId != null && this._userId > 0) {
            var seat = cc.vv.gameNetMgr.getSeatByID(this._userId);
            if (!seat) {
                console.log("seat is null");
                return;
            }
            var sex = 0;
            if (cc.vv.baseInfoMap) {
                var info = cc.vv.baseInfoMap[this._userId];
                if (info) {
                    sex = info.sex;
                }
            }
            if (cc.vv.gameType.isCardGame()) {
                cc.vv.userinfoShow.show(seat.name, seat.userid, iconSprite, sex, seat.ip);
            } else if (cc.vv.gameType.isCoinGame()) {
                cc.vv.userCoinInfo.show(seat.name, seat.userid, iconSprite, sex, seat.ip, seat.coins);
            }
        }
    },
    setName: function () {
        if (this._lblName != null) {
            console.log('this._userName', this._userName);
            this._lblName.string = this._userName;
        }
    },

    setAutoIcon: function (isShow) {
        if (isShow) {
            this._autoIcon&&(this._autoIcon.active = true);
        } else {
            this._autoIcon&&(this._autoIcon.active = false);
        }
    },

    refresh: function (isShowScore) {
        // console.log('seat refresh this._userName=', this._userName);
        if (this._lblName != null) {
            // console.log('this._userName');
            this._lblName.string = this._userName;
            if (cc.vv.gameType.isCoinGame() && this._userId === 0) {
                console.log("reset userName=''");
                this._userName = '';
                this._lblName.string = this._userName;
            }
        }
        // console.log("refresh this._lblScore=", this._lblScore);
        // console.log("this._userId =" + this._userId);
        if (this._lblScore != null) {
            if (this._userId != null && this._userId > 0) {
                this._lblScore.node.active = true;
                this._lblScore.string = this._score; //对应位置由用户时分数显示
                // console.log("refresh after this._lblScore=", this._lblScore);
            } else {
                this._lblScore.node.active = false; //没有用户时 把分数label隐藏
            }

            if (isShowScore) {
                console.log("isShowScore is true");
                this._lblScore.node.active = false; //没有用户时 把分数label隐藏
            }
        }

        if (this._nddayingjia != null) {
            this._nddayingjia.active = this._dayingjia == true;
        }

        if (this._offline) {
            this._offline.active = this._isOffline && this._userName != "";
        }

        if (this._ready) {
            if (cc.vv.gameType.isCardGame()) {
                this._ready.active = this._isReady /*&& (cc.vv.gameNetMgr.numOfGames > 0);*/
            } else if (cc.vv.gameType.isCoinGame()) {
                console.log('refresh this._ready');
                this._ready.active = this._isReady;
            }
        }

        if (this._zhuang) {
            // if(cc.vv.gameNetMgr.Button == cc.vv.gameNetMgr.get)
            if (!this.zhuang) {
                this._zhuang.active = this._isZhuang;
                this._xi.active = false;
                this._nan.active = false;
                this._bei.active = false;
            }

        }

        // this.node.active = this._userName != null && this._userName != ""; 
        this.node.active = true;
    },

    setInfo: function (name, score, dayingjia, isShowScore) {
        // console.log("setInfo name=" + name, "score=" + score);
        this._userName = cc.vv.gameNetMgr.setName(name, 8, true);
        // this._userName = name;
        if ("string" == typeof (score)) {
            console.log("score is string");
            score = Number(score);
        }
        this._score = score;
        // console.log('score=' + score, 'this._score=' + this._score);
        if (this._score == null) {
            this._score = 0;
        }
        this._dayingjia = dayingjia;

        // if (this._scoreBg != null) {
        //     this._scoreBg.active = this._score != null;
        // }

        var isShow = this._score != null;
        if (this._lblScore != null) {
            this._lblScore.node.active = isShow;
        }
        var str = "";
        this.refresh(isShowScore);
        let i = 5;
        // setInterval(() => {
        //     if (i-- > 0) {
        //         this.setName();
        //     }
        // }, 2000);
    },

    setZhuang: function (value) {
        console.log(this._zhuang);
        if (this._zhuang) {
            this._zhuang.active = value;
            this._isZhuang = value;
            this._nan.active = false;
            this._xi.active = false;
            this._bei.active = false;
            console.log("设置庄家=" + value);
        } else {
            console.log("_zhuang is null");
        }
    },
    /**设置缺牌显示 */
    setDefect_icon: function (defectId, isActive) {
        if (this.node.parent.parent.name == "game") {
            if (isActive === false || defectId == -1) {
                console.log("defectId==" + defectId, "isActive=" + isActive);
                if (this._defect_icon != null) this._defect_icon.active = false;
                return;
            }
            this._defect_icon.getComponent(cc.Sprite).spriteFrame = cc.vv.mahjongmgr.getDefectSpriteFrameById(defectId);
            this._defect_icon.active = true;
        }
    },

    /**设置听牌状态 */
    setTing_icon: function (isActive) {
        // console.log("设置听牌状态");
        if (isActive) {
            if (this._ting_icon) {
                this._ting_icon.active = true;
            }
        } else {
            if (this._ting_icon) {
                this._ting_icon.active = false;
            }
        }
    },

    /**设置责任鸡 */
    setZeRenItem: function (rooterList) {
        if (!this._zeRenNode) {
            return;
        }
        console.log("鸡数目-》" + this._zeRenNode.childrenCount);
        this._zeRenNode.removeAllChildren();

        if (!rooterList || rooterList == null || rooterList == undefined) {
            return;
        }
        for (var i = 0, len = rooterList.length; i < len; i++) {
            var node = cc.instantiate(this._zeRenItemCopy);
            this._zeRenNode.addChild(node);
            // node.parent = this._zeRenNode;
            node.name = "zeRen" + rooterList[i];
            node.setPosition(this._zeRenItemCopy.x, this._zeRenItemCopy.y - 30 * i);
            var show_text = node.getChildByName("show_text").getComponent(cc.Label);
            var show_bg = node.getChildByName("bg").getComponent(cc.Sprite);
            show_bg.spriteFrame = cc.vv.mahjongmgr.getOneShowBgSprFrameById(rooterList[i]);
            var str = "";
            switch (parseInt(rooterList[i])) {
                case 0:
                    str = "冲锋金鸡";
                    break;
                case 1:
                    str = "冲锋银鸡";
                    break;
                case 2:
                    str = "冲锋乌鸡";
                    break;
                case 3:
                    str = "冲锋挖鸡";
                    break;
                case 4:
                    str = "责任金鸡";
                    break;
                case 5:
                    str = "责任银鸡";
                    break;
                case 6:
                    str = "责任乌鸡";
                    break;
                case 7:
                    str = "责任挖鸡";
                    break;
            }
            show_text.string = str;
            node.active = true;
        }
    },

    getZhuang: function () {
        if (this._zhuang) {
            return this._zhuang.active;
        }
        return false;
    },

    setweizhi: function (index) {
        this.zhuang = true;
        if (this._xi && this._nan && this._bei) {
            switch (index) {
                case 1:
                    this._nan.active = true;
                    this._xi.active = false;
                    this._bei.active = false;
                    this._zhuang.active = false;
                    break;
                case 2:
                    this._xi.active = true;
                    this._nan.active = false;
                    this._bei.active = false;
                    this._zhuang.active = false;
                    break;
                case 3:
                    this._bei.active = true;
                    this._nan.active = false;
                    this._xi.active = false;
                    this._zhuang.active = false;
                    break;
                case -1:
                    this._bei.active = true;
                    this._nan.active = false;
                    this._xi.active = false;
                    this._zhuang.active = false;
                    break;
                case -2:
                    this._xi.active = true;
                    this._nan.active = false;
                    this._bei.active = false;
                    this._zhuang.active = false;
                    break;
                case -3:
                    this._nan.active = true;
                    this._xi.active = false;
                    this._bei.active = false;
                    this._zhuang.active = false;
                    break;
                case 100:
                    this._nan.active = false;
                    this._xi.active = false;
                    this._bei.active = false;
                    this._zhuang.active = false;
                    console.log("设置庄不显示");
                    break;
            }

        }
    },
    setReady: function (isReady) {
        // console.log('set ready');
        this._isReady = isReady;
        if (cc.vv.gameType.isCardGame()) {
            if (this._ready) {
                this._ready.active = this._isReady
            }
        } else if (cc.vv.gameType.isCoinGame()) {
            console.log('enter coinGame');
            if (this._ready) {
                this._ready.active = this._isReady;
            }
        }
    },

    setID: function (id) {
        var idNode = this.node.getChildByName("id");
        if (idNode) {
            var lbl = idNode.getComponent(cc.Label);
            lbl.string = "ID:" + id;
        }

        this._userId = id;
        if (this._sprIcon) {
            this._sprIcon.setUserID(id);
        }
    },
    seticon: function () {
        if (this._sprIcon) {
            this._sprIcon.refreshSpriteFrame();
        }
    },
    setOffline: function (isOffline) {
        this._isOffline = isOffline;
        if (this._offline) {
            this._offline.active = this._isOffline && this._userName != "";
        }
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
    },

    voiceMsg: function (show) {
        if (this._voicemsg) {
            this._voicemsg.active = show;
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this._lastChatTime > 0) {
            this._lastChatTime -= dt;
            if (this._lastChatTime < 0) {
                this._chatBubble.active = false;
                this._emoji.active = false;
                this._emoji.getComponent(cc.Animation).stop();
            }
        }
    },
});