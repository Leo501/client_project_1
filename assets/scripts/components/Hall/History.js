cc.Class({
    extends: cc.Component,

    properties: {
        HistoryItemPrefab: {
            default: null,
            type: cc.Prefab,
        },
        _history: null,
        _viewlist: null,
        _content: null,
        _viewitemTemp: null,
        _historyData: null,
        _curRoomInfo: null,
        _emptyTip: null,
        _detailStript: null,
        _roomIdArr: null,
    },

    // use this for initialization
    onLoad: function () {
        this._history = this.node.getChildByName("history");
        this._history.active = false;

        this._emptyTip = this._history.getChildByName("emptyTip");
        this._emptyTip.active = true;
        this._detailStript = this._history.getChildByName('detail').getComponent('HistoryDetail');

        this._viewlist = this._history.getChildByName("viewlist");
        this._content = cc.find("view/content", this._viewlist);

        this._viewitemTemp = this._content.children[0];
        this._content.removeChild(this._viewitemTemp);

        var node = cc.find("Canvas/btn_zhanji");
        this.addClickEvent(node, this.node, "History", "onBtnHistoryClicked", 1);

        var node = cc.find("Canvas/history/btn_back");
        this.addClickEvent(node, this.node, "History", "onBtnBackClicked", 3);
    },

    start: function () {
        console.log('start');
    },

    addClickEvent: function (node, target, component, handler, number) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        if (number) {
            node.on(cc.Node.EventType.TOUCH_START, function (event) {
                cc.vv.audioMgr.playClick_buttomSFX(number);
            });
        }
        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

    onBtnBackClicked: function () {
        console.log("onBtnBackClicked");
        this._history.active = false;
        if (this._curRoomInfo == null) {
            this._historyData = null;
            this._history.active = false;
        }
        /* else {
                    this.initRoomHistoryList(this._historyData);
                }*/
    },
    //查询战线数据
    onBtnHistoryClicked: function () {
        this._history.active = true;
        var self = this;
        this._detailStript.onClickBack();
        cc.vv.userMgr.getHistoryList(function (data) {
            cc.log("btn", data);
            // data.sort(function (a, b) {
            //     // cc.log(a.begin_time, b.begin_time);
            //     //不能写成a.begin_time<b.begin_time是有问题的。
            //     return b.begin_time - a.begin_time;
            // });
            self._historyData = data;
            self.initRoomHistoryList(data);
            // self.getRoomIdArr(data);
        });
    },

    dateFormat: function (time) {
        var date = new Date(time);
        var datetime = "{0}-{1}-{2} {3}:{4}:{5}";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = month >= 10 ? month : ("0" + month);
        var day = date.getDate();
        day = day >= 10 ? day : ("0" + day);
        var h = date.getHours();
        h = h >= 10 ? h : ("0" + h);
        var m = date.getMinutes();
        m = m >= 10 ? m : ("0" + m);
        var s = date.getSeconds();
        s = s >= 10 ? s : ("0" + s);
        datetime = datetime.format(year, month, day, h, m, s);
        return datetime;
    },

    initRoomHistoryList: function (data) {
        cc.log("data", data);
        const keys = Object.keys(data);
        this._emptyTip.active = keys.length == 0;
        for (var i = 0; i < keys.length; ++i) {
            const key = keys[i];
            var dateChild = data[key];
            var node = this.getViewItem(i);
            node.idx = i;
            node.roomId = dateChild.room_id;
            var titleId = "" + (i + 1);
            node.getChildByName("title").getComponent(cc.Label).string = titleId;
            node.getChildByName("roomNo").getComponent(cc.Label).string = "房间ID:" + dateChild.room_id;
            var datetime = this.dateFormat(dateChild.begin_time * 1000);
            node.getChildByName("time").getComponent(cc.Label).string = datetime;

            var btnOp = node.getChildByName("btnOp");
            btnOp.idx = i;
            btnOp.getChildByName("Label").getComponent(cc.Label).string = "详情";

            for (var j = 0; j < 4; ++j) {
                var s = dateChild.seats[j];
                if (!s) {
                    // cc.log("i="+i,"j="+j);
                    node.getChildByName("info" + j).active = false;
                    continue;
                }
                var info = cc.vv.gameNetMgr.setName(s.name, 8, true) + "\n" + s.score;
                node.getChildByName("info" + j).getComponent(cc.Label).string = info;
                if (s.name == cc.vv.userMgr.userName) {
                    this.setColor(node.getChildByName("info" + j));
                }
            }
        }
        this.shrinkContent(data.length);
        this._curRoomInfo = null;
    },

    initGameHistoryList: function (roomInfo, data) {
        console.log(data);
        data.sort(function (a, b) {
            return a.create_time < b.create_time;
        });
        for (var i = 0; i < data.length; ++i) {
            var node = this.getViewItem(i);
            var idx = data.length - i - 1;
            node.idx = idx;
            node.roomId = roomInfo.id;
            var titleId = "" + (idx + 1);
            node.getChildByName("title").getComponent(cc.Label).string = titleId;
            node.getChildByName("roomNo").getComponent(cc.Label).string = "房间ID:" + roomInfo.id;
            var datetime = this.dateFormat(data[i].create_time * 1000);
            node.getChildByName("time").getComponent(cc.Label).string = datetime;

            var btnOp = node.getChildByName("btnOp");
            btnOp.idx = idx;
            btnOp.getChildByName("Label").getComponent(cc.Label).string = "回放";

            // var result = JSON.parse(data[i].result);
            for (var j = 0; j < 4; ++j) {
                var s = roomInfo.seats[j];
                var info = s.name + "\n" + result[j];
                //console.log(info);
                node.getChildByName("info" + j).getComponent(cc.Label).string = info;
            }
        }
        this.shrinkContent(data.length);
        this._curRoomInfo = roomInfo;
    },

    getViewItem: function (index) {
        var content = this._content;
        if (content.childrenCount > index) {
            return content.children[index];
        }
        var node = cc.instantiate(this._viewitemTemp);
        content.addChild(node);
        return node;
    },
    shrinkContent: function (num) {
        while (this._content.childrenCount > num) {
            var lastOne = this._content.children[this._content.childrenCount - 1];
            this._content.removeChild(lastOne, true);
        }
    },

    getGameListOfRoom: function (idx) {
        console.log("getGameListOfRoom idx=" + idx);
        var self = this;
        var roomInfo = this._historyData[idx];
        cc.vv.userMgr.getGamesOfRoom(roomInfo.uuid, function (data) {
            if (data != null && data.length > 0) {
                self.initGameHistoryList(roomInfo, data);
            }
        });
    },

    getDetailOfGame: function (idx) {
        var self = this;
        var roomUUID = this._curRoomInfo.uuid;
        cc.vv.userMgr.getDetailOfGame(roomUUID, idx, function (data) {
            data.action_records = JSON.parse(data.action_records);
            data.base_info = JSON.parse(data.base_info);
            cc.vv.gameNetMgr.prepareReplay(self._curRoomInfo, data);
            cc.vv.replayMgr.init(data);
            cc.director.loadScene("mjgame");
        });
    },

    getRoomIdArr: function (data) {
        const roomIdSet = new Set();
        this._roomIdArr = [];
        Array.isArray(data) && data.forEach((item) => {
            roomIdSet.add(item.id);
        });
        console.log('roomIdSet', roomIdSet);
        roomIdSet.forEach((item) => {
            const roomId = item;
            const list = this.getListbyRoomId(data, roomId);
            const info = {
                roomId: roomId,
                list: list,
            };
            this._roomIdArr.push(info);
        });
        console.log('roomIdArr=', this._roomIdArr);
    },

    getListbyRoomId: function (data, roomId) {
        const list = [];
        Array.isArray(data) && data.forEach((item) => {
            if (item.id === roomId) {
                list.push(item);
            }
        });
        return list;
    },

    onViewItemClicked: function (event) {
        // var idx = event.target.idx;
        // console.log(idx);
        // if(this._curRoomInfo == null){
        //     this.getGameListOfRoom(idx);
        // }
        // else{
        //     this.getDetailOfGame(idx);      
        // }
    },
    //点击详情
    onBtnOpClicked: function (event) {
        console.log('onBtnOpClicked');
        const room = event.target.roomId;
        var idx = event.target.parent.idx;
        const roomId = event.target.parent.roomId;
        this._curRoomInfo = this._historyData[idx];
        cc.vv.audioMgr.playClick_buttomSFX(1);
        console.log('userMgr=', cc.vv.userMgr);
        this.getHistoryRoomDetail(roomId, function (data) {
            console.log('getHistoryRoomDetail', data);
            data = data[0];
            this._detailStript.init({
                info: {
                    title: (idx + 1),
                    roomNo: "房间ID:" + data.room_id,
                    time: this.dateFormat(data.begin_time * 1000),
                },
                names: data.seats[0],
                list: data.seats,
            });
        }.bind(this));
    },

    getHistoryRoomDetail: function (roomId, callback) {
        function fn(ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                if (callback != null) {
                    callback(ret.history);
                }
            }
        }
        const data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            roomId: roomId,
        }
        cc.vv.http.sendRequest('/get_rooms_history', data, fn);
    },

    setColor: function (node) {
        const myselfColer = '#FC5D31';
        if (node) {
            node.color = (new cc.Color()).fromHEX(myselfColer);
        }
    }

});