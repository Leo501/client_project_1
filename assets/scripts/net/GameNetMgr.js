var PrepareLogic = require('PrepareLogic');

var GangPaiType = {
    MINGGANG: 0, // 明杠
    ANGANG: 1, // 暗杠
    WANGANG: 2 //转弯杠
};

cc.Class({
    extends: cc.Component,

    properties: {
        dataEventHandler: null,
        roomId: null,
        maxNumOfGames: 0,
        numOfGames: 0,
        numOfMJ: 0,
        seatIndex: -1,
        seats: null,
        turn: -1,
        gangNum: 0,
        button: -1,
        shaizival: null,
        dingque: -1,
        chupai: -1,
        paiDuPos: null,
        isDingQueing: false,
        isHuanSanZhang: false,
        isDingOrMaiDi: false, //是否顶底or买底中,现在是没有用到的，
        maidiIng: false,
        dingDiOrMaiDi: -1, //是否顶底or买底
        isZhuang: false, //是否为庄
        caishu: -1,
        showChCard: 3, //鸡牌
        dizhu: 0,
        dishu: null,
        gamestate: 3,
        isOver: false,
        youXianPai: null, //是一个数组
        gangPengChiSeats: [],
        isGameSync: false, //是否是断线重连进来的。
        isGameBegin: false, //主要用于判断，可能会出现game_begin_push 会出现在game_finished之前。会出现的bug.
        maiOrDingDiArr: [], //默认5为不买
        gameMaiOrDing: -1, //用于MJGame.js中，确定是买底还是顶底。
        isInitZhuang: false,
        isshaizi: null,
        isDingQue: false, //是否选择定缺页面
        isPaidun: false, //是否有牌墩
        difen: 0,
        ismaidi: false,
        prepareLogic: null, //准备状态逻辑，数据播放流程。
        showPai: null,
        coinConfig: null,
        autoPlays: [false, false, false, false],
        //设置poker是否选完道数
        channelStatus: null,
    },

    resetMaiOrDingArr: function () {
        // this.maiOrDingDiArr = [5, 5, 5, 5];
        // if (cc.vv.setPeople.isERMJ()) {
        //     this.maiOrDingDiArr = [5, 5];
        // }
    },

    reset: function () {
        console.log("reset of GameNetMgr.js");
        this.turn = -1;
        this.chupai = -1,
            this.dingque = 3;
        this.button = -1;
        this.gangNum = 0;
        this.gamestate = 3;
        this.dingque = -1;
        this.isDingQueing = false;
        this.isHuanSanZhang = false;
        this.isInitZhuang = false;
        this.isDingOrMaiDi = false;
        this.dingDiOrMaiDi = -1;
        this.isZhuang = false;
        this.caishu = -1;
        this.dizhu = 0;
        // this.paiOfHGPC=-1;
        //定缺数据
        cc.vv.defectType = -1;
        cc.vv.defectTypes = [-1, -1, -1, -1];
        this.autoPlays = [false, false, false, false];
        console.log('autoPlays=', this.autoPlays);
        //报听数据
        cc.vv.baoTingDatas = [false, false, false, false];

        this.curaction = null;
        if (this.seats) {
            for (var i = 0; i < this.seats.length; ++i) {
                this.seats[i].holds = [];
                this.seats[i].folds = [];
                this.seats[i].pengs = [];
                this.seats[i].chis = [];
                this.seats[i].angangs = [];
                this.seats[i].diangangs = [];
                this.seats[i].wangangs = [];
                this.seats[i].dingque = -1;
                this.seats[i].ready = false;
                this.seats[i].hued = false;
            }
        } else {
            console.log("seats=");
        }

    },

    clear: function () {
        var str = ("clear table data ");
        str += " game_state=" + this.gamestate;
        console.log(str);
        this.dataEventHandler = null;
        this.resetMaiOrDingArr();
        this.isGameSync = false;
        this.isGameBegin = false;
        this.gameMaiOrDing = -1;
        this.isInitZhuang = false;

        if (this.isOver == true) {
            this.seats = null;
            if (cc.vv.gameType.isCardGame()) {
                this.roomId = null;
            } else if (cc.vv.gameType.isCoinGame()) {
                this.coinConfig = null;
            }
            this.maxNumOfGames = 0;
            this.numOfGames = 0;
            var lengt = 4;
            if (cc.vv.setPeople.isERMJ()) {
                lengt = 2;
            }
            if (cc.vv.setPeople.isThreeMJ()) {
                lengt = 3;
            }
            for (var i = 0; i < lengt; i++) {
                var seat = {};
                seat.gang = [];
                seat.peng = [];
                seat.chis = [];
                this.gangPengChiSeats.push(seat);
            }
        }
    },

    //mj的本地事件
    dispatchEvent(event, data) {
        if (this.dataEventHandler) {
            this.dataEventHandler.emit(event, data);
        }
    },

    dispatchEventOfPoker(event, data) {
        //如果还没有设置 先存着
        if (G.pokerGame === null) {

            return;
        }
        if (G.pokerGame) {
            G.pokerGame.emit(event, data);
        }
    },

    getSeatIndexByID: function (userId) {

        if (this.seats) {
            for (var i = 0; i < this.seats.length; ++i) {
                var s = this.seats[i];
                if (s.userid == userId) {
                    return i;
                }
            }
        } else {
            console.log("seat is null of getSeatIndexByID");
        }
        return -1;
    },

    getNameByID: function (userId) {
        if (this.seats) {
            var idx = this.getSeatIndexByID(userId);
            return this.setName(this.seats[idx].name, 8, true);
        }

        return null;
    },

    isOwner: function () {
        return this.seatIndex == 0;
    },

    getSeatByID: function (userId) {
        var seatIndex = this.getSeatIndexByID(userId);
        // console.log("seatIndex of getSeatByID" + seatIndex);
        if (seatIndex < 0) {
            return null;
        }
        var seat = this.seats[seatIndex];
        return seat;
    },

    getSelfData: function () {
        return this.seats[this.seatIndex];
    },

    getLocalIndex: function (index) {
        // console.log('this.seatIndex' + this.seatIndex, 'index=' + index);
        let menSize = cc.vv.setPeople.getMenPoker();
        var ret = (index - this.seatIndex + menSize) % menSize;
        return ret;
        // var ret = (index - this.seatIndex + 4) % 4;
        // //设置成2人
        // if (cc.vv.setPeople.isERMJ()) {
        //     ret = (index - this.seatIndex + 2) % 2;
        // }
        // //设置成3人
        // if (cc.vv.setPeople.isThreeMJ()) {
        //     ret = (index - this.seatIndex + 3) % 3;
        // }
        // return ret;
    },

    prepareReplay: function (roomInfo, detailOfGame) {
        this.roomId = roomInfo.id;
        this.seats = roomInfo.seats;
        this.turn = detailOfGame.base_info.button;
        var baseInfo = detailOfGame.base_info;
        for (var i = 0; i < this.seats.length; ++i) {
            var s = this.seats[i];
            s.seatindex = i;
            s.score = null;
            s.holds = baseInfo.game_seats[i];
            s.pengs = [];
            s.chis = [];
            s.angangs = [];
            s.diangangs = [];
            s.wangangs = [];
            s.folds = [];
            s.online = false;
            console.log(s);
            if (cc.vv.userMgr.userId == s.userid) {
                this.seatIndex = i;
            }
        }
        this.conf = {
            type: baseInfo.type,
        }
        if (this.conf.type == null) {
            this.conf.type == 0;
            this.resetMaiOrDingArr();
        }
    },

    getWanfa: function () {
        var conf = this.conf;
        if (conf && conf.maxGames != null && conf.maxFan != null) {
            var strArr = [];
            strArr.push(conf.maxGames + "局");
            strArr.push(conf.maxFan + "番封顶");
            if (conf.hsz) {
                strArr.push("换三张");
            }
            if (conf.zimo == 1) {
                strArr.push("自摸加番");
            } else {
                strArr.push("自摸加底");
            }
            if (conf.jiangdui) {
                strArr.push("将对");
            }
            if (conf.dianganghua == 1) {
                strArr.push("点杠花(自摸)");
            } else {
                strArr.push("点杠花(放炮)");
            }
            if (conf.menqing) {
                strArr.push("门清、中张");
            }
            if (conf.tiandihu) {
                strArr.push("天地胡");
            }
            return strArr.join(" ");
        }
        return "";
    },

    initOtherSeatData: function (index) {
        return {
            name: "",
            online: false,
            ready: false,
            score: 0,
            seatindex: index,
            userid: 0,
        }

    },
    initSeatData: function (seat, seatType) {
        // Array.isArray(seat);
        const set = [4, 3, 2];
        let length = set[seatType];
        let seatLength = seat.length;
        for (let i = seatLength - 1; i < length; i++) {
            seat.push(this.initOtherSeatData(i));
        }
    },

    initHandlers: function () {
        var self = this;
        var LogUtil = cc.vv.LogUtil;
        cc.vv.State = cc.Enum({
            None: -1, //无状态
            Zhuang: -1, //进行庄
            PaiDun: -1, //牌墩状态
            Init: -1, //初始化麻将页面
            Que: -1, //开始定缺
            QueCall: -1, //定缺确认
            FiniQue: -1, //完成定缺
            Begin: -1, //开始打麻将
            Run: -1, //进行定时操作

            Sync: -1, //重连操作
            Action: -1, //碰，杠，胡的选择页面
        });
        //暂存数据，用于顺序执行流程。

        this.prepareLogic = new PrepareLogic();
        this.prepareLogic.init();

        cc.vv.net.addHandler("testNet_push", function (data) {
            // console.log('testNet ok');
            self.dispatchEvent("testNet");
        });

        cc.vv.net.addHandler("login_result", function (data) {
            console.log('login_result', data);
            LogUtil.setUserId(cc.vv.userMgr.login_id);
            LogUtil.setUserName(cc.vv.userMgr.userName);
            // loglevel
            // 根据服务信息配置是否上传日志
            if (data.data && data.data.loglevel != null) {
                LogUtil.setLogLev(data.data.loglevel);
            }

            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("login_result", null, "登陆返回数据", JSON.stringify(data.data), 1);
            if (data.errcode === 0) {
                var data = data.data;
                self.seats = data.seats;
                console.log('self.seats=', data.seats);
                self.seatIndex = self.getSeatIndexByID(cc.vv.userMgr.userId);
                console.log('seatIndex=', self.seatIndex);
                if (cc.vv.gameType.isCardGame()) {
                    self.roomId = data.roomid;
                    self.conf = data.conf;
                    self.maxNumOfGames = data.conf.maxGames;
                    self.resetMaiOrDingArr();
                    self.dishu = data.conf.dishu;
                    // self.ismaidi = data.conf.isNeedOperDi == 1;
                    self.numOfGames = data.numofgames;
                    console.log('data.seats', data.seats);
                    console.log("myself holds=" + self.seats[self.seatIndex].holds);
                    self.isOver = false;
                    self.difen = data.conf.difen;
                } else if (cc.vv.gameType.isCoinGame()) {
                    self.coinConfig = {};
                    self.conf = {};
                    self.coinConfig.basePoint = data.basePoint;
                    self.coinConfig.minGold = data.minGold;
                    self.coinConfig.tableId = data.tableId;
                    self.coinConfig.tableOwner = data.tableOwner;
                    self.coinConfig.seatType = data.type;
                    self.coinConfig.tableId = data.tableId;
                    self.conf.type = data.type;
                    self.conf.jiPaiRule = data.jiFenConfig.jiPaiRule;
                    self.conf.chongfengJi = data.jiFenConfig.chongfengJi;
                    self.autoPlays = [false, false, false, false];
                    self.autoPlays.length = cc.vv.setPeople.getMen();
                    console.log('self.autoPlays=', self.autoPlays);
                }
            } else {
                if (data.errcode == 4) {
                    console.log('本桌子已解散，请返回大厅');
                    // cc.vv.alert.show('提示', '本桌子已解散，请返回大厅', function () {
                    //     self.isOver = true;
                    //     cc.director.loadScene('hall');
                    // });
                    return;
                }
                cc.sys.localStorage.removeItem("wx_account");
                cc.sys.localStorage.removeItem("wx_sign");
                cc.director.loadScene("login");
                console.log(data.errmsg);
            }
        });

        //未满人时，重连刷新
        cc.vv.net.addHandler('reconnect_prepare_push', function (data) {
            console.log('reconnect_prepare_push');
            // console.log(data);
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("reconnect_prepare_push", null, "未满人时，重连刷新", JSON.stringify(data));
            if (cc.vv.gameType.isCardGame()) {
                self.roomId = data.roomid;
                self.conf = data.conf;
                self.maxNumOfGames = data.conf.maxGames;
                self.dishu = data.conf.dishu;
                self.ismaidi = data.conf.isNeedOperDi == 1;
                self.difen = data.conf.difen;
                self.numOfGames = data.numofgames;
            }
            self.seats = data.seats;
            self.seatIndex = self.getSeatIndexByID(cc.vv.userMgr.userId);

            self.dispatchEvent("refresh_sync_ready_infs");
            self.dispatchEvent('resumeTestNet');
        });

        cc.vv.net.addHandler("login_finished", function (data) {
            //console.log("login_finished+self.conf.type" + self.conf.type);
            try {
                const nodePool = G.nodePoolArr['CoinSeat'];
                nodePool.recycle();
            } catch (error) {
                console.log('-------------------------error gameNetMgr.js login_finished ', error);
            }
            // cc.director.loadScene("mjgame");
            cc.director.loadScene("pokerGame");
        });

        cc.vv.net.addHandler("exit_result", function (data) {
            console.log("exit_result " + data);
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("exit_result", null, "退出返回数据", JSON.stringify(data), 1);
            if (cc.vv.gameType.isCardGame()) {
                self.roomId = null;
            }
            self.isOver = true;
            self.turn = -1;
            self.dingque = -1;
            self.isDingQueing = false;
            self.isDingOrMaiDi = false;
            self.seats = null;

            self.isDingOrMaiDi = false;
            self.dingDiOrMaiDi = -1;
            self.isZhuang = false;
            self.caishu = -1;
            self.dizhu = 0;
            self.coinConfig = null;
        });

        cc.vv.net.addHandler("exit_notify_push", function (data) {
            console.log("exit_notify_push " + data);
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("exit_notify_push", null, "退出通知数据", JSON.stringify(data));
            var userId = data;
            var s = self.getSeatByID(userId);
            if (s != null) {
                s.userid = 0;
                s.name = "";
                s.ready = false;
                self.dispatchEvent("user_state_changed", s);
                console.log("退出房间，刷新");
                self.dispatchEvent("user_state_changedicon", s);
            }
        });

        cc.vv.net.addHandler("dispress_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("dispress_push", null, "解散房间", JSON.stringify(data));
            console.log("dispress_push " + data);
            if (cc.vv.gameType.isCardGame()) {
                self.roomId = null;
                self.isOver = true;
            }
            self.turn = -1;
            self.dingque = -1;
            self.isDingQueing = false;
            self.isDingOrMaiDi = false;
            self.seats = null;

            self.isDingOrMaiDi = false;
            self.dingDiOrMaiDi = -1;
            self.isZhuang = false;
            self.caishu = -1;
            self.dizhu = 0;
            self.coinConfig = null;
        });

        cc.vv.net.addHandler("disconnect", function (data) {
            console.log('disconnect =', data);
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("disconnect", null, "链接", JSON.stringify(data), 1);
            cc.vv.net_isConnect = false;
            var str = ("disconnect of GameNetMgr.js" + data);
            // console.log("cc.vv.net_isConnect=" + cc.vv.net_isConnect);
            if (cc.vv.gameType.isCardGame()) { //房卡。
                if (self.roomId == null) {
                    str += " self.roomId"; //room
                    cc.director.loadScene("hall");
                } else {
                    //isOver===true说明是结束游戏了，可以返回大厅。不需要重连。
                    if (self.isOver == false) {
                        cc.vv.userMgr.oldRoomId = self.roomId;
                        str += " dispatchEvent('disconnect')";
                        self.dispatchEvent("disconnect");
                    } else {
                        str += " self.roomId = null;";
                        // self.roomId = null;
                    }
                }
            } else if (cc.vv.gameType.isCoinGame()) { //金币
                if (self.coinConfig === null) {
                    cc.director.loadScene("hall");
                } else {
                    self.dispatchEvent("disconnect");
                }
            }

            console.log(str);
        });

        cc.vv.net.addHandler("new_user_comes_push", function (data) {
            console.log("new_user_comes_push", data);
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("new_user_comes_push", null, "新用户进入", JSON.stringify(data));
            var seatIndex = data.seatindex;
            if (cc.vv.gameType.isCardGame()) {
                if (self.seats[seatIndex].userid > 0) {
                    self.seats[seatIndex].online = true;
                } else {
                    data.online = true;
                    self.seats[seatIndex] = data;
                }
            } else if (cc.vv.gameType.isCoinGame()) {
                console.log('enter coinGame');
                if (self.seats[seatIndex]) {
                    data.online = true;
                    self.seats[seatIndex] = data;
                } else {
                    self.seats[seatIndex] = data;
                }
                // self.seats[seatIndex].score = data.coins;
            }
            console.log('seats[seatIndex]=', self.seats[seatIndex]);
            self.dispatchEvent('new_user', self.seats[seatIndex]);
        });

        cc.vv.net.addHandler("user_state_push", function (data) {
            console.log('user_state_push=', data);
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("user_state_push", null, "用户状态通知", JSON.stringify(data));
            // console.log(data.userid);
            var userId = data.userid;
            // console.log('seats=', self.seats);
            var seat = self.getSeatByID(userId);
            console.log("seat=", seat);
            if (seat) {
                seat.online = data.online;
                self.dispatchEvent('user_state_changed', seat);
            } else {
                console.log("seat is null or undefined");
            }

        });

        cc.vv.net.addHandler("user_ready_push", function (data) {
            console.log('user_ready_push', data);
            // console.log("user_ready_push of id= " + data.userid + " ready=" + data.ready);
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("user_ready_push", null, "用户准备通知", JSON.stringify(data));
            var userId = data.userid;
            // console.log('seats=', self.seats);
            var seat = self.getSeatByID(userId);
            seat.ready = data.ready;
            self.dispatchEvent('user_state_changed', seat);
        });

        /**收到消息更新自己的手牌 */
        cc.vv.net.addHandler("game_holds_push", function (data) {
            console.log("game_holds_push");
            var seat = self.seats[self.seatIndex];
            console.log("更新自己的手牌->" + data);
            seat.holds = data;
            console.log('self.seats.length', self.seats.length);
            for (var i = 0; i < self.seats.length; ++i) {
                var s = self.seats[i];
                if (s.folds == null) {
                    s.folds = [];
                }
                if (s.pengs == null) {
                    s.pengs = [];
                }
                if (s.chis == null) {
                    s.chis = [];
                }
                if (s.angangs == null) {
                    s.angangs = [];
                }
                if (s.diangangs == null) {
                    s.diangangs = [];
                }
                if (s.wangangs == null) {
                    s.wangangs = [];
                }
                s.ready = false;
            }
            //主要是发送到mjroom脚本中，把准备图标和微信邀请隐藏
            self.dispatchEvent('game_holds');
            self.dispatchEventOfPoker('game_poker_holds', data);

            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("game_holds_push", null, "收到消息更新自己的手牌", JSON.stringify(data), 1);
        });

        cc.vv.net.addHandler("game_begin_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("game_begin_push", null, "游戏开始通知---必要", JSON.stringify(data), 1);
            console.log('game_begin_push');
            console.log(data);
            self.button = data.banker;
            self.turn = self.button;
            self.isGameBegin = true;
            self.isDingOrMaiDi = false;
            self.maiOrDingDiArr = data.maiOrDingDi;
            self.dispatchEvent('game_begin');
            self.dispatchEvent('initZhuang', self.button);
        });

        /**通知开始定缺选择 */
        cc.vv.net.addHandler("game_dingque_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("game_dingque_push", null, "通知开始定缺选择", JSON.stringify(data), 1);
            //显示定缺按钮选择 show_defect_card_bre
            console.log("game_dingque_push");
            self.isDingQue = true;
            self.dispatchEvent('show_defect_card_bre');

        });

        /**选择定缺的返回 */
        cc.vv.net.addHandler("game_dingque_notify_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("game_dingque_notify_push", null, "选择定缺的返回", JSON.stringify(data), 1);
            //隐藏定缺按钮选择
            console.log("game_dingque_notify_push");
            cc.vv.defectType = parseInt(data); //存自己的缺牌
            console.log("type=" + data);
            self.dispatchEvent('show_defect_card_return'); //
            self.dispatchEvent('show_us_defect');
            self.dispatchEvent('selectSureDefectNum');
        });

        /**广播四人选择好的定缺牌 */
        cc.vv.net.addHandler("game_dingque_finish_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("game_dingque_finish_push", null, "广播四人选择好的定缺牌", JSON.stringify(data), 1);
            console.log("game_dingque_finish_push");
            console.log(data);
            cc.vv.defectTypes = data;
            // self.prepareLogic.inputData(cc.vv.State.FiniQue, data);
            self.dispatchEvent('game_dingque_finish_push_return');
            self.dispatchEvent("show_all_defect");
            self.dispatchEvent('game_dingque_return');
        });

        /**冲锋鸡牌显示 */
        cc.vv.net.addHandler('chongfengji_push', function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("chongfengji_push", null, "冲锋鸡牌显示", JSON.stringify(data));
            self.dispatchEvent("chongfengji_push_mjg", data);
        });

        /**责任鸡等icon附近显示 */
        cc.vv.net.addHandler('zerenji_push', function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("zerenji_push", null, "责任鸡等icon附近显示", JSON.stringify(data));
            self.dispatchEvent("zerenji_push_img", data);
        });

        /**报听广播 */
        cc.vv.net.addHandler('baoting_icon_push', function (data) {
            console.log("报听广播");
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("baoting_icon_push", null, "报听广播---必要", JSON.stringify(data), 1);
            var baotingTypes = data;
            cc.vv.baoTingDatas = data;
            self.dispatchEvent("baoting_icon_push_notify");
        });

        /**推送听牌消息数据 "baoting_holds_push" 点击哪些牌后，可以听牌。{tingPaiStatus:{pai1: false, pai2: true ......}}*/
        cc.vv.net.addHandler('baoting_holds_push', function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("baoting_holds_push", null, "推送听牌消息数据---必要", JSON.stringify(data), 1);
            console.log("推送听牌消息数据");
            console.log(JSON.stringify(data));
            var baoTingStatus = false;
            if (cc.vv.baoTingData) {
                baoTingStatus = cc.vv.baoTingData.baoTingStatus;
                cc.vv.baoTingData.tingPaiStatus = data.tingPaiStatus;
            } else {
                cc.vv.baoTingData = {
                    baoTingStatus: baoTingStatus, //报听状态
                    tingPaiStatus: data.tingPaiStatus,
                };
            }
            console.log("报听数据=" + JSON.stringify(cc.vv.baoTingData));
            //通知比较显示听牌逻辑

            self.dispatchEvent('baoting_holds_push_notify');
        });

        /**报听返回 确定报听 执行cc.vv.baoTingData.baoTingStatus = true; */
        cc.vv.net.addHandler('baoting_push', function (data) {
            self.dispatchEvent('baoting_push_notify', data);
        });

        //满人时，重连刷新
        cc.vv.net.addHandler('reconnect_ok_push', function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("reconnect_ok_push", null, "满人时，重连刷新", JSON.stringify(data));
            console.log('reconnect_ok_push');
            console.log(data);
            if (cc.vv.gameType.isCardGame()) {
                self.conf = data.conf; //取得配置
                self.maxNumOfGames = data.conf.maxGames; //4局还是8局
                self.dishu = data.conf.dishu; //底数
                self.ismaidi = data.conf.isNeedOperDi == 1;
                self.difen = data.conf.difen; //底分
                self.numOfGames = data.numofgames; //进行到第几局
                self.roomId = data.roomid; //
            }

            self.gamestate = data.state; //游戏状态
            self.numOfMJ = data.numofmj; //剩下麻将数
            self.button = data.button; //庄
            self.turn = data.turn; //出牌者
            self.chupai = data.chuPai; //出那张牌。
            // self.caishu = data.caishen; //财神
            self.paiDuPos = data.paidun;
            self.showPai = data.showPai //出牌提示
            console.log("data.showPai=", data.showPai);
            var defectTypes = [];
            var baoTingDatas = [];
            for (var i = 0; i < data.seats.length; i++) {
                var sd = data.seats[i];
                console.log(sd);
                self.seats[i] = sd;
                //报听
                baoTingDatas.push(sd.baoTingStatus);
                defectTypes.push(parseInt(sd.que));
                if (i == self.seatIndex) {
                    cc.vv.defectType = parseInt(sd.que);
                    console.log("cc.vv.defectType", cc.vv.defectType);
                }
            }
            cc.vv.defectTypes = defectTypes;
            cc.vv.baoTingDatas = baoTingDatas;
            console.log("cc.vv.defectType=" + cc.vv.defectTypes);

            console.log('cc.vv.userMgr.userId=' + cc.vv.userMgr.userId);
            self.seatIndex = self.getSeatIndexByID(cc.vv.userMgr.userId);
            console.log('self.seatIndex=' + self.seatIndex);

            // self.dispatchEvent('refresh_sync_infs');
            // self.dispatchEvent('resumeTestNet');
            // //定缺状态刷新
            // if (cc.vv.gameStatusHandle.isDingQue()) {
            //     // console.log("refresh in DINGQUE of reconnect");
            //     // self.dispatchEvent('show_defect_card_bre');
            //     if (cc.vv.defectType > 0 && cc.vv.defectType < 4) {
            //         self.dispatchEvent('show_defect_card_return');
            //         self.dispatchEvent('show_us_defect');
            //     } else {
            //         self.dispatchEvent('show_defect_card_bre');
            //     }
            //     return;
            // }
            // //游戏状态刷新,
            // if (cc.vv.gameStatusHandle.isPlaying()) {
            //     console.log("refresh in PYAYING");
            //     var seatsData = data.seats;
            //     var callback = function () { //刷新各家的定缺
            //         self.dispatchEvent('game_dingque_finish_push_return');
            //         self.dispatchEvent("show_all_defect");
            //         self.dispatchEvent('game_dingque_return');
            //         // self.prepareLogic.inputData(cc.vv.State.FiniQue, cc.vv.defectTypes);
            //         for (var i = 0; i < seatsData.length; i++) {
            //             var sd = seatsData[i];
            //             //添加断线的时候显示每人的冲锋鸡的icon数据显示
            //             console.log("添加断线的时候显示每人的冲锋鸡的icon数据显示");
            //             console.log(sd.jiPaiTypes);
            //             self.dispatchEvent("zerenji_push_img", sd.jiPaiTypes);
            //             self.dispatchEvent("baoting_icon_push_notify");
            //         }
            //     };
            //     cc.vv.timeout.timeoutOne(callback, self, 0.5);
            // }
        });

        //关掉软件后，重新进入游戏
        cc.vv.net.addHandler("game_sync_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("game_sync_push", null, "关掉软件后，重新进入游戏", JSON.stringify(data));
            console.log("game_sync_push");
            console.log(data);
            self.isGameSync = true;
            self.numOfMJ = data.numofmj;
            self.dizhu = 0;
            console.log("gamestate=" + self.gamestate);

            console.log("self.isGameSync" + self.isGameSync);
            self.paiDuPos = data.paidun;
            self.gamestate = data.state;
            self.isDingOrMaiDi = false;
            self.dingDiOrMaiDi = -1;
            self.isZhuang = false;

            self.turn = data.turn;
            self.button = data.button;
            self.chupai = data.chuPai;
            self.showPai = data.showPai
            // let channelStatus = false;
            //显示庄家
            self.isInitZhuang = true;
            var defectTypes = [];
            var baoTingDatas = [];
            for (var i = 0; i < self.seats.length; ++i) {
                // console.log("i="+i);
                var seat = self.seats[i];
                var sd = data.seats[i];
                seat.holds = sd.holds;
                seat.folds = sd.folds;
                seat.angangs = sd.angangs;
                seat.diangangs = sd.diangangs;
                seat.wangangs = sd.wangangs;
                self.gangNum += (seat.angangs.length + seat.wangangs.length + seat.diangangs.length);
                seat.pengs = sd.pengs;
                seat.chis = sd.chis; //添加的吃。

                // seat.dingque = sd.que;
                seat.hued = sd.hued;
                seat.iszimo = sd.iszimo;
                //报听
                baoTingDatas.push(sd.baoTingStatus);
                seat.huinfo = sd.huinfo;
                //设置扑克
                seat.channelStatus = sd.channelStatus;
                seat.type = sd.type;
                console.log("que=", sd.que);
                defectTypes.push(parseInt(sd.que));
                if (i == self.seatIndex) {
                    self.channelStatus = sd.channelStatus;
                    cc.vv.defectType = parseInt(sd.que);
                    //断线
                    var isUsBaoTing = sd.baoTingStatus;
                    if (!cc.vv.baoTingData) {
                        cc.vv.baoTingData = {
                            baoTingStatus: isUsBaoTing,
                            tingPaiStatus: null,
                        }
                    } else {
                        cc.vv.baoTingData.baoTingStatus = isUsBaoTing;
                    }
                }
            }
            cc.vv.defectTypes = defectTypes;
            cc.vv.baoTingDatas = baoTingDatas;
            //如果是游戏状态
            if (cc.vv.gameStatusHandle.isPlaying()) {
                setTimeout(() => {
                    //未提交，就是重新选牌
                    if (!self.channelStatus) {
                        console.log('重新选牌！');
                        // self.dispatchEvent('game_holds');
                        self.dispatchEventOfPoker('game_poker_holds', self.seats[self.seatIndex].holds);
                        self.dispatchEventOfPoker('card_type', self.seats[self.seatIndex].type);
                    } else {
                        //已经选完牌了。
                        self.dispatchEventOfPoker('game_sync_status');
                    }
                    // self.dispatchEvent('game_holds');
                }, 1500);
            }
        });

        cc.vv.net.addHandler("buy_and_double_base", function (data) { //买底顶底结束
            //不买为5 2为买底，4为顶底。
            console.log("buy_and_double_base " + data.type + " seatIndex=" + data.seatIndex);
            self.maiOrDingDiArr[data.seatIndex] = data.type;
            console.log("self.maiOrDingDiArr[self.seatIndex]=" + self.maiOrDingDiArr[data.seatIndex]);
            self.dispatchEvent('buy_and_double_base', data);

        });

        cc.vv.net.addHandler("game_huanpai_push", function (data) {
            console.log("game_huanpai_push " + data);
            self.isHuanSanZhang = true;
            self.dispatchEvent('game_huanpai');
        });

        cc.vv.net.addHandler("hangang_notify_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("hangang_notify_push", null, "hangang_notify_push通知", JSON.stringify(data));
            console.log("hangang_notify_push " + data);
            self.dispatchEvent('hangang_notify', data);
        });

        cc.vv.net.addHandler("game_action_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("game_action_push", null, "game_action_push通知---必要", JSON.stringify(data), 1);
            console.log("game_action_push");
            console.log(data);
            if (data == null) {
                console.log("data is null");
                return;
            }
            // self.prepareLogic.inputData(cc.vv.State.Action, data);
            // self.curaction = data;
            self.dispatchEvent('game_action', data);
            var str = "data.hu=" + data.hu + " data.gang=" + data.gang + " data.peng=" + data.peng + " data.chi=" + data.chi + " data.chipai=" + data.chipai;
            console.log("emit data of show_log");
            if (cc.vv.logNodeHandle) {
                cc.vv.logNodeHandle.emit('show_log', str);
            } else {
                cc.vv.logNodeHandleArr = [];
                cc.vv.logNodeHandleArr.push(str);
                console.log("logNodeHandle is null");
            }
            // self.dispatchEvent('show_log',str);
        });

        cc.vv.net.addHandler("game_chupai_push", function (data) {
            console.log('game_chupai_push');
            console.log(data);
            var turnUserID = data;
            var si = self.getSeatIndexByID(turnUserID);
            self.doTurnChange(si);
        });

        cc.vv.net.addHandler("game_num_push", function (data) {
            console.log("game_num_push " + data);
            self.numOfGames = data;
            if (cc.vv.gameType.isCardGame()) {
                self.dispatchEvent('game_num', data);
            }
        });

        /**结束 */
        cc.vv.net.addHandler("game_over_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("game_over_push", null, "结束信息---必要", JSON.stringify(data), 1);
            console.log('game_over_push data=', data);
            let size = cc.vv.setPeople.getMenPoker();
            self.isOver = true;
            setTimeout(() => {
                self.reset();
                if (data.isend) {
                    // self.isOver = true;
                    self.dispatchEvent('game_end', data);
                }
                self.dispatchEvent('game_over', data);
                self.dispatchEventOfPoker('game_over', data);
            }, (size * 3 * 1000 + 2000));
        });

        /**翻牌 */
        cc.vv.net.addHandler("paidun_fanpai_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("paidun_fanpai_push", null, "翻牌---必要", JSON.stringify(data), 1);
            console.log("翻牌");
            console.log(data); //{ fanPai: fanPai }
            console.log(data.fanPai);
            cc.vv.gameNetMgr.showChCard = data.fanPai;
            self.dispatchEvent('play_fan_rooster_anim', data);
            cc.vv.timeout.timeoutOne(function () {
                self.dispatchEvent('show_fly_card');
                console.log("这里的 this 指向 component");
            }, self, 0.3);
        });

        cc.vv.net.addHandler('round_score', function (data) {
            cc.log("round_score", data);
            self.dispatchEvent('round_score', data);
        });

        cc.vv.net.addHandler("mj_count_push", function (data) {
            console.log('mj_count_push');
            self.numOfMJ = data;
            //console.log(data);
            self.dispatchEvent('mj_count', data);
        });

        cc.vv.net.addHandler("hu_push", function (data) {
            console.log('hu_push');
            console.log(data);
            self.doHu(data);
        });

        cc.vv.net.addHandler("game_chupai_notify_push", function (data) {
            console.log("game_chupai_notify_push");
            // console.log(data);
            var userId = data.userId;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doChupai(si, pai, data.holds);
        });

        /**自己摸牌*/
        cc.vv.net.addHandler("game_mopai_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("game_mopai_push", null, "自己摸牌---必要", JSON.stringify(data), 1);
            console.log('game_mopai_push:' + data);
            //报听状态存储
            if (data.baoTingStatus) {
                console.log("更新报听状态->" + data.baoTingStatus);
                if (cc.vv.baoTingData) {
                    cc.vv.baoTingData.baoTingStatus = data.baoTingStatus;
                } else {
                    cc.vv.baoTingData = {
                        baoTingStatus: data.baoTingStatus, //报听状态
                        tingPaiStatus: null,
                    };
                }
            }
            self.doMopai(self.seatIndex, data);
            // self.dispatchEvent('mo_pai',data);
        });

        //用于刷新seat.fold的牌。
        cc.vv.net.addHandler("guo_notify_push", function (data) {
            /* actionName:消息字段 * functionName:函数名 * doc:描述 * logStr:日志内容 * config:配置 */
            LogUtil.printLog("guo_notify_push", null, "用于刷新seat.fold的牌", JSON.stringify(data));
            console.log('guo_notify_push');
            var userId = data.userId;
            var paiArr = data.folds;
            console.log("paiArr=" + paiArr);
            var si = self.getSeatIndexByID(userId);
            self.doGuo(si, paiArr);
        });

        //用于刷新seat.fold的牌。
        cc.vv.net.addHandler("chu_pai_animation_push", function (data) {
            var userId = data.userId;
            var paiArr = data.folds;
            console.log("paiArr=" + paiArr);
            var si = self.getSeatIndexByID(userId);
            self.doGuo(si, paiArr);
        });

        cc.vv.net.addHandler("guo_result", function (data) {
            console.log('guo_result');
            self.dispatchEvent('guo_result');
        });

        cc.vv.net.addHandler("guohu_push", function (data) {
            console.log('guohu_push');
            self.dispatchEvent("push_notice", {
                info: "过胡",
                time: 1.5
            });
        });

        cc.vv.net.addHandler("game_huanpai_result_push", function (data) {
            console.log('game_huanpai_result_push');
            var info = "";
            if (data == 0) {
                info = "换对家牌";
            } else if (data == 1) {
                info = "换下家牌";
            } else {
                info = "换上家牌";
            }
            self.dispatchEvent("game_huanpai_result");
            self.dispatchEvent("push_notice", {
                info: info,
                time: 0.8
            });
        });

        cc.vv.net.addHandler("peng_notify_push", function (data) {
            console.log('peng_notify_push', data);
            //接收者
            var userId = data.userid;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doPeng(si, data.pengs, data.holds);
            // if()
            var turn_userid = data.turn_userid;
            console.log("turn user id == " + turn_userid);

            //出牌者
            if (turn_userid != null) {
                self.doRefreshFolds(turn_userid, data.folds);
            }
        });

        cc.vv.net.addHandler("gang_notify_push", function (data) {
            console.log('gang_notify_push', data);
            var userId = data.userid;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doGang(si, data);
            if ( /*"diangang" == data.gangtype*/
                GangPaiType.MINGGANG == data.gangtype) {
                console.log("gang_notify_push is MINGGANG");
                var turn_userid = data.turn_userid;
                if (turn_userid != null) {
                    self.doRefreshFolds(turn_userid, data.folds);
                }
            }
            // self.paiOfHGPC=-1;
        });

        cc.vv.net.addHandler("chat_push", function (data) {
            console.log("chat_push ", data);
            self.dispatchEvent("chat_push", data);
        });

        cc.vv.net.addHandler("quick_chat_push", function (data) {
            console.log("quick_chat_push", data);
            self.dispatchEvent("quick_chat_push", data);
            // self.testGameOver();
        });

        cc.vv.net.addHandler("emoji_push", function (data) {
            console.log('emoji_push');
            self.dispatchEvent("emoji_push", data);
        });

        cc.vv.net.addHandler("dissolve_notice_push", function (data) {
            console.log("dissolve_notice_push", data);
            console.log(data);
            self.dispatchEvent("dissolve_notice", data);
        });

        cc.vv.net.addHandler("dissolve_cancel_push", function (data) {
            console.log("dissolve_cancel_push ", data);
            self.dispatchEvent("dissolve_cancel", data);
        });

        cc.vv.net.addHandler("voice_msg_push", function (data) {
            self.dispatchEvent("voice_msg", data);
        });

        cc.vv.net.addHandler("game_youxian_push", function (data) {
            console.log("game_youxian_push", data);
            //先置空，再赋值.
            self.youXianPai = null;
            self.youXianPai = data;
            console.log("youXianPai" + self.youXianPai);
            self.dispatchEvent("youxian_push", data);
        });

        cc.vv.net.addHandler("chi_notify_push", function (data) {
            console.log("chi_notify_push", data);
            var userId = data.userid;
            var si = self.getSeatIndexByID(userId);
            //刷新手牌跟显示吃碰杠.
            self.doChi(si, data.chis, data.holds);
            var turn_userid = data.turn_userid;
            console.log("turn_userId=" + data.turn_userid);
            if (turn_userid != null) {
                //刷新出牌者的folds牌。
                self.doRefreshFolds(turn_userid, data.folds);
            }

            // self.paiOfHGPC=-1;
        });

        //是其他人摸牌
        cc.vv.net.addHandler("mopai_push", function (data) {
            console.log("mopai_push", data);
            self.dispatchEvent("mopai_push", data);
        });

        //确定庄家
        cc.vv.net.addHandler("banker_push", function (data) {
            console.log("banker_push", data);
            self.button = data.button;
            self.shaizival = data.point1 + data.point2;
            self.isshaizi = data;
            console.log("banker_push of data=", data);
            self.dispatchEvent("banker_push", data);
        });

        //确定牌墙位置
        cc.vv.net.addHandler("paidun_push", function (data) {
            console.log("paidun_push of data =", data);
            self.button = data.banker;
            self.paiDuPos = data.point1 + data.point2;
            self.paiDuPos = parseInt(self.paiDuPos);
            self.isPaidun = true;
            self.dispatchEvent('initpaiqiang', self.button);
            self.dispatchEvent("paidun_push", data);
        });
        cc.vv.net.addHandler("wait_other", function (data) {
            console.log("wait_other of data=", data);
            self.dispatchEvent("wait_other", data);
        });

        cc.vv.net.addHandler("game_status_push", function (data) {
            console.log("game_status_push=", data.state);
            self.gamestate = data.state;
            self.dispatchEvent('game_status');
        });

        cc.vv.net.addHandler("error_msg", function (data) {
            console.log("error_msg of data=", data);
            console.log(data.content);
        });

        cc.vv.net.addHandler("auto_play", function (data) {
            console.log("gameNetMgr.js auto_play data=", data);
            self.dispatchEvent('auto_play', data);
        });

        cc.vv.net.addHandler("set_autoplay_push", function (data) {
            console.log("set_autoplay_push data=", data);
            console.log('autoPlays=', self.autoPlays);
            const idx = self.getSeatIndexByID(data.userId);
            console.log('idx=', idx);
            if (idx < 0) {
                console.log('set_autoplay_push error idx<0 ------------------------------------------');
                return;
            }
            if (data.result == 0) {
                if (idx == self.seatIndex) { //如果是本人
                    self.dispatchEvent('set_autoplay_push', data);
                }
                //type==0为托管，1为非托管
                self.autoPlays[idx] = data.type == 0 ? true : false;
                console.log('autoPlays=', self.autoPlays);
                self.dispatchEvent('show_auto_play_icon');
            }
        });

        //有什么牌型可以选择
        cc.vv.net.addHandler("card_type_push", function (data) {
            console.log("card_type_push data=", data);
            self.dispatchEventOfPoker('card_type', data);
            // self.dispatchEvent('auto_play', data);
        });

        //在某个牌型下，可以选择的扑克
        cc.vv.net.addHandler("card_pai_push", function (data) {
            console.log("card_pai_push data=", data);
            self.dispatchEventOfPoker('card_pai', data);
            // self.dispatchEvent('auto_play', data);
        });

        //在某个牌型下，可以选择的扑克
        cc.vv.net.addHandler("chu_card_push", function (data) {
            console.log("chu_card_push data=", data);
            self.dispatchEventOfPoker('chu_card', data);
        });

        //取消选择的牌型
        cc.vv.net.addHandler("cannel_chu_pai_push", function (data) {
            console.log("chu_card_push data=", data);
            self.dispatchEventOfPoker('cannel_chu_pai', data);
        });
        // cannel_chu_pai_push

        //一局结束，开始比大小，显示结算
        cc.vv.net.addHandler("play_out_push", function (data) {
            console.log("play_out_push data=", data);
            self.dispatchEventOfPoker('play_out', data);
            self.dispatchEvent('play_out', data);
        });

        //广播某一家已经选完牌。
        cc.vv.net.addHandler("play_out_ready", function (data) {
            console.log("play_out_ready data=", data);
            self.dispatchEventOfPoker('play_out_ready', data);
        });

        //放错道~ 要重新选择
        cc.vv.net.addHandler("chu_card_error", function (data) {
            console.log("chu_card_error data=", data);
            self.dispatchEventOfPoker('chu_card_error', data);
        });

    },

    initHandPai: function (s) {
        if (s.folds == null) {
            s.folds = [];
        }
        if (s.pengs == null) {
            s.pengs = [];
        }
        if (s.chis == null) {
            s.chis = [];
        }
        if (s.angangs == null) {
            s.angangs = [];
        }
        if (s.diangangs == null) {
            s.diangangs = [];
        }
        if (s.wangangs == null) {
            s.wangangs = [];
        }
    },

    doGuo: function (seatIndex, paiArr) {
        var seatData = this.seats[seatIndex];
        // cc.log("folds",folds);
        if (paiArr == null) {
            console.log("pai=null ");
            return;
        }
        seatData.folds = paiArr;
        // folds.push(pai);
        this.dispatchEvent('guo_notify', seatData);
    },

    doRefreshFolds: function (userid, paiArr) {
        console.log("do RefreshFolds ");
        var seatIndex = this.getSeatIndexByID(userid);
        console.log("seatIndex=" + seatIndex);
        var seatData = this.seats[seatIndex];
        // if()
        if (paiArr == null) {
            console.log("pai=null ");
            return;
        }
        seatData.folds = paiArr;
        // folds.push(pai);
        this.dispatchEvent('refresh_folds', seatData);
    },

    doMopai: function (seatIndex, data) {
        console.log("data.hold=" + data.holds);
        var seatData = this.seats[seatIndex];
        if (data.holds) {
            seatData.holds = data.holds;
            this.dispatchEvent('game_mopai' /*,{seatIndex:seatIndex,pai:pai}*/ );
        }
    },

    doChupai: function (seatIndex, pai, holds) {
        console.log("doChupai");
        this.chupai = pai;
        var seatData = this.seats[seatIndex];
        cc.log("seatData.folds", seatData.folds);
        if (holds) {
            seatData.holds = holds;
        }
        this.dispatchEvent('game_chupai_notify', {
            seatData: seatData,
            pai: pai
        });
    },

    doPeng: function (seatIndex, pengs, holds) {
        var seatData = this.seats[seatIndex];
        if (pengs != null) {
            seatData.pengs = pengs;
        }

        if (holds != null) {
            this.sortHolds(holds, this.caishu);
            seatData.holds = holds;
        }

        this.dispatchEvent('peng_notify', seatData);
    },

    //
    doChi: function (seatIndex, chipaiArr, holds) {
        // console.log("-----------------------chipai="+pai);
        var seatData = this.seats[seatIndex];
        // console.log(seatData);
        if (holds != null) {
            console.log("holds=" + holds);
            this.sortHolds(holds, this.caishu);
            seatData.holds = holds;
            console.log("holds=" + holds);
        }
        if (chipaiArr != null) {
            console.log("chipaiArr=" + chipaiArr);
            seatData.chis = chipaiArr;
            this.dispatchEvent('chi_notify', seatData);
        }
    },

    getGangType: function (seatData, pai) {
        if (seatData.pengs.indexOf(pai) != -1) {
            return "wangang";
        } else {
            var cnt = 0;
            for (var i = 0; i < seatData.holds.length; ++i) {
                if (seatData.holds[i] == pai) {
                    cnt++;
                }
            }
            if (cnt == 3) {
                return "diangang";
            } else {
                return "angang";
            }
        }
    },
    setName: function (name, len, isLong) {
        var newLength = 0;
        var newStr = "";
        var chineseRegex = /[^\x00-\xff]/g;
        var singleChar = "";
        var strLength = name.replace(chineseRegex, "**").length;
        for (var i = 0; i < strLength; i++) {
            singleChar = name.charAt(i).toString();
            if (singleChar.match(chineseRegex) != null) {
                newLength += 2;
            } else {
                newLength++;
            }
            if (newLength > len) {
                break;
            }
            newStr += singleChar;
        }

        if (isLong && strLength > len) {
            newStr += "...";
        }
        return newStr;
    },
    doGang: function (seatIndex, data) {
        var seatData = this.seats[seatIndex];
        console.log("dogang");
        console.log(data);
        this.sortHolds(data.holds);
        seatData.holds = data.holds;
        seatData.wangangs = data.wangangs;
        seatData.pengs = data.pengs;
        seatData.angangs = data.angangs;
        seatData.diangangs = data.diangangs;
        console.log("data.gangtype=" + data.gangtype);
        this.dispatchEvent('gang_notify', {
            seatData: seatData,
            gangtype: data.gangtype
        });
    },

    doHu: function (data) {
        this.dispatchEvent('hupai', data);
    },

    doTurnChange: function (si) {
        var data = {
            last: this.turn, //上一次转向
            turn: si, //本次的转向
        }
        this.turn = si;
        this.dispatchEvent('game_chupai', data);
    },

    //是否已经买过or顶过。
    isMaiOrDinged: function (data) {
        var str = "";
        var arr = this.maiOrDingDiArr;
        for (var j in arr) {
            str += " " + j;
            //如果还有没买的话。
            if (arr[j] == 1 || arr[j] == 3) {
                console.log("isMaiOrDinged " + str);
                return;
            }
        }
        console.log("isMaiOrDinged " + str);
        this.dispatchEvent('game_begin');
    },

    getGangs: function () {
        var gangNum = 0;
        // console.log('getGangs');
        // console.log(this.seats);
        if (!this.seats) {
            return -1;
        }
        for (var i = 0; i < this.seats.length; i++) {
            var seat = this.seats[i];
            try {
                gangNum += (seat.angangs.length + seat.wangangs.length + seat.diangangs.length);
            } catch (e) {
                console.log("seat not gang information", e);
                return null;
            }


        }
        console.log("gangNum=" + gangNum);
        return gangNum;
    },

    checkYouXianOfHolds: function (youXianArr, holds) {
        console.log("checkYouXianOfHolds");
        console.log("holds", holds);
        //check优先牌中，是不是手牌中没有的。
        var youxians = youXianArr;
        var len = youXianArr.length;
        for (var j = 0; j < youxians.length; j++) {
            //手牌中，找到优先数组没有的牌。                   
            var idx = holds.indexOf(youxians[j]);
            var pai = youxians[j];
            console.log("idx" + idx + " pai" + pai);
            if (idx == -1) {
                console.log("delete pai:" + pai);
                //再在删除数组中，再查找。
                var idx = youXianArr.indexOf(pai);
                youXianArr.splice(idx, 1);
            }
        }
    },

    sortHolds: function (holds, caishen) {
        cc.vv.mahjongmgr.sortMJ(holds, caishen);
    },

    getLen: function (seatData, type) {
        console.log(seatData);
        var length = 0;
        var str = "length=";
        if (seatData.angangs) {
            length += seatData.angangs.length;
            str += " angangs" + seatData.angangs.length;
        } else {
            console.log("seatData.angangs==null" + seatData.angangs);
        }

        if (seatData.diangangs) {
            length += seatData.diangangs.length;
            str += " diangangs" + seatData.diangangs.length;
        } else {
            console.log("seatData.diangangs==null" + seatData.diangangs);
        }

        if (seatData.wangangs) {
            length += seatData.wangangs.length;
            str += " wangangs" + seatData.wangangs.length;
        } else {
            console.log("seatData.wangangs==null" + seatData.wangangs);
        }

        if (seatData.pengs) {
            length += seatData.pengs.length;
            str += " pengs" + seatData.pengs.length;
        } else {
            console.log("seatData.pengs==null" + seatData.pengs);
        }

        length *= 3;

        if (seatData.chis) {
            length += seatData.chis.length;
            str += " chis" + seatData.chis.length;
        } else {
            console.log("seatData.chis==null" + seatData.chis);
        }
        str += " type=" + type;
        // console.log(str + " " + length);
        if ("other" == type) {
            return length;
        }
        let paiNumb = 14;
        const seatHolds = seatData.holds;
        if (seatHolds.length % 3 === 1) {
            paiNumb = 13;
        }
        length = paiNumb - seatHolds.length;
        return length;

    },

    connectGameServer: function (data) {
        let timeoutId = null;
        cc.vv.net.ip = data.ip + ":" + data.port;
        console.log(cc.vv.net.ip);
        console.log('gameType=', data.gameType);
        /*通过调用原生平台函数
        返回到location.js 中的setLocation函数中
        http把本家位置上传。*/
        cc.vv.location.updateLocation();
        var self = this;
        cc.vv.gameType.setType(data.gameType);
        self.isReconncet = false;
        var onConnectOK = function () {
            console.log("onConnectOK");
            cc.vv.net_isConnect = true;
            var sd = {
                token: data.token,
                roomid: data.roomid,
                time: data.time,
                sign: data.sign,
            };
            //如果为金币场。
            if (data.gameType === cc.vv.gameType.Type.coin) {
                console.log('enter coin game');
                sd = {
                    token: data.token,
                    time: data.time,
                    sign: data.sign,
                    tableId: data.tableId,
                    seatIndex: data.seatIndex,
                }
            }
            self.sd = sd;
            if (self.isReconncet) {
                console.log("not send login order");
                cc.vv.net.send("reconnect_ok", sd);
                return;
            }
            console.log('sd', sd);
            cc.vv.net.send("login", sd);
        };

        //用于断线重连
        var onReConnect = function () {
            console.log("reConnect ok!");
            self.dispatchEvent('reConnect_ok');
            self.isReconncet = true;
        }

        var onConnectFailed = function () {
            console.log("failed.");
            cc.vv.wc.hide();
        };
        cc.vv.wc.show("正在进入房间");
        cc.vv.net.connect(onConnectOK, onConnectFailed, onReConnect);
    },

    reConnectGameServer: function () {
        var self = this;
        console.log("reConnectGameServer ");
        console.log(self.sd);
        var fn = function (data) {
            console.log('testNet ok');
            var onConnectOK = function () {
                cc.vv.net_isConnect = true;
                cc.vv.net.send('reconnect_ok', self.sd);
                self.dispatchEvent('reConnect_ok');
            }
            var onConnectFailed = function () {
                console.log("failed.");
                cc.vv.wc.hide();
            };
            var onReConnect = function () {
                console.log("reConnect ok!");
            }
            cc.vv.net.connect(onConnectOK, onConnectFailed, onReConnect);
        };

        cc.vv.http.sendRequest("/testNet", {}, fn);
    }

});