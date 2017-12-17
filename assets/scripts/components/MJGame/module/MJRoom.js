const CompoUtil = require('GetComponent');
cc.Class({
    extends: cc.Component,

    properties: {
        //显示房间信息
        lblRoomNo: {
            default: null,
            type: cc.Label
        },
        //显示人数信息
        _peopleType: cc.Label,
        //显示局数信息
        _round: cc.Label,
        //13水的离开按钮
        _exitPoker: cc.Node,
        _seats: [],
        _seatsNode: null,
        _seats2: [],
        _timeLabel: null,
        _dayLabel: null,
        _voiceMsgQueue: [],
        _lastPlayingSeat: null,
        _playingSeat: null,
        _lastPlayTime: null,
        btnWeichat: null,
        btnStart: null,

    },

    // use this for initialization
    onLoad: function () {
        if (cc.vv == null) {
            return;
        }

        this.initView();
        this.initSeats();
        this.initEventHandlers();

        this.initRoomInfo();
    },

    //设置房间信息
    initRoomInfo: function () {
        let info = cc.vv.gameNetMgr.conf;
        let data = {
            roomNo: cc.vv.gameNetMgr.roomId,
            difen: cc.vv.setPeople.getMenPoker() + '人',
            zhushu: "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局",
        }
        let roomInfo = cc.find('Canvas/roomInfo');
        if (roomInfo) {
            let script = CompoUtil.getScript(roomInfo, 'RoomInfo');
            script.setInfo(data);
        }
    },

    initView: function () {
        // 准许页面的桌面信息
        var prepare = this.node.getChildByName("prepare");
        var seats = prepare.getChildByName("seats");
        this._seatsNode = seats;
        let seatIdxArr = cc.vv.setPeople.getMenIdxArr();
        for (var i = 0; i < seatIdxArr.length; ++i) {
            // //修改成二人 or 三人
            // if (cc.vv.setPeople.hide_single(i)) {
            //     // cc.log("MJRoom","hide i="+i);
            //     continue;
            // }
            let child = seats.children[seatIdxArr[i]];
            this._seats.push(child.getComponent("Seat"));
            // this._seats.push(seats.children[i].getComponent("Seat"));
        }

        this.refreshBtns();
        const cardInfo = cc.find("Canvas/infobar/Z_room_txt/cardInfo");
        const coinInfo = cc.find('Canvas/infobar/Z_room_txt/coinInfo');
        cardInfo.active = false;
        coinInfo.active = false;
        if (cc.vv.gameType.isCardGame()) {
            cardInfo.active = true;
            this.lblRoomNo = cc.find("Canvas/infobar/Z_room_txt/cardInfo/No").getComponent(cc.Label);
            this._peopleType = cc.find('Canvas/infobar/Z_room_txt/cardInfo/people').getComponent(cc.Label);
            this._round = cc.find('Canvas/infobar/Z_room_txt/cardInfo/round').getComponent(cc.Label);
            console.log('set room info');
            //设置房号，人数跟局数
            this.lblRoomNo.string = cc.vv.gameNetMgr.roomId;
            this._peopleType.string = cc.vv.setPeople.getMenPoker() + '人';
            this._round.string = "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";
        } else if (cc.vv.gameType.isCoinGame()) {
            coinInfo.active = true;
            const info = cc.find('Canvas/infobar/Z_room_txt/coinInfo/info').getComponent(cc.Label);
            const configSet = cc.vv.gameCoinNetMgr.configSet;
            info.string = '桌子号:' + (cc.vv.gameNetMgr.coinConfig.tableId);
        }
        this._timeLabel = cc.find("Canvas/infobar/time").getComponent(cc.Label);
        this._dayLabel = cc.find("Canvas/infobar/day").getComponent(cc.Label);
        //设置poker跟点击事件
        this._exitPoker = cc.find("Canvas/btn_exit_poker");
        if (this._exitPoker) {
            cc.vv.utils.addClickEvent(this._exitPoker, this.node, "MJRoom", "onBtnExitPoker");
        }
        //game 页面信息
        var gameChild = this.node.getChildByName("game");
        // //确定是几个麻将
        // var sides = cc.vv.setPeople.getSeats();
        // for (var i = 0; i < sides.length; ++i) {
        //     var sideNode = gameChild.getChildByName(sides[i]);
        //     var seat = sideNode.getChildByName("seat");
        //     this._seats2.push(seat.getComponent("Seat"));
        // }

        var btnWeichat = cc.find("Canvas/prepare/btnWeichat");
        if (btnWeichat) {
            cc.vv.utils.addClickEvent(btnWeichat, this.node, "MJRoom", "onBtnWeichatClicked");
        }

        if (cc.vv.gameNetMgr.isInitZhuang) {
            console.log("initZhuang of MJRoom.js");
            cc.vv.gameNetMgr.dispatchEvent('initZhuang', cc.vv.gameNetMgr.button);
        }
    },

    refreshBtns: function () {
        console.log('refreshBtns');
        var prepare = this.node.getChildByName("prepare");
        var btnExit = prepare.getChildByName("btnExit");
        var btnDispress = prepare.getChildByName("btnDissolve");
        var btnBack = prepare.getChildByName("btnBack");
        const btnStart = this.btnStart = prepare.getChildByName('btnStart');
        const btnWeichat = this.btnWeichat = prepare.getChildByName("btnWeichat");

        if (btnDispress) {
            cc.vv.utils.addClickEvent(btnDispress, this.node, "MJRoom", "onClickDissolve");
        }
        if (btnExit) {
            cc.vv.utils.addClickEvent(btnExit, this.node, "MJRoom", "onClickExit");
        }
        if (btnBack) {
            cc.vv.utils.addClickEvent(btnBack, this.node, "MJRoom", "onClickBack");
        }
        var isIdle = cc.vv.gameNetMgr.numOfGames == 0;
        btnExit.active = false /*!cc.vv.gameNetMgr.isOwner() && isIdle*/ ;
        btnDispress.active = false /*cc.vv.gameNetMgr.isOwner() && isIdle*/ ;
        let myseat = cc.vv.gameNetMgr.seats[cc.vv.gameNetMgr.seatIndex];
        this.setReadyStatu();
        btnWeichat.active = true;
        if (cc.vv.gameStatusHandle.isPlaying()) {
            btnWeichat.active = false;
        }
        btnBack.active = false;
        cc.vv.utils.addClickEvent(btnStart, this.node, "MJRoom", "onClickStart");
    },

    onClickStart: function (event) {
        console.log('onClickStart ok=');
        cc.vv.net.send('ready');
    },

    //设置准备按键
    setReadyStatu: function () {
        console.log('setReadyStatu');
        let myseat = cc.vv.gameNetMgr.seats[cc.vv.gameNetMgr.seatIndex];
        let ready = false;
        if (myseat) {
            ready = myseat.ready;
        }
        //如果为空闲时,且没有准备
        console.log('ready=', ready);
        this.btnStart.active = ready ? false : cc.vv.gameStatusHandle.isIdle();
    },

    setBtnBackPosition: function (isReady) {
        console.log('setBtnBackPosition');
        const btnWeichat = this.btnWeichat;
        const btnStart = this.btnStart;
        if (isReady === undefined) {
            try {
                const idx = cc.vv.gameNetMgr.seatIndex;
                isReady = cc.vv.gameNetMgr.seats[idx].ready;
            } catch (error) {
                isReady = false;
            }
        }
        if (isReady) {
            btnWeichat.setPosition(cc.v2(0, 0));
            // btnStart.active = false;
        } else {
            btnWeichat.setPosition(cc.v2(-160, 0));
            // btnStart.active = true;

        }
    },

    /**显示报听 */
    showBaoTingIcon: function () {
        var baoTingDatas = cc.vv.baoTingDatas;
        var len = 4;
        //设置成2人
        if (cc.vv.setPeople.isERMJ()) {
            len = 2;
        }
        //设置成3人
        if (cc.vv.setPeople.isThreeMJ()) {
            len = 3;
        }
        for (var i = 0; i < len; i++) {
            if (baoTingDatas[i] == true) {
                var localIdx = cc.vv.gameNetMgr.getLocalIndex(i);
                this._seats2[(localIdx)].setTing_icon(true);
            } else {
                var localIdx = cc.vv.gameNetMgr.getLocalIndex(i);
                this._seats2[(localIdx)].setTing_icon(false);
            }
        }
    },

    /**显示自己的缺牌 */
    showDefectUs: function () {
        var defectType = parseInt(cc.vv.defectType);
        this._seats2[(0)].setDefect_icon(defectType);
        switch (defectType) {
            case 3:
                console.log("defect wan");
                break;
            case 2:
                console.log("defect tiao");
                break;
            case 1:
                console.log("defect tong");
                break;
        }
    },

    /**显示是否托管 */
    showAutoIcon: function () {
        const autoArr = cc.vv.gameNetMgr.autoPlays;
        console.log('showAutoIcon', autoArr);
        const len = cc.vv.setPeople.getMen();
        for (let i = 0; i < len; i++) {
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(i);
            this._seats2[(localIdx)].setAutoIcon(autoArr[i]);
        }
    },

    /**显示所有人的缺牌 */
    showDefectAll: function () {
        var defectTypes = cc.vv.defectTypes;
        var len = 4;
        //设置成2人
        if (cc.vv.setPeople.isERMJ()) {
            len = 2;
        }
        //设置成3人
        if (cc.vv.setPeople.isThreeMJ()) {
            len = 3;
        }
        for (var i = 0; i < len; i++) {
            console.log("seatId = " + (i) + " selectDefect=" + defectTypes[i]);
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(i);
            this._seats2[(localIdx)].setDefect_icon(defectTypes[i]);
        }
    },

    hideDEfectAll: function () {
        for (let i = 0; i < this._seats2.length; i++) {
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(i);
            this._seats2[localIdx].setDefect_icon(defectTypes[i]);
        }
    },

    initEventHandlers: function () {
        var self = this;
        //在扑克中，这是开始的标志
        this.node.on('game_holds', function (data) {
            console.log("game_holds of MJRoom " + data.detail);
            var seats = cc.vv.gameNetMgr.seats;
            for (let i = 0; i < seats.length; i++) {
                let item = seats[i];
                //把准备图标隐藏，把好友
                item.ready = false;
                self.initSingleSeat(seats[i]);
            }
            //游戏开始，隐藏邀请按键
            self.btnWeichat.active = false;
            self.btnStart.active = false;
        });

        this.node.on('new_user', function (data) {
            console.log("new_user of MJRoom initSingleSeat" + data.detail);
            self.initSingleSeat(data.detail);
        });

        // this.node.on('game_status', function (data) {
        //     console.log("game_status" + data.detail);
        //     let pokerResultNode = self.node.getChildByName('pokerResult');
        //     console.log('pokerResultNode active=', pokerResultNode.active);
        //     //说明在小结算，就不显示桌子上的准备按钮
        //     if (!pokerResultNode.active) {
        //         self.setReadyStatu();
        //     } else {
        //     }
        // });

        this.node.on('user_state_changed', function (data) {
            console.log("user_state_changed of MJRoom initSingleSeat", data.detail);
            self.initSingleSeat(data.detail);
            // const seatData = data.detail;

        });

        this.node.on('user_state_changedicon', function (data) {
            console.log("user_state_changedicon of MJRoom initSingleSeat" + data.detail);
            self.initSingleSeat(data.detail, true);
        });

        // this.node.on('paidun_push', function (data) {
        //     console.log("取消上局显示的鸡");
        //     // 取消上局显示的鸡
        //     for (var i = 0, len = self._seats2.length; i < len; i++) {
        //         self._seats2[(i)].setZeRenItem(null);
        //     }
        // });

        this.node.on('game_begin', function (data) {
            console.log("game_begin of MJRoom");
            // self.refreshBtns();
            // // 取消上局显示的鸡
            // for (var i = 0, len = self._seats2.length; i < len; i++) {
            //     self._seats2[(i)].setZeRenItem(null);
            // }
        });

        // this.node.on('initZhuang', function (data) {
        //     console.log("initZhuang of MJRoom type=" + data.detail);
        //     self.initZhuang(data.detail);
        // });
        // /**通知自己显示缺牌 */
        // this.node.on("show_us_defect", function (data) {
        //     console.log("show_us_defect of MJRoom");
        //     console.log("cc.vv.defectType=" + cc.vv.defectType);
        //     // self.showDefectUs();
        // });
        // /**通知显示每人缺牌 */
        // this.node.on("show_all_defect", function (data) {
        //     console.log("show_all_defect of MJRoom");
        //     self.showDefectAll();
        // });

        // this.node.on("show_auto_play_icon", function (data) {
        //     console.log("show_auto_play_icon of MJRoom");
        //     self.showAutoIcon();
        // });

        // /**通知显示报听 */
        // this.node.on("baoting_icon_push_notify", function (data) {
        //     console.log("通知显示报听 of MJRoom");
        //     console.log("cc.vv.baoTingDatas=" + cc.vv.baoTingDatas);
        //     self.showBaoTingIcon();
        // });

        // /**责任鸡等icon附近显示 */
        // this.node.on('zerenji_push_img', function (data) {
        //     console.log("责任鸡等icon附近显示->" + data.detail);
        //     var seatId = data.detail.seatId; //座位id
        //     var roosterIds = data.detail.types; //鸡种
        //     var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatId);
        //     self._seats2[(localIndex)].setZeRenItem(roosterIds);
        // });

        this.node.on('game_num', function (data) {
            self._round.string = "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";
            // self.refreshBtns();
        });

        this.node.on('game_over', function (data) {
            console.log("game_over data", data.detail);
            // data = data.detail.overs;
            // // self.refreshBtns();
            // data != undefined && self.initSeatsTotalScore(data);
            // self.showAutoIcon();
        });

        //主要是同步后，刷新头像信息。不包括买/顶
        this.node.on('refresh_sync_infs', function (data) {
            self.initSeats();
        });

        this.node.on('refresh_sync_ready_infs', function (data) {
            console.log('refresh_sync_ready_infs');
            self.initSeats();
        });

        this.node.on('game_over_ready', function (data) {
            console.log("game_over_ready of MJRoom.js");
            self.showDefectAll();
            self.showBaoTingIcon();
            self.showAutoIcon();
        });

        this.node.on('voice_msg', function (data) {
            var data = data.detail;
            self._voiceMsgQueue.push(data);
            self.playVoice();
        });

        this.node.on('chat_push', function (data) {
            var data = data.detail;
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);

            if (self.isActive("prepare")) {
                self._seats[localIdx].chat(data.content);
            }
            if (self.isActive("game")) {
                self._seats2[localIdx].chat(data.content);
            }
        });

        this.node.on('quick_chat_push', function (data) {
            console.log("quick_chat_push", data.detail);
            var data = data.detail;
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
            var index = data.content;
            var info = cc.vv.chat.getQuickChatInfo(index);
            if (self.isActive("prepare")) {
                self._seats[localIdx].chat(info.content);
            }
            if (self.isActive("game")) {
                self._seats2[localIdx].chat(info.content);
            }
            cc.vv.audioMgr.playSFX(info.sound);
        });

        this.node.on('emoji_push', function (data) {
            var data = data.detail;
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
            // console.log(data);
            if (self.isActive("prepare")) {
                self._seats[localIdx].emoji(data.content);
            }
            if (self.isActive("game")) {
                self._seats2[localIdx].emoji(data.content);
            }
        });

        this.node.on('play_out', (event) => {
            console.log('play_out', event.detail);
            let data = event.detail;
            if (data) {
                let totalScore = data.totalScore;
                if (totalScore) {
                    this.initSocre(totalScore);
                }
            }
        });
    },

    isActive: function (name) {
        var temp = this.node.getChildByName(name);
        // cc.log("isActive of",temp);
        if (temp) {
            return temp.active;
        }
        return false;
    },

    initSeats: function () {
        var seats = cc.vv.gameNetMgr.seats;
        console.log("seats", seats);
        // cc.log("seat.length=" + seats.length);
        if (!seats) {
            console.log("initSeats is failed of MJRoom");
            return;
        }
        for (var i = 0; i < seats.length; ++i) {
            console.log('initSeats initSingleSeat', seats[i]);
            this.initSingleSeat(seats[i]);
        }

    },

    initSeatsTotalScore: function (data) {
        console.log("initSeatsTotalScore", data);
        if (cc.vv.gameType.isCoinGame()) {
            if (!cc.vv.gameNetMgr.seats) {
                console.log('igore initSeatsTotalScore');
                return;
            }
        }
        Array.isArray(data) && data.every((seat, index, arr) => {
            console.log("data of seat=", seat);
            console.log("gameNetMgr.seat=", cc.vv.gameNetMgr.seats[index]);
            cc.vv.gameNetMgr.seats[index].score = seat.totalscore;
            if (cc.vv.gameType.isCoinGame()) {
                cc.vv.gameNetMgr.seats[index].coins = seat.totalscore;
            }
            cc.vv.gameNetMgr.seats[index].ready = false;
            //转成本地index
            index = cc.vv.gameNetMgr.getLocalIndex(index);
            this._seats[index].setReady(false);
            this._seats[index].setInfo(seat.nickName, seat.totalscore);
            this._seats2[index].setInfo(seat.nickName, seat.totalscore);
            return true;
        });
        // if (cc.vv.gameType.isCoinGame()) {
        //     this.setBtnBackPosition(false);
        // }
    },

    initSingleSeat: function (seat, type) {
        console.log('initSingleSeat');
        var index = cc.vv.gameNetMgr.getLocalIndex(seat.seatindex);
        var isOffline = !seat.online;
        var isZhuang = seat.seatindex == cc.vv.gameNetMgr.button;
        this._seats[index].setID(seat.userid);
        if (cc.vv.gameType.isCardGame()) {
            this._seats[index].setInfo(seat.name, seat.score);
        } else if (cc.vv.gameType.isCoinGame()) {
            this._seats[index].setInfo(seat.name, seat.coins);
        }
        // this._seats[index].setOffline(isOffline);
        this._seats[index].voiceMsg(false);
        //如果本家的准备，就隐藏。
        if (cc.vv.gameNetMgr.seatIndex == seat.seatindex) {
            if (cc.vv.gameStatusHandle.isIdle()) {
                this.btnStart.active = !seat.ready;
            }
        }
        if (cc.vv.gameStatusHandle.isPlaying()) {
            seat.ready = false;
        }
        this._seats[index].setReady(seat.ready);
    },

    initSocre: function (data) {
        let keys = Object.keys(data);
        keys.forEach((item) => {
            let seat = cc.vv.gameNetMgr.getSeatByID(item);
            console.log(seat, data[item].score);
            seat.score = data[item].score;
            var index = cc.vv.gameNetMgr.getLocalIndex(seat.seatindex);
            this._seats[index].setInfo(seat.name, seat.score);
        });
    },

    initZhuang: function (index) {
        cc.log("initZhuang", index);
        //如果是二人的话，button只能是0,1
        //如果是三人, button只能是0，1，2;
        var seat = cc.vv.gameNetMgr.getLocalIndex(index);
        var zhuangIdx = seat;
        console.log("seat=" + seat, "this.seat2[i]=" + this._seats2[seat]);
        this._seats2[seat].setZhuang(true);
        //二人只设置东西方向
        if (cc.vv.setPeople.isERMJ()) {
            var seat = cc.vv.gameNetMgr.getLocalIndex(index + 1);
            this._seats2[seat].setweizhi(2);
            return;
        }
        //三人只设置东南北三个方向
        if (cc.vv.setPeople.isThreeMJ()) {
            for (var i = 1; i < 3; i++) {
                var localIdx = i;
                console.log("localIdx=", localIdx);
                var seat = cc.vv.gameNetMgr.getLocalIndex(index + i);
                if (seat == 2) {
                    localIdx += 1;
                }; //把指向西的指向北
                if (seat == 0 && zhuangIdx == 1) {
                    localIdx = 3
                };
                console.log("seat=" + seat, "localIdx=" + localIdx);
                this._seats2[seat].setweizhi(localIdx);
            }
            return;
        }
        for (var i = 1; i < 4; i++) {
            var seat = cc.vv.gameNetMgr.getLocalIndex(index + i);
            this._seats2[seat].setweizhi(i);
        }
    },

    onBtnSettingsClicked: function () {
        console.log("onBtnSettingsClicked of MJRoom.js");
        cc.vv.popupMgr.showSettings();
    },

    onClickBack: function () {
        let fn = null;
        if (cc.vv.gameType.isCardGame()) {
            fn = function () {
                cc.director.loadScene("hall");
            }
            cc.vv.alert.show("返回大厅", "返回大厅房间仍会保留，快去邀请大伙来玩吧！", fn, true);
        } else if (cc.vv.gameType.isCoinGame()) {
            fn = function () {
                console.log('send return_to_hall');
                cc.vv.net.send('return_to_hall');
            }
            // cc.director.loadScene("hall");
            cc.vv.alert.show("返回大厅", "确定退出本桌，返回大厅？", fn, true);
        }
    },

    onBtnChatClicked: function () {

    },

    onBtnWeichatClicked: function () {
        // 房号:758949 
        // 房间规则：2人, 8局  
        // 底分 1 , 鸡牌规则：金鸡、银鸡、乌鸡、挖鸡、翻上下鸡，冲鸡选择：冲金鸡、冲银鸡、冲乌鸡、冲挖鸡
        var title = "4人";
        /**分享 */
        console.log("分享");
        console.log(cc.vv.gameNetMgr.conf);
        if (cc.vv.setPeople.isERMJ()) {
            title = "2人";
        }
        if (cc.vv.setPeople.isThreeMJ()) {
            title = "3人";
        }
        var str = "";
        try {
            var jiPaiRule = cc.vv.gameNetMgr.conf.jiPaiRule;
            for (var i = 0, len = jiPaiRule.length; i < len; i++) {
                switch (parseInt(jiPaiRule[i])) {
                    case 0:
                        str += "金";
                        break;
                    case 1:
                        str += "银";
                        break;
                    case 2:
                        str += "乌";
                        break;
                    case 3:
                        str += "挖";
                        break;
                    case 4:
                        str += "翻";
                        break;
                }
                if (i != len - 1) {
                    str += " ";
                }
            }
        } catch (error) {
            console.log(error);
        }

        var strC = "";
        try {
            var chongfengJi = cc.vv.gameNetMgr.conf.chongfengJi;
            for (var i = 0, len = chongfengJi.length; i < len; i++) {
                switch (parseInt(chongfengJi[i])) {
                    case 0:
                        strC += "金";
                        break;
                    case 1:
                        strC += "银";
                        break;
                    case 2:
                        strC += "乌";
                        break;
                    case 3:
                        strC += "挖";
                        break;
                }
                if (i != len - 1) {
                    strC += " ";
                }
            }
            if (strC == '') {
                strC = '无';
            }
        } catch (error) {
            console.log(error);
        }

        var sharStr = "房号:" + /*cc.vv.gameNetMgr.roomId由于会出现cc.vv.gameNetMgr.roomId=null的情况*/
            this.lblRoomNo == null ? '------' : this.lblRoomNo.string +
            "   " + title + " " +
            cc.vv.gameNetMgr.maxNumOfGames + "局\n鸡牌：" + str + "\n冲鸡：" + strC;
        if (cc.vv.gameType.isCoinGame()) {
            const configSet = cc.vv.gameCoinNetMgr.configSet;
            const coinConfig = cc.vv.gameNetMgr.coinConfig;
            sharStr = '';
            sharStr += configSet.seatTypeSet[coinConfig.seatType] + ' 底分:' + configSet.basePointSet[coinConfig.basePoint];
            sharStr += "\n鸡牌：" + str + "\n冲鸡：" + strC;
        }
        console.log(sharStr);
        cc.vv.anysdkMgr.share("酒都麻将", sharStr, true);

    },

    onClickDissolve: function () {
        cc.vv.alert.show("解散房间", "解散房间不扣房卡，是否确定解散？", function () {
            console.log('onClickDissolve');
            cc.vv.net.send("dispress");
        }, true);
    },

    onBtnExitPoker: function (event) {
        console.log('onBtnExitPoker in 632');
        if (this.isActive("prepare")) { //如果是在准备页面
            //
            if (cc.vv.gameStatusHandle.isPlaying()) {
                //如果是在游戏页面，就是解散房间
                cc.vv.alert.show("解散房间", "确定要解散？", function () {
                    cc.vv.net.send("dissolve_request");
                }, true);
                return;
            }
            //是否为房主，
            if (cc.vv.gameNetMgr.isOwner()) {
                cc.vv.alert.show("解散房间", "解散房间不扣房卡，是否确定解散？", function () {
                    cc.vv.net.send("dispress");
                }, true);
            } else { //房员，不是房主
                cc.vv.alert.show("离开房间", "确定离开？", function () {
                    cc.vv.net.send("exit");
                }, true);
            }
        } else if (this.isActive('game')) {
            //如果是在游戏页面，就是解散房间
            cc.vv.alert.show("解散房间", "确定要解散？", function () {
                cc.vv.net.send("dissolve_request");
            }, true);
        }
    },

    onClickExit: function () {
        console.log('onBtnExit');
        cc.vv.net.send("exit");
    },

    playVoice: function () {
        if (this._playingSeat == null && this._voiceMsgQueue.length) {
            console.log("playVoice2");
            var data = this._voiceMsgQueue.shift();
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(idx);
            this._playingSeat = localIndex;
            this._seats[localIndex].voiceMsg(true);
            // this._seats2[localIndex].voiceMsg(true);

            var msgInfo = JSON.parse(data.content);

            var msgfile = "voicemsg.amr";
            console.log(msgInfo.msg.length);
            cc.vv.voiceMgr.writeVoice(msgfile, msgInfo.msg);
            cc.vv.voiceMgr.play(msgfile);
            this._lastPlayTime = Date.now() + msgInfo.time;
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var minutes = Math.floor(Date.now() / 1000 / 60); //获取当前时间
        if (this._lastMinute != minutes) {
            this._lastMinute = minutes;
            var date = new Date();
            var h = date.getHours();
            h = h < 10 ? "0" + h : h;

            var m = date.getMinutes();
            m = m < 10 ? "0" + m : m;
            this._timeLabel.string = "" + h + ":" + m;
            // var dayDate=Data.now(); 
            var dateNow = Date.now();
            var dayDate = new Date(dateNow);
            var month = dayDate.getMonth() + 1;
            // console.log();
            month = month < 10 ? "0" + month : month;
            var day = dayDate.getDate();
            day = day < 10 ? "0" + day : day;
            // console.log("---------------day &month="+day+" "+month);
            this._dayLabel.string = month + "/" + day;
        }


        if (this._lastPlayTime != null) {
            if (Date.now() > this._lastPlayTime + 200) {
                this.onPlayerOver();
                this._lastPlayTime = null;
            }
        } else {
            this.playVoice();
        }
    },


    onPlayerOver: function () {
        cc.vv.audioMgr.resumeAll();
        console.log("onPlayCallback:" + this._playingSeat);
        var localIndex = this._playingSeat;
        this._playingSeat = null;
        this._seats[localIndex].voiceMsg(false);
        this._seats2[localIndex].voiceMsg(false);
    },

    onDestroy: function () {
        cc.vv.voiceMgr.stop();
        //        cc.vv.voiceMgr.onPlayCallback = null;
    }
});