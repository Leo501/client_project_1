const UserUtil = require('UserUtil');

cc.Class({
    extends: cc.Component,

    properties: {
        _pokerPlayersNode: null,
        _players: {
            default: [],
            type: [cc.Node]
        },
        _roomInfo: null,
        _voiceMsgQueue: [],
        _playingSeat: null,
        _lastPlayTime: null,
        //快速聊天内容对象,在子类中设置
        quickChatInfo: null,

    },

    // use this for initialization
    onLoad: function () {
        this._pokerPlayersNode = this.node.getChildByName('pokerPlayers');
        this._roomInfo = this.node.getChildByName('roomInfo').getComponent('RoomInfo');
        this._players = [];
        this.setPeople();
        
    },

    start: function () {
        this.addLocalEvent();
        this.setRoomInfo();
        console.log('this._players=', this._players);
        this.setAllSeats(cc.vv.gameNetMgr.seats);
    },

    addLocalEvent: function () {
        // console.log('addLocalEvent');
        this.node.on('new_user', (data) => {
            console.log("new_user of MJRoom initSingleSeat" + data.detail);
            this.initSingleSeat(data.detail);
        });

        this.node.on('voice_msg', (data) => {
            var data = data.detail;
            // console.log('voice_msg', data);
            this._voiceMsgQueue.push(data);
            this.playVoice();
        });

        this.node.on('chat_push', (data) => {
            var data = data.detail;
            console.log('chat_push', data);
            var localIdx = UserUtil.getLocalIdxById(data.sender);
            this._players[localIdx].getComponent('SeatBase').chat(data.content);
        });

        this.node.on('quick_chat_push', (data) => {
            console.log("quick_chat_push", data.detail);
            var data = data.detail;
            var localIdx = UserUtil.getLocalIdxById(data.sender);
            console.log('this._players[]', this._players);
            var index = data.content;
            console.log('this.quickChatInfo',this.quickChatInfo);
            if (this.quickChatInfo instanceof Object) {
                var info = this.quickChatInfo['item'+index];
                this._players[localIdx].getComponent('SeatBase').chat(info.content);
                cc.vv.audioMgr.playSFX(info.sound);
            } else {
                console.log('quickChatInfo is null');
            }
        });

    },

    setPeople: function () {
        //设置人数
        let nameArr = cc.vv.setPeople.getMenNameArr();
        if (this._pokerPlayersNode) {
            this._pokerPlayersNode.children.forEach((node, idx) => {
                let isShow = false;
                for (let i = 0; i < nameArr.length; i++) {
                    if (node.name == nameArr[i]) {
                        isShow = true;
                        break;
                    }
                }
                if (isShow) {
                    node.active = true;
                    this.initPlayerInfo(node, {
                        userId: 0,
                        name: '',
                        score: 0,
                    });
                    this._players.push(node);
                } else {
                    node.active = false;
                }
            });
        }
    },

    setRoomInfo: function () {
        let data = {
            roomNo: cc.vv.gameNetMgr.roomId,
            difen: cc.vv.setPeople.getMenPoker() + '人',
            zhushu: "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局",
        }
        this._roomInfo.setInfo(data);
    },

    setAllSeats: function (seats) {
        console.log('setAllSeats');
        if (Array.isArray(seats)) {
            seats.forEach((data) => {
                console.log('data=', data);
                this.initSingleSeat(data);
            });
        } else {
            console.log('seats is not Array');
        }
    },

    initSingleSeat: function (seat) {
        let idx = UserUtil.getLocalIdx(seat.seatindex);
        console.log('initSingleSeat', idx);
        this.initPlayerInfo(this._players[idx], seat);
    },

    initPlayerInfo: function (node, data) {
        let script = node.getComponent('Actor');
        script.setUserInfo(data.userid, data.name, data.score);
    },

    playVoice: function () {
        if (this._playingSeat == null && this._voiceMsgQueue.length) {
            console.log("playVoice2");
            var data = this._voiceMsgQueue.shift();
            var localIndex = UserUtil.getLocalIdxById(data.sender);
            this._playingSeat = localIndex;
            this._players[localIndex].getComponent('SeatBase').voiceMsg(true);
            var msgInfo = JSON.parse(data.content);
            var msgfile = "voicemsg.amr";
            console.log(msgInfo.msg.length);
            cc.vv.voiceMgr.writeVoice(msgfile, msgInfo.msg);
            cc.vv.voiceMgr.play(msgfile);
            this._lastPlayTime = Date.now() + msgInfo.time;
        }
    },

    onPlayerOver: function () {
        cc.vv.audioMgr.resumeAll();
        console.log("onPlayCallback:" + this._playingSeat);
        var localIndex = this._playingSeat;
        this._playingSeat = null;
        this._players[localIndex].getComponent('SeatBase').voiceMsg(false);
    },


    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

        if (this._lastPlayTime != null) {
            if (Date.now() > this._lastPlayTime + 200) {
                this.onPlayerOver();
                this._lastPlayTime = null;
            }
        } else {
            this.playVoice();
        }
    },

    onDestroy: function () {
        cc.vv.voiceMgr.stop();
    },


});