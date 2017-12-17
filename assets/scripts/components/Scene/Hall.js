var hallItem = require('ShowItem');

cc.Class({
    extends: cc.Component,

    properties: {
        lblName: cc.Label,
        lblMoney: cc.Label,
        lblGems: cc.Label,
        lblCoins: cc.Label,
        lblID: cc.Label,
        lblNotice: cc.Label,
        joinGameWin: cc.Node,
        createRoomWin: cc.Node,
        settingsWin: cc.Node,
        helpWin: cc.Node,
        xiaoxiWin: cc.Node,
        btnJoinGame: cc.Node,
        btnReturnGame: cc.Node,
        sprHeadImg: cc.Sprite,
        share: cc.Node,
        activity: cc.Node,
    },

    initNetHandlers: function () {
        var self = this;
    },

    onShare: function () {
        this.share.active = true;
        // cc.vv.anysdkMgr.share("有朋温州麻将","一款温州地区流行特色麻将玩法。");   
    },

    // use this for initialization
    onLoad: function () {
        console.log("onLoad of Hall.js");
        if (!cc.vv) {
            cc.director.loadScene("loading");
            return;
        }
        //只用于ios屏幕转屏
        cc.vv.anysdkMgr.setIosAuto();
        G.curNode = this.node;
        this.initLabels();

        if (cc.vv.gameNetMgr.roomId == null) {
            this.btnJoinGame.active = true;
            this.btnReturnGame.active = false;
        } else {
            this.btnJoinGame.active = false;
            this.btnReturnGame.active = true;
        }

        // cc.vv.gameCoinNetMgr.firstGetCoinHallData(5);
        //如果房间不为空，可以直接进入房卡游戏。
        var roomId = cc.vv.userMgr.oldRoomId
        if (roomId != null) {
            cc.vv.userMgr.oldRoomId = null;
            cc.vv.userMgr.enterRoom(roomId);
        }

        var imgLoader = this.sprHeadImg.node.getComponent("ImageLoader");
        imgLoader.setUserIDOfInfo(cc.vv.userMgr.login_id, cc.vv.userMgr.img_url);
        cc.vv.utils.addClickEvent(this.sprHeadImg.node, this.node, "Hall", "onBtnClicked", 1);
        this.addComponent("UserInfoShow");
        this.initButtonHandler("Canvas/btn_shezhi");
        this.initButtonHandler("Canvas/btn_help");
        this.initButtonHandler("Canvas/right_bottom/btn_xiaoxi");
        //退出
        this.initButtonHandler("Canvas/btn_back");
        var btnJoinGame = cc.find("Canvas/btnJoinGame");
        cc.vv.utils.addClickEvent(btnJoinGame, this.node, "Hall", "onJoinGameClicked", 1);
        var btnReturnGame = cc.find("Canvas/btnReturnGame");
        cc.vv.utils.addClickEvent(btnReturnGame, this.node, "Hall", "onReturnGameClicked", 1);
        var btn_create_room = cc.find("Canvas/btn_create_room");
        cc.vv.utils.addClickEvent(btn_create_room, this.node, "Hall", "onCreateRoomClicked", 1);
        var btn_share = cc.find("Canvas/btn_share");
        cc.vv.utils.addClickEvent(btn_share, this.node, "Hall", "onShare", 1);
        this.helpWin.addComponent("OnBack");
        this.xiaoxiWin.addComponent("OnBack");
        this.share = cc.find("Canvas/share");

        var sharePY = cc.find("Canvas/share/sharePY");
        var sharePYQ = cc.find("Canvas/share/sharePYQ"); //
        var btncolse = cc.find("Canvas/share/btncolse");
        cc.vv.utils.addClickEvent(sharePYQ, this.node, "Hall", "onBtnClicked", 1);
        cc.vv.utils.addClickEvent(sharePY, this.node, "Hall", "onBtnClicked");
        cc.vv.utils.addClickEvent(btncolse, this.node, "Hall", "onBtnClicked", 3);
        if (!cc.vv.userMgr.notice) {
            cc.vv.userMgr.notice = {
                version: null,
                msg: "数据请求中...",
            }
        }

        if (!cc.vv.userMgr.gemstip) {
            cc.vv.userMgr.gemstip = {
                version: null,
                msg: "数据请求中...",
            }
        }

        this.lblNotice.string = cc.vv.userMgr.notice.msg;

        this.refreshInfo();
        this.refreshNotice();
        this.refreshGemsTip();

        var self = this;
        //分享金币成功。
        this.node.on("refreshGemTip_push", function () {
            console.log("refreshGemTip_push");
            // self.refreshGemsTip();
            self.lblGems.string = cc.vv.userMgr.gems;
            hallItem.setTimeFromItem('shareItem');
        });

        this.node.on("close_share_win_push", function () {
            console.log("close_share_win_push");
            self.share.active = false;
            hallItem.setTimeFromItem('shareItem');
        });

        this.node.on('update_diamond_numb', function (event) {
            console.log('update_diamond_numb', event.detail);
            let infs = event.detail;
            if (G.payType.card === info.type) {
                this.lblGems.string = infs.gems;
            } else if (G.payType.coin === info.type) {
                this.lblCoins.string = infs.gems;
            }
        }.bind(this));

        this.node.on('pay_result_update', function (event) {
            console.log('pay_result_update');
            self.refreshInfo();
        });

        console.log("loading Hall.js");
        if (cc.vv.gameType.isCoinGame()) {
            console.log('enter coinTable');
            //如果是从金币游戏中退出，直接进入金币大厅
            const coin_node = this.node.getChildByName('coinHall');
            const coin_script = coin_node.getComponent('CoinSeatManage');
            if (coin_script) {
                coin_script.init(1);
            }
        }
        this.activity.getComponent('ActivityManage').init();
    },

    start: function () {
        // this.setShowItem();
        cc.vv.hallHandle = this.node;
    },

    setShowItem: function () {
        // console.log('this.node=', this.node);
        if (hallItem.isShowItem('activityItem')) {
            // console.log("show_activity");
            this.node.emit('show_pape', 1);
        }
        this.node.on('close_pape', function (data) {
            // console.log('next', data.detail);
            var next = data.detail;
            if (next === 2 && hallItem.isShowItem('shareItem')) {
                this.share.active = true;
                // if (cc.sys.isBrowser) {
                //     this.share.active = false;
                // }
            }
        }.bind(this));
    },

    refreshInfo: function () {
        console.log("refreshInfo of Hall.js");
        var self = this;
        var onGet = function (ret) {
            console.log('ret=', ret);
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                if (ret.gems != null) {
                    this.lblGems.string = ret.gems;
                    this.lblCoins.string = ret.coins;
                    console.log("ret.gems=" + ret.gems);
                }
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_user_status", data, onGet.bind(this));
    },

    refreshGemsTip: function () {
        console.log("refreshGemsTip of Hall.js");
        var self = this;
        var onGet = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                // console.log("ret=" + ret);
                cc.vv.userMgr.gemstip.version = ret.version;
                cc.vv.userMgr.gemstip.msg = ret.msg.replace("<newline>", "\n");
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            type: "fkgm",
            version: cc.vv.userMgr.gemstip.version
        };
        cc.vv.http.sendRequest("/get_message", data, onGet.bind(this));
    },

    refreshNotice: function () {
        console.log("refreshNotice of Hall.js");
        var self = this;
        var onGet = function (ret) {
            if (ret.errcode !== 0) {
                console.log(ret.errmsg);
            } else {
                // console.log("ret=" + ret);
                cc.vv.userMgr.notice.version = ret.version;
                cc.vv.userMgr.notice.msg = ret.msg;
                this.lblNotice.string = ret.msg;
            }
        };

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            type: "notice",
            version: cc.vv.userMgr.notice.version
        };
        cc.vv.http.sendRequest("/get_message", data, onGet.bind(this));
    },

    initButtonHandler: function (btnPath) {
        var btn = cc.find(btnPath);
        cc.vv.utils.addClickEvent(btn, this.node, "Hall", "onBtnClicked", 1);
    },



    initLabels: function () {
        // this.lblName.string = cc.vv.gameNetMgr.setName(cc.vv.userMgr.userName, 25, true);
        this.lblName.string = cc.vv.gameNetMgr.setName(cc.vv.userMgr.userName, 8, true);
        this.lblMoney.string = cc.vv.userMgr.coins;
        this.lblGems.string = cc.vv.userMgr.gems;
        this.lblCoins.string = cc.vv.userMgr.coins;
        this.lblID.string = "ID:" + cc.vv.userMgr.userId;
    },

    onBtnClicked: function (event) {
        if (event.target.name == "btn_shezhi") {
            this.settingsWin.active = true;
        } else if (event.target.name == "btn_back") {
            //测试退出游戏
            cc.vv.alert.show("", "确定退出游戏吗？", function () {
                if (cc.sys.os == cc.sys.OS_IOS) {
                    console.log("退出ios");
                    cc.game.end();
                    return;
                }
                console.log("退出进程");
                cc.director.end();
            }, function () {
                console.log("取消");
            });
        } else if (event.target.name == "btn_help") {
            this.helpWin.active = true;
        } else if (event.target.name == "btn_xiaoxi") {
            this.xiaoxiWin.active = true;
        } else if (event.target.name == "head") {
            cc.vv.userinfoShow.show(cc.vv.userMgr.userName, cc.vv.userMgr.userId, this.sprHeadImg, cc.vv.userMgr.sex, cc.vv.userMgr.ip);

        } else if (event.target.name == "sharePYQ") {
            console.log("pnegyouquan");
            var type = false;
            // hallItem.setTimeFromItem('shareItem');
            cc.vv.anysdkMgr.shareResult(type, true);
        } else if (event.target.name == "sharePY") {
            var type = true;
            console.log("pnegyouquan111");
            cc.vv.anysdkMgr.share("酒都麻将", "一款温州地区流行特色麻将玩法。", type);
        } else if (event.target.name == "btncolse") {
            this.share.active = false;
        }
    },

    onJoinGameClicked: function () {
        this.joinGameWin.active = true;
        // cc.vv.audioMgr.playClick_buttomSFX();
    },

    onReturnGameClicked: function () {
        if (cc.vv.userMgr.roomData_reconnect) {
            cc.log("connectGameServer socket");
            cc.vv.userMgr.roomData_reconnect.gameType = cc.vv.gameType.Type.card;
            cc.vv.gameNetMgr.connectGameServer(cc.vv.userMgr.roomData_reconnect);
            return;
        }
        cc.director.loadScene("mjgame");
    },

    onBtnAddGemsClicked: function (event) {
        cc.vv.audioMgr.playClick_buttomSFX(1);
        let target = event.target;
        console.log("target=", target);
        if (target.name === 'btn_add_gems') {
            console.log("just add gems");
        } else if (target.name === 'btn_add_coins') {
            console.log("just add coins");
        }
        this.refreshInfo();
        const store = this.node.getChildByName('store');
        const storeScript = store.getComponent('Store');
        storeScript.init();
    },

    onCreateRoomClicked: function () {
        console.log("onCreateRoomClicked");
        if (cc.vv.gameNetMgr.roomId != null) {
            cc.vv.alert.show("提示", "房间已经创建!\n必须解散当前房间才能创建新的房间");
            return;
        }
        this.createRoomWin.active = true;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var x = this.lblNotice.node.x;
        x -= dt * 100;
        if (x + this.lblNotice.node.width < -1000) {
            x = 500;
        }
        this.lblNotice.node.x = x;

        if (cc.vv && cc.vv.userMgr.roomData != null) {
            console.log("connectGameServer of update function/Hall.js");
            cc.vv.userMgr.roomData.gameType = cc.vv.gameType.Type.card;
            cc.vv.gameNetMgr.connectGameServer(cc.vv.userMgr.roomData);
            cc.vv.userMgr.roomData = null;
        }
    },
});