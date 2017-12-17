var PrepareHandle = require('PrepareHandle');
cc.Class({
    extends: cc.Component,

    properties: {
        gameRoot: {
            default: null,
            type: cc.Node
        },

        prepareRoot: {
            default: null,
            type: cc.Node
        },
        _timeout: null,
        _myMJArr: [],
        _chiPaiInfs: [],
        _options: null,
        isShowTing: false,
        _chiOptions: null,
        _selectedMJ: null,
        _touchedMJ: null, //滑动那张pai;
        _touched_y: -1, //滑动位移
        _chupaiSprite: [],
        _mjcount: null,
        _gamecount: null,
        _hupaiTips: [],
        _hupaiLists: [],
        _playEfxs: [],
        _opts: [],
        paiNumb: null,
        caiShen: null,
        caiShenTip: null, //
        dizhu: null, //底数
        baiban: 29,
        chishuqiang: null,
        // youXianPai:[],
        /**定缺的花色 */
        _defectNum: -1, //初始化没有选择
        _play_fan_rooster_anim: null, //翻鸡动画
    },

    onLoad: function () {
        console.log("-----------------------------onLoad MjGame.js-------");
        if (!cc.vv) {
            cc.director.loadScene("loading");
            return;
        }
        cc.vv.gameNetMgr.dataEventHandler = this.node;
        G.curNode = this.node;
        this.prepareHandle = new PrepareHandle();
        this.prepareHandle.init(this.node);
        cc.vv.gameNetMgr.prepareLogic.setRunAction(this.prepareHandle);

        this.isShowTing = false;
        this.paiNumb = 13;
        this.baiban = 29;
        this._defectNum = -1;
        // if(cc.vv.gameNetMgr.isPaidun) { 
        //     console.log("init MJ Table");
        //     this.initMJTable(true)
        // }
        // this.addComponent("NoticeTip");
        // this.addComponent("PengGangs");
        // this.addComponent("TimePointer");
        // this.addComponent("GameResult");
        this.addComponent("Chat"); 
        // this.addComponent("PokerGameResult");
        // this.addComponent("Folds");
        // this.addComponent("Brandwall");
        // this.addComponent("ReplayCtrl");
        this.addComponent("PopupMgr");
        // this.addComponent("HuanSanZhang");
        this.addComponent("ReConnect");
        this.addComponent("Voice");
        this.addComponent("UserInfoShow");
        // this.addComponent("UserCoinInfo");

        // this.addComponent("DefectCard");
        // this.addComponent("DefectCardManager");
        // this.addComponent("GameOverUIManager");
        this.addComponent("MJRoom");
        // this.addComponent("MjTitleText");
        // this.addComponent('AutoPlay');

        // cc.vv.httpLog = this.addComponent("HTTPLOG"); //tow添加日志组件

        // this.initView();
        // this.initEventHandlers();
        // this.addComponent("MaiDi");
        if (cc.sys.os == cc.sys.OS_IOS) {
            this.addComponent("CheckOnline");
        }
        // this.addComponent("CheckOnline");

        this.gameRoot.active = false;
        this.prepareRoot.active = true;
        // this.initWanfaLabel();
        // this.initCaiShen();
        // this.onGameBeign();   
        // cc.vv.audioMgr.playBGM("bgFight.mp3");

        // this.initGameNetMgrData();
    },

    start: function () {
        console.log("start mjgame.js");
        // this.initGameNetMgrData();
        // if(cc.vv.gameStatusHandle.isPlaying()) {
        //     console.log("is playing");
        //     //主动查询是否有操作。
        //     cc.vv.net.send("get_action");
        // }
    },

    /**初始化界面显示 */
    initView: function () {
        console.log("---------------------initView MjGame-----------------");
        //搜索需要的子节点
        var gameChild = this.node.getChildByName("game");

        this.chishuqiang = gameChild.getChildByName("caishuqiang");
        console.log("chishuqiang=" + this.chishuqiang);
        this.chishuqiang.active = false;
        var mjxinxi = gameChild.getChildByName('mjxinxi');
        this._mjcount = mjxinxi.getChildByName('mjcount').getComponent(cc.Label);
        this._mjcount.string = cc.vv.gameNetMgr.numOfMJ + "张";
        this._gamecount = mjxinxi.getChildByName('gamecount').getComponent(cc.Label);
        this._gamecount.string = "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";

        var myselfChild = gameChild.getChildByName("myself");
        var myholds = myselfChild.getChildByName("holds");

        console.log("myholds.children.length:" + myholds.children.length);
        for (var i = 0; i < myholds.children.length; i++) {
            var sprite = myholds.children[i].getComponent(cc.Sprite);
            var caishen = myholds.children[i].getChildByName("caishen");
            caishen.active = false;
            this._myMJArr.push(sprite);
            sprite.spriteFrame = null;

            //添加touch事件
            this.setTouchEvent(sprite);
        }

        var realwidth = cc.director.getVisibleSize().width;
        myholds.scaleX *= realwidth / 1280;
        myholds.scaleY *= realwidth / 1280;

        var sides = cc.vv.setPeople.getSeats();

        cc.log("initView", "sides=" + sides);
        for (var i = 0; i < sides.length; ++i) {
            var side = sides[i];
            var sideChild = gameChild.getChildByName(side);
            // this._hupaiTips.push(sideChild.getChildByName("HuPai"));
            // this._hupaiLists.push(sideChild.getChildByName("hupailist"));
            var play_efx = sideChild.getChildByName("play_efx");
            // play_efx.active = false;
            this._playEfxs.push(play_efx.getComponent(cc.Animation));
            this._chupaiSprite.push(sideChild.getChildByName("ChuPai").children[0].getComponent(cc.Sprite));

            var opt = sideChild.getChildByName("opt");
            opt.active = false;
            var sprite = opt.getChildByName("pai").getComponent(cc.Sprite);
            var data = {
                node: opt,
                sprite: sprite
            };
            this._opts.push(data);
        }

        //本家的选择
        var opts = gameChild.getChildByName("ops");
        var chiOpts = gameChild.getChildByName("chiOps");
        this._options = opts;

        var confirmGou = this._options.getChildByName("btnGuo").getComponent("ConfirmGou");
        this._options.confirmGou = confirmGou;

        this._chiOptions = chiOpts;
        // chiOpts.active=true;
        this.hideOptions();
        this.hideChupai();
        this.hideChiOptions();
        //
        this._play_fan_rooster_anim = gameChild.getChildByName("play_fan_rooster").getComponent(cc.Animation);

    },

    /**初始化游戏网络数据 */
    initGameNetMgrData: function () {
        var self = this;
        console.log("initGameNetMgrData");
        if (cc.vv.gameNetMgr.isGameSync) {
            console.log("initGameNetMgrData of MJGame.js" + cc.vv.gameNetMgr.isGameSync);
            cc.vv.gameNetMgr.dispatchEvent('game_sync');
            if (cc.vv.gameStatusHandle.isPlaying()) {
                console.log("is playing");
                //主动查询是否有操作。
                cc.vv.net.send("get_action");
            }
        }

        if (cc.vv.gameNetMgr.isDingQue) {
            console.log("show dique picture in onLoad function from DefestCardManager.js");
            cc.vv.timeout.timeoutOne(function () {
                if (cc.vv.gameNetMgr.seats[cc.vv.gameNetMgr.seatIndex].holds != null) {
                    cc.vv.gameNetMgr.dispatchEvent('show_defect_card_bre');
                }
            }, self, 2);
        }

        if (cc.vv.gameNetMgr.isshaizi != null) {
            cc.vv.gameNetMgr.dispatchEvent('banker_push', cc.vv.gameNetMgr.isshaizi);
        }
    },

    /**禁用出牌 */
    hideChupai: function () {
        for (var i = 0; i < this._chupaiSprite.length; ++i) {
            this._chupaiSprite[i].node.active = false;
        }
    },

    /**添加事件监听 */
    initEventHandlers: function () {
        cc.vv.gameNetMgr.dataEventHandler = this.node;

        //初始化事件监听器
        var self = this;

        this.node.on('game_holds', function (data) {
            console.log("game_holds");
            self.initMahjongs();
            self._defectNum = -1;
        });
        /**确定自己的缺牌 */
        this.node.on('selectSureDefectNum', function () {
            console.log("确定自己的缺牌");
            //3->万 2->条 1->筒 defectType
            //0->筒 1->条 2->万 _defectNum
            switch (parseInt(cc.vv.defectType)) {
                case 3:
                    self._defectNum = 2;
                    break;
                case 2:
                    self._defectNum = 1;
                    break;
                case 1:
                    self._defectNum = 0;
                    break;
            }
            // console.log(cc.vv.defectType);
            // console.log(self._defectNum);
            self.initMahjongs();
        });

        /**验证听牌 */
        this.node.on('baoting_holds_push_notify', function (data) {
            self.showTingPaiLogic();
        });

        /**报听返回操作 */
        this.node.on('baoting_push_notify', function (data) {
            console.log("报听返回操作->" + data.detail);
            self.isShowTing = false;
            if (data.detail) {
                //出牌
                if (self._selectedMJ) {
                    self.shoot(self._selectedMJ.mjId);
                    //清空自己的听牌数据
                    if (cc.vv.baoTingData) {
                        cc.vv.baoTingData.tingPaiStatus = null;
                        cc.vv.baoTingData.baoTingStatus = true;
                    }
                }
                //报听成功设置icon
            } else {
                //过牌
            }
            //取消按钮
            self.hideAllOptions();
            cc.vv.mahjongmgr.getActionSounds("ting");
        });

        //开始游戏后，正常流程。
        this.node.on('game_begin', function (data) {
            console.log("game_begin of MJGame");
            self.onGameBeign();
        });

        //游戏断线后，重新进行游戏流程。
        this.node.on('game_sync', function (data) {
            console.log("game_sync");
            self.onGameBeign();
            self.initHoldsYouXian();
            if (cc.vv.gameStatusHandle.isPlaying()) {
                //是否刷新自己的牌。
                if (cc.vv.gameNetMgr.turn == cc.vv.gameNetMgr.seatIndex) {
                    var seatData = cc.vv.gameNetMgr.seats[cc.vv.gameNetMgr.seatIndex];
                    var lackingNum = cc.vv.gameNetMgr.getLen(seatData);
                    if (lackingNum + seatData.holds.length == self.paiNumb + 1) {
                        self.initMahjongs();
                    }
                } else { //刷新某一家最后一张牌
                    self.initMopai(cc.vv.gameNetMgr.turn, -1);
                    let showPai = cc.vv.gameNetMgr.showPai; //如果是已经出牌了，就不显示最后一张牌。
                    if (showPai !== null && showPai.seatIndex == cc.vv.gameNetMgr.turn) {
                        self.initMopai(cc.vv.gameNetMgr.turn, null);
                        return
                    }
                }
            }
            // self.hideAllOptions();
        });

        this.node.on('refresh_sync_infs', function (data) {
            console.log("refresh_sync_infs");
            console.log(cc.vv.gameNetMgr.gamestate);
            if (cc.vv.gameStatusHandle.isIdle()) {
                self.gameRoot.active = false;
                self.prepareRoot.active = true;
            }
            if (cc.vv.gameStatusHandle.isDingQue()) {
                self.onGameBeign();
            }
            //下面为playing 状态
            if (cc.vv.gameStatusHandle.isPlaying()) {
                self.onGameBeign();
                //除了本家,把其他三家的最后一张手牌给隐藏
                for (var i = 0; i < cc.vv.gameNetMgr.seats.length; i++) {
                    if (i == cc.vv.gameNetMgr.seatIndex) {
                        continue;
                    }
                    self.initMopai(i, null);
                }

                //是否刷新自己的牌。
                if (cc.vv.gameNetMgr.turn == cc.vv.gameNetMgr.seatIndex) {
                    var seatData = cc.vv.gameNetMgr.seats[cc.vv.gameNetMgr.seatIndex];
                    var lackingNum = cc.vv.gameNetMgr.getLen(seatData);
                    if (lackingNum + seatData.holds.length == self.paiNumb + 1) {
                        self.initMahjongs();
                    }
                } else { //刷新某一家最后一张牌
                    self.initMopai(cc.vv.gameNetMgr.turn, -1);
                }
                self.checkYouXianPai();
                //刷新还有几张牌
                self.dizhu.node.active = true;
                self.dizhu.string = cc.vv.gameNetMgr.difen; //底分
                cc.vv.gameNetMgr.dispatchEvent('game_num'); //进行到第几局
                cc.vv.gameNetMgr.dispatchEvent('mj_count'); //还剩下几张牌
                self.initWanfaLabel(); //玩法。
                cc.vv.gameNetMgr.dispatchEvent('initZhuang', cc.vv.gameNetMgr.button);
            }
        });


        this.node.on('game_chupai', function (data) {

            console.log("game_chupai");
            data = data.detail;
            self.hideChupai();
            // self.checkQueYiMen();

            //如果是本家，就是刷新自己的优先牌。
            if (data.turn == cc.vv.gameNetMgr.seatIndex) {
                self.checkYouXianPai();
            } else //点亮第17张牌。
            {
                self.initMopai(data.turn, -1);
            }
            //last是上一位出牌的人，不一定是上家。
            for (var i = 0; i < cc.vv.gameNetMgr.seats.length; i++) {
                if (i == cc.vv.gameNetMgr.seatIndex) {
                    continue;
                }
                if (i == data.turn) {
                    continue;
                }
                self.initMopai(i, null);
            }
        });

        this.node.on('game_mopai', function (data) {
            console.log("game_mopai");
            //摸牌清空听牌数据
            if (cc.vv.baoTingData) {
                //如果有听牌数据清空，以后没有听牌机会了，服务也不会推送此数据 
                cc.vv.baoTingData.tingPaiStatus = null;
            }
            //
            self.hideChupai();
            self.initMahjongs();
        });

        this.node.on('game_action', function (data) {
            console.log("game_action");
            self.showAction(data.detail);
            // self.showAction(data);
        });

        this.node.on('hupai', function (data) {
            var data = data.detail;
            console.log("data of hupai of MJGame" + data);
            //如果不是玩家自己，则将玩家的牌都放倒
            var seatIndex = data.seatindex;
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
            var hupai = data.hupai;
            var isZimo = data.iszimo;
            //只能隐藏本家的showAction
            if (seatIndex == cc.vv.gameNetMgr.seatIndex) {
                self.hideAllOptions();
            }
            if (isZimo) {
                cc.vv.mahjongmgr.getActionSounds("zimo");
                self._playEfxs[localIndex].play("play_zimo");
            } else {
                cc.vv.mahjongmgr.getActionSounds("hu");
                self._playEfxs[localIndex].play("play_hu");
            }
        });

        this.node.on('mj_count', function (data) {
            self._mjcount.string = cc.vv.gameNetMgr.numOfMJ + "张";
        });

        this.node.on('game_num', function (data) {
            self._gamecount.string = "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";
        });

        this.node.on('game_over', function (data) {
            console.log("game_over of MJGame" + data.detail);
            self._defectNum = -1;
            self.isShowTing = false;
            if (cc.vv.baoTingData) {
                cc.vv.baoTingData.baoTingStatus = false;
                cc.vv.baoTingData.tingPaiStatus = null;
            } else {
                cc.vv.baoTingData = {
                    baoTingStatus: false,
                    tingPaiStatus: null,
                };
            }
            self.hideOptions();
            self.hideChupai();
            self.hideChiOptions();
            if (cc.vv.gameType.isCoinGame() && cc.vv.gameNetMgr.seats === null) {
                console.log('isCoin game and myself return form game ,do not run initShowOtherHolds function');
                return;
            }
            self.initShowOtherHolds(data.detail.overs);
        });


        this.node.on('game_chupai_notify', function (data) {
            console.log('game_chupai_notify/MJGame.js', data.detail);
            //出牌返回隐藏原来选中的牌，重置
            if (self._selectedMJ) {
                self._selectedMJ.y = 0;
                console.log("重置");
                self._selectedMJ = null;
            }
            cc.vv.gameNetMgr.dispatchEvent('stop_alarm_push');
            var seatData = data.detail.seatData;
            //如果是自己，则隐藏最后一张手牌
            if (seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
                // self.initMahjongs();
                var sprite = self._myMJArr[self.paiNumb];
                sprite.node.mjId = null;
                sprite.spriteFrame = null;
                sprite.node.active = false;
            } else { //如果为其他人
                self.initMopai(seatData.seatindex, null);
            }
            //出牌后，刷新手牌。
            self.initHolds(seatData);

            self.showAllHolds();
            //显示那张牌。
            // self.showChupai();
            console.log("data.detail.pai" + data.detail.pai);
            var audioUrl = cc.vv.mahjongmgr.getAudioURLByMJID(data.detail.pai);
            cc.vv.audioMgr.playSFX(audioUrl);

        });

        this.node.on('guo_notify', function (data) {
            console.log("guo_notify");
            self.hideChupai();
            var seatData = data.detail;
            cc.vv.audioMgr.playSFX("give.mp3");

            cc.vv.gameNetMgr.dispatchEvent('stop_alarm_push');

        });

        this.node.on('guo_result', function (data) {
            self.hideAllOptions();
        });

        // this.node.on('game_dingque_finish', function(data) {
        //     self.initMahjongs();
        // });

        this.node.on('peng_notify', function (data) {
            var seatData = data.detail;
            self.hideChupai();
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
            self._playEfxs[localIndex].play("play_peng");
            cc.log("localIndex=" + localIndex, "_playEfxs.length=" + self._playEfxs.length);
            self.hideAllOptions();
            self.initHolds(seatData);
            cc.vv.mahjongmgr.getActionSounds("peng");
        });

        this.node.on('chi_notify', function (data) {
            self.hideChupai();
            console.log("chi_notify");
            var seatData = data.detail;
            self.initHolds(seatData);
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
            cc.log("localIndex=" + localIndex, "_playEfxs.length=" + self._playEfxs.length);

            self._playEfxs[localIndex].play("play_chi");
            self.hideAllOptions();
            cc.vv.mahjongmgr.getActionSounds("chi");
        });

        /**播放鸡的动画 */
        this.node.on('chongfengji_push_mjg', function (data) {
            var userId = data.detail.userId; //座位id
            var roosterId = data.detail.type; //鸡种
            console.log("播放鸡的动画->" + data);
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(userId);
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(idx);
            //显示动画
            // self._playEfxs[localIndex].play("play_chi");
            console.log(self._playEfxs.length);
            console.log("userId=" + userId + ";roosterId=" + roosterId + ";localIndex=" + localIndex);
            // return;
            switch (roosterId) {
                case 0: //冲金鸡
                    self._playEfxs[localIndex].play("play_golde_rooster");
                    break;
                case 1: //冲银鸡
                    self._playEfxs[localIndex].play("play_yin_rooster");
                    break;
                case 2: //冲乌鸡
                    self._playEfxs[localIndex].play("play_wu_rooster");
                    break;
                case 3: //冲挖鸡
                    self._playEfxs[localIndex].play("play_wa_rooster");
                    break;
                case 4: //责任鸡
                    // self._playEfxs[localIndex].play("play_zeren_rooster"); //不显示动画，显示责任鸡
                    //
                    break;
            }
        });
        /**翻鸡 */
        this.node.on("play_fan_rooster_anim", function (data) {
            self._play_fan_rooster_anim.play("play_fan_rooster");
        });
        this.node.on('wait_other', function (data) {
            console.log("wait_other");
            self.hideAllOptions();
        });


        this.node.on('gang_notify', function (data) {
            console.log("gang_notify", data.detail);
            self.hideChupai();
            var data = data.detail;
            var seatData = data.seatData;
            var gangtype = "" + data.gangtype;
            console.log("gangType=", gangtype);
            self.initHolds(seatData);

            var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
            cc.log("localIndex=" + localIndex, "_playEfxs.length=" + self._playEfxs.length);
            self._playEfxs[localIndex].play("play_gang");
            self.hideAllOptions();
            cc.vv.mahjongmgr.getActionSounds(gangtype);
        });

        this.node.on("hangang_notify", function (data) {
            console.log("hangang_notify");
            var data = data.detail;
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(data);
            self._playEfxs[localIndex].play("play_gang");
            self.hideAllOptions();
            cc.vv.mahjongmgr.getActionSounds("gang");
        });

        this.node.on("game_begin", function (data) {
            var data = data.detail;
            console.log("init_caishen:" + data);
            if (self.caiShen == null || self.caiShenTip == null) {
                self.initCaishen();
            }

            self.dizhu.node.active = true;
            self.caiShen.node.active = true;
            self.caiShenTip.node.active = true;
            self.setSpriteFrameByMJID("M_", self.caiShen, cc.vv.gameNetMgr.caishu);
            self.caiShen.node.active = false;
            console.log(cc.vv.gameNetMgr.button);
            self.caiShenTip.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("B_", cc.vv.gameNetMgr.caishu);
            // self.onGameBeign();
        });

        this.node.on("youxian_push", function (data) {
            // var data=data.detail;
            // console.log("youxian_push");
            // console.log(data);
        });

        this.node.on("banker_push", function (data) {
            console.log("banker_push of MJGame.js");
            //从准备节点转到游戏节点
            self.initMJTable();
        });
        this.node.on("paidun_push", function (data) {
            console.log("paidun_push of MJGame.js");
            //从准备节点转到游戏节点
            self.initMJTable();
        });

        this.node.on("show_defect_card_bre", function (data) {
            console.log("show_defect_card_bre");
            self.showHolds();
            self.initMahjongs();
            var holds = cc.vv.gameNetMgr.seats[cc.vv.gameNetMgr.seatIndex].holds;
            //如果为13张就是隐藏第14张
            if (holds.length == self.paiNumb) {
                self.initMopai(cc.vv.gameNetMgr.seatIndex, null);
            }

            var seats = cc.vv.gameNetMgr.seats;
            var idx = cc.vv.gameNetMgr.getLocalIndex(cc.vv.gameNetMgr.button);
            for (var i in seats) {
                var seatData = seats[i];
                var localIndex = cc.vv.gameNetMgr.getLocalIndex(i);
                if (localIndex != 0) {
                    let isShowlastPai = localIndex === idx ? -1 : null;
                    self.initMopaiAll(i, null);
                    self.initOtherMahjongs(seatData, "other");
                    if (idx === localIndex) {
                        self.initMopai(i, -1);
                    }
                }
            }
        });

        this.node.on("game_dingque", function (data) {
            self.onGameBeign();
        });

        this.node.on("game_over_ready", function (data) {
            console.log("game_over_ready of MJGame.js");
            if ("playing" == cc.vv.gameNetMgr.gamestate) {
                console.log("game is playing");
                return
            }
            self.gameRoot.active = false;
            self.prepareRoot.active = true;

        });
    },

    hideAllOptions: function () {
        this.hideOptions();
        this.hideChiOptions();
        cc.vv.gameNetMgr.dispatchEvent('stop_alarm_push');
    },

    /**显示出牌 */
    showChupai: function () {
        var pai = cc.vv.gameNetMgr.chupai;
        console.log("showChuPai" + pai);
        if (pai >= 0) {
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(cc.vv.gameNetMgr.turn);
            var sprite = this._chupaiSprite[localIndex];
            sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", pai);
            sprite.node.active = true;
        }
    },

    /**添加听牌 */
    addBtnTing: function () {
        console.log("添加听牌");
        this._options.active = true;
        this.isShowTing = true;
        //pai_bottom
        for (var i = 0; i < this._options.childrenCount; ++i) {
            var child = this._options.children[i];
            if (child.btnType == "btnTing") {
                child.active = true;
                return;
            }
            if (child.name == "op" && child.active == false) {
                child.active = true;
                var opTarget = child.getChildByName("opTarget");
                opTarget.active = false;
                //背板
                var pai_bottom = child.getChildByName("pai_bottom");
                pai_bottom.active = false;
                //
                //隐藏其他按钮
                for (var j = 0; j < child.childrenCount; j++) {
                    var childNode = child.children[j];
                    console.log(childNode.name);
                    if (childNode.name.indexOf("btn") > -1) {
                        childNode.active = false;
                        console.log(childNode.name);
                    }
                }
                var btn = child.getChildByName("btnTing");
                btn.active = true;
                console.log("用于确定选择类型。");
                //用于确定选择类型。
                child.btnType = "btnTing";
                child.opsNum = i;
                return;
            }
        }
    },

    /**添加选择按钮 */
    addOption: function (btnName, pai) {
        console.log("addOption");
        for (var i = 0; i < this._options.childrenCount; ++i) {
            var child = this._options.children[i];
            if (child.name == "op" && child.active == false) {
                child.active = true;
                //背板
                var pai_bottom = child.getChildByName("pai_bottom");
                pai_bottom.active = true;
                var opTarget = child.getChildByName("opTarget");
                opTarget.active = true;

                var sprite = child.getChildByName("opTarget").getComponent(cc.Sprite);
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", pai);
                var btn = child.getChildByName(btnName);
                btn.pai = pai;
                //隐藏其他按钮
                for (var j = 0; j < child.childrenCount; j++) {
                    var childNode = child.children[j];
                    // console.log(childNode.name);
                    if (childNode.name.indexOf("btn") > -1) {
                        childNode.active = false;
                        // console.log(childNode.name);
                    }
                }
                btn.active = true;
                //用于确定选择类型。
                child.btnType = btnName;
                child.opsNum = i;
                return;
            }
        }
    },

    addChiOption: function (pai, chipaiArr) {
        for (var i = 0; i < this._options.childrenCount; ++i) {
            var child = this._options.children[i];
            if (child.name == "op" && child.active == false) {
                child.active = true;
                var sprite = child.getChildByName("opTarget").getComponent(cc.Sprite);
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", pai);
                var btn = child.getChildByName("btnChi");
                btn.active = true;
                btn.pai = pai;

                child.btnType = "btnChi"

                //先清空
                this._chiPaiInfs.length = 0;

                for (var i = 0; i < chipaiArr.length; ++i) {
                    var data = chipaiArr[i];
                    // console.log("chipaiArr="+data+" chipaiArr.length"+chipaiArr.length);
                    this._chiPaiInfs.push(data);
                }
                return;
            }
        }

    },

    addJustChiOption: function (pai, chipaiArr) {
        //先清空
        this._chiPaiInfs.length = 0;

        for (var i = 0; i < chipaiArr.length; ++i) {
            var data = chipaiArr[i];
            // console.log("chipaiArr="+data+" chipaiArr.length"+chipaiArr.length);
            this._chiPaiInfs.push(data);
        }

        console.log("onOptionClicked is chi");
        //隐藏ops
        if (this._options.active) {
            this.hideOptions();
        }

        this.hideChiOptions();
        this._chiOptions.active = true;

        var len = this._chiPaiInfs.length / 3;
        //不能超过3
        len = len > 3 ? 3 : len;
        var paiArr = this._chiPaiInfs;

        for (var i = 0; i < len; i++) {
            cc.log("i=" + i);
            var j = i + 1;
            var name = "op_" + j;
            var child = this._chiOptions.getChildByName(name);
            this._chiOptions.getChildByName("New Layout").active = true;
            // cc.log(child.name);
            //显示出来
            child.active = true;
            var pai = child.getChildByName("pai_1").getComponent(cc.Sprite);
            this.setSpriteFrameByMJID("M_", pai, paiArr[i * 3 + 0]);
            var pai = child.getChildByName("pai_2").getComponent(cc.Sprite);
            this.setSpriteFrameByMJID("M_", pai, paiArr[i * 3 + 1]);
            var pai = child.getChildByName("pai_3").getComponent(cc.Sprite);
            this.setSpriteFrameByMJID("M_", pai, paiArr[i * 3 + 2]);

            child.paiArr = [paiArr[i * 3 + 0], paiArr[i * 3 + 1], paiArr[i * 3 + 2]];
            console.log("chipai Arr=" + child.paiArr);
        }

    },

    hideOptions: function (data) {
        this._options.active = false;
        for (var i = 0; i < this._options.childrenCount; ++i) {
            var child = this._options.children[i];
            if (child.name == "op") {
                child.active = false;
                child.getChildByName("btnPeng").active = false;
                child.getChildByName("btnGang").active = false;
                child.getChildByName("btnHu").active = false;
                child.getChildByName("btnChi").active = false;
            }
        }
    },

    hideChiOptions: function () {
        this._chiOptions.active = false;
        for (var i = 0; i < this._chiOptions.childrenCount; i++) {
            var child = this._chiOptions.children[i];
            // console.log("child.name"+child.name);
            if (child.name == "btnGuo") //把弃过滤掉。
            {
                continue;
            }
            child.active = false;
        }
    },

    showChiOptions: function () {
        console.log("showChiOptions childrenCount" + this._chiOptions.childrenCount);
        this._chiOptions.active = true;
        for (var i = 0; i < this._chiOptions.childrenCount; i++) {
            var child = this._chiOptions.children[i];
            console.log("child.name" + child.name);
            if (child.name == "btnGuo") //把弃过滤掉。
            {
                continue;
            }
            child.active = true;
        }
    },

    showAction: function (data) {
        //如果已经显示了听则不响应杠牌
        if (this.isShowTing == true) {
            console.log("如果已经显示了听则不响应杠牌....this.isShowTing->" + this.isShowTing);
            return;
        }
        if (data == null) {
            return;
        }
        console.log("showAction data=", data);
        this.hideOptions();
        this.hideChiOptions();
        //重置
        this._options.confirmGou.init(false);
        if (data && (!data.hu) && (!data.gang) && (!data.peng) && (data.chi)) {
            console.log("just chi option");
            cc.vv.LogUtil.printLog("game_action", "showAction", "game_action_push通知,只显示吃动作", JSON.stringify(data), 1);
            this.addJustChiOption(data.pai, data.chipai);
        } else if (data && (data.hu || data.gang || data.peng || data.chi)) {
            //清除吃的选择数组
            this._chiPaiInfs.length = 0;
            this._options.active = true;
            //用于记录牌
            // cc.vv.gameNetMgr.paiOfHGPC=data.pai;
            if (data.hu) {
                this._options.confirmGou.init(true);
                this.addOption("btnHu", data.pai);
                cc.vv.LogUtil.printLog("game_action", "showAction", "添加一个胡动作", JSON.stringify(data), 1);
            }
            if (data.chi) {
                // this.addOption("btnChi",data.chipai);
                this.addChiOption(data.pai, data.chipai);
                cc.vv.LogUtil.printLog("game_action", "showAction", "添加一个吃动作", JSON.stringify(data), 1);
            }
            if (data.peng) {
                this.addOption("btnPeng", data.pai);
                cc.vv.LogUtil.printLog("game_action", "showAction", "添加一个碰动作", JSON.stringify(data), 1);
            }

            if (data.gang) {
                for (var i = 0; i < data.gangpai.length; ++i) {
                    var gp = data.gangpai[i];
                    this.addOption("btnGang", gp);
                    cc.vv.LogUtil.printLog("game_action", "showAction", "添加一个杠动作", JSON.stringify(data), 1);
                }
            }
        }
    },

    /**初始化显示文本 */
    initWanfaLabel: function () {
        var wanfa = cc.find("Canvas/dishu/wanfa").getComponent(cc.Label);
        // wanfa.string = cc.vv.gameNetMgr.getWanfa();
        if (cc.vv.gameNetMgr.dishu) {
            var str = "";
            if (cc.vv.gameNetMgr.dishu == 1) {
                str = "底数2468";
            } else if (cc.vv.gameNetMgr.dishu == 2) {
                str = "无进阶底";
            } else {
                console.log("wanfa label erro!");
                return;
            }
            wanfa.string = str;
        }
    },

    /**初始化财神牌 */
    initCaiShen: function () {
        var caiShen = cc.find("Canvas/game/caishu/pai").getComponent(cc.Sprite);
        this.caiShen = caiShen;
        var dizhu = cc.find("Canvas/game/caishu/difen/fen").getComponent(cc.Label);
        this.dizhu = dizhu;

        if (caiShen) {
            // console.log("initCaiShen ok");
            this.setSpriteFrameByMJID("M_", caiShen, 31);
            this.caiShen.node.active = false;
        } else {
            console.log("caiShen is null");
        }
        if (dizhu) {
            dizhu.string = cc.vv.gameNetMgr.difen;
            this.dizhu.node.active = false;
        }

        // console.log("caishen");
        var caiShenTip = cc.find("Canvas/game/caishuqiang/caishu").getComponent(cc.Sprite);
        this.caiShenTip = caiShenTip;
        this.caiShenTip.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("B_", 31);
        this.caiShenTip.node.active = false;

        // this.caiShen.active=false;
    },

    initHoldsYouXian: function () {
        var str = ("cc.vv.gameNetMgr.turn" + cc.vv.gameNetMgr.turn + " localIndex" + cc.vv.gameNetMgr.localIndex);
        //是否为本家出牌。
        if (cc.vv.gameNetMgr.turn == cc.vv.gameNetMgr.seatIndex) {
            str += " is turn";
            console.log(str);
            this.checkYouXianPai(); //用于断线重连时，要检查优先牌。
        } else {
            str += " is other ";
            console.log(str);
            this.showAllHolds();
        }

    },

    /**当出现吃碰杠时，要把对应的手牌隐藏。*/
    initHolds: function (seatData) {
        console.log("initHolds");
        if (seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
            this.initMahjongs();
        } else {
            console.log("initOtherMahjongs of initHolds");
            this.initOtherMahjongs(seatData, "other");
        }
    },

    initHupai: function (localIndex, pai) {
        if (cc.vv.gameNetMgr.conf.type == 0) {
            var hupailist = this._hupaiLists[localIndex];
            for (var i = 0; i < hupailist.children.length; ++i) {
                var hupainode = hupailist.children[i];
                if (hupainode.active == false) {
                    var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
                    hupainode.getComponent(cc.Sprite).spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, pai);
                    hupainode.active = true;
                    break;
                }
            }
        }
    },

    initMJTable: function (isPreLoading) {
        console.log("initMJTable");
        if (!isPreLoading) {
            console.log("init hide Action");
            //隐藏出牌，选择页面，吃选择页面。
            this.hideChupai();
            this.hideOptions();
            this.hideChiOptions();
            this.chishuqiang.active = false;
        }

        var gameChild = this.node.getChildByName("game");

        var seatsName = cc.vv.setPeople.getSeats();
        cc.log("initMaiOrDingDi", "sides=" + seatsName);
        for (var i = 0; i < seatsName.length; i++) {
            var sideChild = gameChild.getChildByName(seatsName[i]);
            var seat = sideChild.getChildByName("holds");
            seat.active = false;
        }

        //已经开始游戏了，隐藏准备页面，显示麻将页面。
        this.gameRoot.active = true;
        this.prepareRoot.active = false;


    },

    //显示手牌
    showHolds: function () {
        console.log("show Holds pai");
        var gameChild = this.node.getChildByName("game");
        var seatsName = cc.vv.setPeople.getSeats();
        cc.log("initMaiOrDingDi", "sides=" + seatsName);
        for (var i = 0; i < seatsName.length; i++) {
            var sideChild = gameChild.getChildByName(seatsName[i]);
            var seat = sideChild.getChildByName("holds");
            seat.active = true;
        }
    },

    onGameBeign: function (isHideAllOption) {

        if (!isHideAllOption) {
            this.hideChupai();
            this.hideOptions();
            this.hideChiOptions();
        }
        var gameChild = this.node.getChildByName("game");

        console.log("gamestate=" + cc.vv.gameNetMgr.gamestate);
        if (cc.vv.gameNetMgr.gamestate == cc.vv.GameStatus.IDLE) {
            console.log("this.prepareRoot.active is true");
            return;
        }
        this.chishuqiang.active = false;

        var seatsName = cc.vv.setPeople.getSeats();
        cc.log("onGameBeign", "sides=" + seatsName);
        var str = "";
        for (var i in seatsName) {
            str += " " + seatsName[i];
            var sideChild = gameChild.getChildByName(seatsName[i]);
            var seat = sideChild.getChildByName("holds");
            seat.active = true;
        }

        //已经开始游戏了，隐藏准备页面，显示麻将页面。
        console.log(str + " /n" + "this.gameRoot.active is true");
        this.gameRoot.active = true;
        this.prepareRoot.active = false;
        //初始化手牌。
        this.initMahjongs();
        var seats = cc.vv.gameNetMgr.seats;
        for (var i in seats) {
            var seatData = seats[i];
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(i);
            if (localIndex != 0) {
                this.initMopaiAll(i, null);
                this.initOtherMahjongs(seatData, "other");
            }
        }

        var holds = cc.vv.gameNetMgr.seats[cc.vv.gameNetMgr.seatIndex].holds;
        //如果为13张就是隐藏第14张
        if (holds.length == this.paiNumb) {
            var sprite = this._myMJArr[this.paiNumb];
            sprite.node.mjId = null;
            sprite.spriteFrame = null;
            sprite.node.active = false;
        }
    },

    resetMJSelect: function () {
        if (this._selectedMJ) {
            this._selectedMJ.y = 0;
            console.log("重置");
        }
        this._selectedMJ = null;

        if (this._touchedMJ) {
            this._touchedMJ.y = 0;
            console.log("重置");
        }
        this._touchedMJ = null;
        console.log("resetMJSelect  重置");
    },

    onMJClicked: function (event) {
        console.log("onMJClicked event.target" + event.target.mjId);
        if (cc.vv.gameNetMgr.isHuanSanZhang) {
            this.node.emit("mj_clicked", event.target);
            return;
        }

        //如果不是自己的轮子，则忽略
        if (cc.vv.gameNetMgr.turn != cc.vv.gameNetMgr.seatIndex) {
            console.log("not your turn." + cc.vv.gameNetMgr.turn);
            if (this._selectedMJ == event.target) {
                this._selectedMJ.y = 0;
                console.log("重置");
                this._selectedMJ = null;
                // return;
            } else {
                event.target.y = 60;
                this._selectedMJ = event.target;
            }
            return;
        }

        for (var i = 0; i < this._myMJArr.length; ++i) {
            if (event.target == this._myMJArr[i].node) {
                //如果是再次点击，则出牌
                if (event.target == this._selectedMJ) {
                    if (cc.vv.baoTingData && cc.vv.baoTingData.baoTingStatus == false && this.checkIsPassTing(event.target.mjId)) {
                        console.log("touchStart 检测最后一张是出牌后会听牌");
                        if (this._selectedMJ) {
                            this._selectedMJ.y = 0;
                            this._touched_y = 60;
                            this._selectedMJ = event.target;
                            this._selectedMJ.y = 60;
                        }
                        this.addBtnTing();
                    } else {
                        this.shoot(this._selectedMJ.mjId);
                    }
                    return;
                }
                if (this._selectedMJ != null) {
                    this._selectedMJ.y = 0;
                    console.log("重置");
                    console.log("this._selectedMJ.y");
                }
                event.target.y = 60;
                console.log("event.target.y=" + event.target.y);
                this._selectedMJ = event.target;
                //检测这张牌,打出后，是否会听牌,会弹出听牌选择。
                if (cc.vv.baoTingData && cc.vv.baoTingData.baoTingStatus == false && this.checkIsPassTing(this._selectedMJ.mjId)) {
                    console.log("检测最后一张是出牌后会听牌");
                    this.addBtnTing();
                }
                return;
            }
        }
    },

    setTouchEvent: function (sprite) {
        var self = this;
        sprite.node.on(cc.Node.EventType.TOUCH_START,
            function (event) {
                // console.log("TOUCH_START event.getLocationY="+event.getLocationY()+" mjId="+event.target.mjId);
                if (!self.isTouch(event.target.mjId)) {
                    console.log("this not touch");
                    return;
                }
                self._touched_y = -1;
                //点击不同的牌时，把之前的牌设置原位。
                if (self._touchedMJ != null && self._touchedMJ != event.target) {
                    console.log("TOUCH_START self._touchedMJ.y=0;");
                    self._touchedMJ.y = 0;
                }
                self._touchedMJ = event.target;
                event.target.start_y = event.getLocationY();
                console.log("TOUCH_START self._touched_y=" + self._touched_y);

                return;

            }, this);

        sprite.node.on(cc.Node.EventType.TOUCH_MOVE,
            function (event) {
                if (!self.isTouch(event.target.mjId)) {
                    console.log("this not touch");
                    return;
                }
                var distance = event.getLocationY() - event.target.start_y;
                self._touched_y = (distance) > 15 ? (distance > 150 ? 150 : distance) : -1;
                // console.log("self._touched_y"+self._touched_y);

            }, this);


        var handler = function (event) {

            if (!self.isTouch(event.target.mjId)) {
                console.log("this not touch");
                return;
            }

            if (self._touched_y > 60 && (cc.vv.gameNetMgr.turn == cc.vv.gameNetMgr.seatIndex)) {
                console.log("can chu pai" + event.target.mjId);
                //检测最后一张是出牌后会听牌
                if (cc.vv.baoTingData && cc.vv.baoTingData.baoTingStatus == false && self.checkIsPassTing(event.target.mjId)) {
                    console.log("touchStart 检测最后一张是出牌后会听牌");
                    if (self._selectedMJ) {
                        self._selectedMJ.y = 0;
                        self._touched_y = 60;
                        self._selectedMJ = event.target;
                        self._selectedMJ.y = 60;
                    }
                    self.addBtnTing();
                } else {
                    self.shoot(event.target.mjId);
                }
            } else {
                console.log("can not chu pai" + event.target.mjId);
            }

            console.log("TOUCH_CANCEL event.getLocationY=" + event.getLocationY() + " start_y=" + event.target.start_y + " mjId=" + event.target.mjId);
            var distance = event.getLocationY() - event.target.start_y;
            console.log("distance" + distance + " self._touched_y" + self._touched_y);
            // if (distance > 60) {
            //     self._touched_y = 0;
            // }
            // console.log("self._touched_y"+self._touched_y);
            //不是自己轮子不能出牌移动松了
            if (cc.vv.gameNetMgr.turn != cc.vv.gameNetMgr.seatIndex) {
                self._touched_y = 0;
            }
        }

        sprite.node.on(cc.Node.EventType.TOUCH_END, handler, this);

        sprite.node.on(cc.Node.EventType.TOUCH_CANCEL, handler, this);
    },
    /**检验是否是自己缺一门的花色的牌 */
    checkIsDefectCardColorByMjId: function (mjId) {
        if (this._defectNum == -1) {
            console.log("defectNum==-1");
            if (cc.vv.defectType == undefined) {
                return false;
            }
            // console.log("checkIsDefectCardColorByMjId",cc.vv.defectType);
            switch (parseInt(cc.vv.defectType)) {
                case 3:
                    this._defectNum = 2;
                    break;
                case 2:
                    this._defectNum = 1;
                    break;
                case 1:
                    this._defectNum = 0;
                    break;
            }
        }
        if (mjId >= 9 * this._defectNum && mjId < 9 * this._defectNum + 9) {
            return true;
        } else {
            return false;
        }
    },
    isTouch: function (mjId) {
        // console.log("mjId=" + mjId);
        var isCan = true;
        if (cc.vv.gameNetMgr.caishu == mjId) {
            console.log("this caishen pai");
            return false;
        }

        if (this._selectedMJ) {
            if (cc.vv.baoTingData && cc.vv.baoTingData.baoTingStatus && mjId != this._selectedMJ.mjId) {
                return false;
            }
        } else {
            if (cc.vv.baoTingData && cc.vv.baoTingData.baoTingStatus) {
                return false;
            }
        }

        //判断是否还有没有出的定缺的牌
        if (this.isHaveDefectCard()) {
            //只能出定缺的牌
            if (!this.checkIsDefectCardColorByMjId(mjId)) {
                return false;
            }
        }
        var youXianArr = cc.vv.gameNetMgr.youXianPai;
        if (youXianArr && youXianArr.length > 0) {
            var str = " youXianPai=" + youXianArr;
            //不本人出牌，但可以选择。
            if (cc.vv.gameNetMgr.turn != cc.vv.gameNetMgr.seatIndex) {
                return true;
            }
            var idx = cc.vv.gameNetMgr.youXianPai.indexOf(mjId);
            str += ("isTouch of idx=" + idx);
            if (-1 == idx) {
                var mj = "" + mjId;
                str += " mj_string=" + mj;
                idx = cc.vv.gameNetMgr.youXianPai.indexOf(mj);
            }
            str += " idx=" + idx;
            // console.log(str);
            return (idx == -1) ? false : true;

        }
        return isCan;
    },

    //出牌
    shoot: function (mjId) {
        if (mjId == null) {
            return;
        }
        console.log("send chupai =", mjId);
        cc.vv.net.send('chupai', mjId);

        cc.vv.gameNetMgr.dispatchEvent('stop_alarm_push');

        // this._touchedMJ.y=5;
        this._touched_y = -1;
        //
        if (cc.vv.baoTingData) {
            //如果有听牌数据清空，以后没有听牌机会了，服务也不会推送此数据 
            cc.vv.baoTingData.tingPaiStatus = null;
        }
    },

    getMJIndex: function (side, index) {
        // if(side=="right"){
        //     return 16-index;
        // }
        var self = this;
        if (side == "right" || side == "up") {
            return self.paiNumb - index;
        }
        return index;
    },

    /**摸牌显示 */
    initMopai: function (seatIndex, pai) {
        console.log("initMopai of MJGame.js");
        var self = this;
        var localIndex = cc.vv.setPeople.getSideIdx(seatIndex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);

        var gameChild = this.node.getChildByName("game");
        var sideChild = gameChild.getChildByName(side);
        var holds = sideChild.getChildByName("holds");

        var lastIndex = this.getMJIndex(side, self.paiNumb);
        var nc = holds.children[lastIndex];

        nc.scaleX = 1.0;
        nc.scaleY = 1.0;

        if (pai == null) { //隐藏
            nc.active = false;
        } else if (pai === 0 || pai > 0) { //显示手牌
            nc.active = true;
            if (side == "up") {
                nc.scaleX = 1;
                nc.scaleY = 1;
            }
            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, pai);
        } else if (pai != null) { //显示手牌背面
            nc.active = true;
            if (side == "up") {
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
            }
            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = cc.vv.mahjongmgr.getHoldsEmptySpriteFrame(side);
            // sprite.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame(side);
        }

    },

    /**除了操作最后一张牌，还会把前面的牌点亮 */
    initMopaiAll: function (seatIndex, pai) {
        console.log("initMopaiArr of MJGame.js");
        var self = this;
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
        var str = "before =" + localIndex;
        //用于二人麻将
        localIndex = cc.vv.setPeople.getReadIdx(localIndex);
        cc.log("str " + "late=" + localIndex);

        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);

        var gameChild = this.node.getChildByName("game");
        var sideChild = gameChild.getChildByName(side);
        var holds = sideChild.getChildByName("holds");

        var lastIndex = this.getMJIndex(side, self.paiNumb);
        var nc = holds.children[lastIndex];

        nc.scaleX = 1.0;
        nc.scaleY = 1.0;

        if (pai == null) {
            nc.active = false;
        } else if (pai >= 0) {

        } else if (pai != null) {
            nc.active = true;
            if (side == "up") {
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
            }
            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = cc.vv.mahjongmgr.getHoldsEmptySpriteFrame(side);
        }

        var str = "";
        var spriteFrame = cc.vv.mahjongmgr.getHoldsEmptySpriteFrame(side);
        //显示其他13张牌
        for (var i = self.paiNumb - 1; i > -1; i--) {
            str += " i=" + i;
            var lastIndex = this.getMJIndex(side, i);
            var nc = holds.children[lastIndex];
            nc.scaleX = 1.0;
            nc.scaleY = 1.0;
            nc.active = true;
            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        }
        // console.log(str);
    },

    //隐藏吃碰杠
    initOtherMahjongs: function (seatData, type) {
        var self = this;
        var str = " initOtherMahjongs";
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
        var str = "before =" + localIndex;
        //用于二人麻将
        localIndex = cc.vv.setPeople.getReadIdx(localIndex);
        cc.log("str " + "late=" + localIndex);

        if (localIndex == 0) {
            console.log("localIndex =0 of initOtherMahjongs");
            return;
        }
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var game = this.node.getChildByName("game");
        var sideRoot = game.getChildByName(side);
        var sideHolds = sideRoot.getChildByName("holds");


        //取得吃，碰，扛长度。
        var num = cc.vv.gameNetMgr.getLen(seatData, type);
        str += " num=" + num;
        for (var i = 0; i < num; ++i) {
            var idx = this.getMJIndex(side, i);
            sideHolds.children[idx].active = false;
        }
        console.log(str);
    },

    /**排序手牌 */
    sortHolds: function (seatData) {
        var holds = seatData.holds;
        if (holds) {
            //如果手上的牌的数目是2,5,8,11,14，表示最后一张牌是刚摸到的牌
            var mopai = null;
            var l = holds.length
            if (l == 2 || l == 5 || l == 8 || l == 11 || l == 14 || l == 17) {
                mopai = holds.pop();
            }

            // var dingque = seatData.dingque;
            var caishen = cc.vv.gameNetMgr.caishu;
            cc.vv.mahjongmgr.sortMJ(holds, caishen);
            //按照定缺方式排序牌
            // console.log(holds);
            this.sortHoldsByDefectColor(holds);
            // console.log("排序后");
            // console.log(holds);
            //将摸牌添加到最后
            if (mopai != null) {
                holds.push(mopai);
            }
            // console.log(holds);
            return holds;
        }

        return null;
    },
    /**通过定缺花色排序，将自己缺的一门花色排序在最后一个 */
    sortHoldsByDefectColor: function (holds) {
        var self = this;
        var startIndex = -1;
        var lastIndex = -1;
        var count = 0;
        for (var i = 0, len = holds.length; i < len; i++) {
            if (this.checkIsDefectCardColorByMjId(holds[i])) {
                count++;
                if (startIndex == -1) {
                    startIndex = i;
                    lastIndex = i;
                } else {
                    lastIndex = i;
                }
            }
        }
        if (count != 0) {
            var defectCards = holds.slice(startIndex, lastIndex + 1);
            // console.log(defectCards);
            // console.log(holds);
            holds.splice(startIndex, count);
            // console.log(holds);
            for (var i = 0, len = defectCards.length; i < len; i++) {
                holds.push(defectCards[i]);
            }
            // console.log(holds);
        }
    },

    initMyholds: function () {
        console.log("initMyholds");
        var seats = cc.vv.gameNetMgr.seats;
        var seatData = seats[cc.vv.gameNetMgr.seatIndex];
        var holds = seatData.holds;
        for (var i = 0; i <= this.paiNumb; i++) {
            if (i == this.paiNumb && holds % 3 == 1) {
                continue;
            }
            this._myMJArr[i].node.active = true;
        }
    },

    //把出现的吃/碰/杠的对应的位置的位置隐藏
    initMahjongs: function () {
        console.log("初始化自己的手牌");
        var seats = cc.vv.gameNetMgr.seats;
        var seatData = seats[cc.vv.gameNetMgr.seatIndex];
        var holds = this.sortHolds(seatData);

        if (holds == null) {
            console.log("holds is null ");
            return;
        }
        var str = ("length->" + holds.length + " initMahjongs myself holds=" + holds);
        var lackingNum = cc.vv.gameNetMgr.getLen(seatData);
        if (null == lackingNum) {
            lackingNum = 0;
        }
        cc.vv.LogUtil.printLog("initMahjongs", "initMahjongs", "初始化自己的手牌", 'lackingNum=' + lackingNum, 1);
        // if (lackingNum < 0 || lackingNum > 13) {
        //     lackingNum = 0;
        //     cc.vv.alert.show("提示", "手牌发送错误 \n 手牌长度为：" + holds.length + " \n 请联系服务端查看！");
        // }
        str += " " + ("lackingNum=" + lackingNum);

        for (var i = 0; i < holds.length; ++i) {
            var mjid = holds[i];
            if ((i + lackingNum) > this.paiNumb) {
                cc.vv.LogUtil.printLog("initMahjongs", null, "开始初始化手牌中", "i=" + i + ' mjId=' + mjid + ' paiNumb=' + this.paiNumb + ' lackingNum=' + lackingNum, 1);
                return;
            }
            var sprite = this._myMJArr[i + lackingNum];
            sprite.node.active = true;
            sprite.node.y = 0; //刷新每张位置为0
            if (!sprite) {
                cc.vv.LogUtil.printLog("initMahjongs", null, "开始初始化手牌,设置Sprite出错", 'i=' + i + ' mjId=' + mjid + ' paiNumb=' + this.paiNumb + ' lackingNum=' + lackingNum, 1);
                return;
            }
            sprite.node.mjId = mjid;
            this.setSpriteFrameByMJID("M_", sprite, mjid);
            try {
                //根据判断显示定缺
                this.setDefectNumShow(sprite);
                sprite.node.getChildByName("caishen").active = false;
                //设置最后一张牌默认选中状态
                if (holds.length % 3 == 2 && i == holds.length - 1) {
                    console.log("设置最后一张牌默认选中状态");
                    // sprite.node.emit(cc.Node.EventType.TOUCH_START);
                    if (this._selectedMJ) {
                        this._selectedMJ.y = 0;
                    }
                    this._selectedMJ = sprite.node;
                    this._touchedMJ = null;
                    sprite.node.y = 60;
                    //检测最后一张是出牌后会听牌
                    if (cc.vv.baoTingData && cc.vv.baoTingData.baoTingStatus == false && this.checkIsPassTing(this._selectedMJ.mjId)) {
                        console.log("检测最后一张是出牌后会听牌");
                        this.addBtnTing();
                    }
                } else {
                    if ((i + lackingNum) === this.paiNumb) {
                        continue;
                    }
                    //不是最后一张
                    if (cc.vv.baoTingData && cc.vv.baoTingData.baoTingStatus) {
                        console.log("已经报听了 //禁用");
                        sprite.node.getComponent(cc.Button).interactable = false;
                    }
                }
            } catch (error) {
                cc.vv.LogUtil.printLog("initMahjongs", null, "开始初始化手牌,显示定缺出错", "i=" + i + ' mjId=' + mjid + ' paiNumb=' + this.paiNumb + ' lackingNum=' + lackingNum +
                'error=' + error, 1);
            }
        }
        for (var i = 0; i < lackingNum; ++i) {
            var sprite = this._myMJArr[i];
            sprite.node.mjId = null;
            sprite.spriteFrame = null;
            sprite.node.active = false;
        }
        console.log(str);
        //如果只有13张，把最后一张隐藏。
        if (holds.length % 3 == 1) {
            console.log("initMahjongs of hide last pai");
            var sprite = this._myMJArr[this.paiNumb];
            sprite.node.mjId = null;
            sprite.spriteFrame = null;
            sprite.node.active = false;
        }
    },

    /***判断是否能够通过报听 */
    checkIsPassTing: function (mjId) {
        if (!cc.vv.baoTingData || !cc.vv.baoTingData.tingPaiStatus) {
            return false;
        }
        //tingPaiStatus是一个key是牌id,value是true与false(是否听牌)
        var tingPaiStatus = cc.vv.baoTingData.tingPaiStatus;
        console.log(cc.vv.baoTingData.tingPaiStatus);
        for (var key in tingPaiStatus) {
            if (key == mjId) {
                return tingPaiStatus[key];
            }
        }
        //{"userId":4,"tingPaiStatus":{"1":true,"2":false,"3":false,"4":true,"5":false,"6":false,"7":true,"16":true}}
        return false;
    },

    /**显示听牌数据逻辑 */
    showTingPaiLogic: function () {
        // this._selectedMJ.mjId
        if (cc.vv.baoTingData && cc.vv.baoTingData.tingPaiStatus) {
            //有报听数据 //cc.vv.baoTingStatus是在哪赋值，还有作用是什么？
            if (!cc.vv.baoTingStatus) {
                //没有报听 
                console.log("没有报听")
                if (this._selectedMJ && this.checkIsPassTing(this._selectedMJ.mjId)) {
                    //选择了牌 并且是出此能报听
                    console.log("选择了牌 并且是出此能报听");
                    this.addBtnTing();
                }
            } else {
                //报听过了
                console.log("报听过了")
                if (this._selectedMJ) {
                    //选择了牌
                    console.log("选择了牌");
                }
            }
        }

    },

    /**初始化显示其他玩家的手牌 */
    initShowOtherHolds: function (seats) {
        console.log("initShowOtherHolds", seats);
        var str = "initShowOtherHolds of MJGame.js";
        // console.log(str);
        if (!seats) {
            console.log("seat= " + seats);
            return;
        }
        //本人的下标
        var seatIdx = cc.vv.gameNetMgr.seatIndex;
        cc.log("seatIdx=" + seatIdx);
        // str1+=" seatIdx"+seatIdx;

        var sides = cc.vv.setPeople.getSeats();
        var gameChild = this.node.getChildByName("game");
        //从myself,right,up,left
        for (var i = 0; i < sides.length; i++) {
            var str_i = "";
            var sideChild = gameChild.getChildByName(sides[i]);
            var holds = sideChild.getChildByName("holds"); //取sprite
            var iconIdx = i;
            if (cc.vv.setPeople.isERMJ()) {
                iconIdx = 2;
            }
            if (cc.vv.setPeople.isThreeMJ() && iconIdx == 2) {
                iconIdx = 3;
            }
            var pre = cc.vv.mahjongmgr.getFoldPre(iconIdx); //取图片
            var men = cc.vv.setPeople.getMen();
            console.log("nem=", men);
            var idx = (seatIdx + i) % men;
            console.log("getDataIdx=", idx);
            var seatData = seats[idx];
            if (!seatData) {
                console.log("seatData=" + seatData);
                return;
            }
            var seat = cc.vv.gameNetMgr.seats[idx];
            var lackingNum = 0;
            if (Array.isArray(seatData.holds)) {
                var paiNumb = this.paiNumb;
                //为14张牌
                if (seatData.holds.length % 3 == 2) {
                    paiNumb = this.paiNumb + 1;
                    if (i == 0) {
                        console.log("just show fourteenth(14) pai", pre)
                        var nc = holds.children[this.paiNumb];
                        var mjid = seatData.holds[seatData.holds.length - 1];
                        console.log("mjid=", mjid);
                        nc.active = true;
                        var sprite = nc.getComponent(cc.Sprite);
                        this.setSpriteFrameByMJID("M_", sprite, mjid);
                        continue;
                    }
                }
                lackingNum = paiNumb - seatData.holds.length;
                // if (i == 0) continue;
            }

            var holdsData = this.sortHolds(seatData);
            if (holdsData == null) {
                console.log(str_i + " holds is null ");
                continue;
            }
            //隐藏吃、碰，杠
            for (var k = 0; k < lackingNum; ++k) {
                str_i += " k=" + k;
                var idx = this.getMJIndex(sides[i], k);
                holds.children[idx].active = false;
            }
            str_i += "j<holds.length+lackingNum=" + holdsData.length + lackingNum;
            //显示手牌
            for (var j = 0; j < holdsData.length; j++) {
                str_i += " h[j]=" + holdsData[j];
                var lastIndex = this.getMJIndex(sides[i], j + lackingNum);
                var nc = holds.children[lastIndex];
                // nc.scaleX = 1.0;
                // nc.scaleY = 1.0;
                if ("up" == sides[i]) {
                    nc.scaleX = 0.58;
                    nc.scaleY = 0.58;
                }
                // if("myself"== sides[i]) {
                //     nc.scaleX=
                // }
                nc.active = true;
                var sprite = nc.getComponent(cc.Sprite);
                // sprite.spriteFrame = spriteFrame;
                if ("myself" == sides[i]) {
                    console.log("myself");
                    this.setSpriteFrameByMJID("M_", sprite, holdsData[j]);
                    continue;
                }
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, holdsData[j]);

            }
            if ((holdsData.length + lackingNum) == this.paiNumb) {
                console.log("set pai14 is false", "i=" + i);
                var lastIndex = this.getMJIndex(sides[i], this.paiNumb);
                var nc = holds.children[lastIndex];
                nc.active = false;
            }
        }
        // console.log(str);
    },

    /**设置麻将的显示 */
    setSpriteFrameByMJID: function (pre, sprite, mjid) {
        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
        sprite.node.active = true;

    },
    /**是否手牌数据中还有自己定缺没有出的牌 */
    isHaveDefectCard: function () {
        // console.log("是否手牌数据中还有自己定缺没有出的牌");
        // console.log(this._defectNum);
        if (this._defectNum == -1) {
            return false;
        }
        var seats = cc.vv.gameNetMgr.seats;
        var seatData = seats[cc.vv.gameNetMgr.seatIndex];
        var holds = seatData.holds;
        for (var i = 0; i < holds.length; i++) {
            var mjId = holds[i];
            if (mjId != null) {
                if (this.checkIsDefectCardColorByMjId(mjId)) {
                    return true;
                }
            }
        }
        return false;
    },
    /**设置定缺显示
     * 当自己还有没有出的定缺的牌->设置其他的为不能出，定缺牌为能出
     * 没有自己定缺的牌->自己的牌都能出
     */
    setDefectNumShow: function (sprite) {
        if (cc.vv.baoTingData && cc.vv.baoTingData.baoTingStatus) {
            return;
        }
        var mjid = sprite.node.mjId;
        // console.log("设置定缺显示mjid->" + mjid);
        // console.log("设置定缺显示->" + this.isHaveDefectCard());
        if (this.isHaveDefectCard()) {
            //还有没有出的定缺的牌
            // console.log("还有没有出的定缺的牌->" + this.checkIsDefectCardColorByMjId());
            if (this.checkIsDefectCardColorByMjId(mjid)) {
                //这个牌时定缺牌
                sprite.node.getComponent(cc.Button).interactable = true;
                // console.log("这个牌时定缺牌");
            } else {
                sprite.node.getComponent(cc.Button).interactable = false;
            }
        } else {
            sprite.node.getComponent(cc.Button).interactable = true;
            // console.log("这个牌时定缺牌");
        }
    },
    //设置为全部手牌可以点击
    showAllHolds: function () {
        //手牌显示
        for (var i = 0; i < this._myMJArr.length; i++) {
            var sprite = this._myMJArr[i];
            if (sprite.node.mjId != null) {
                if (cc.vv.gameNetMgr.caishu == sprite.node.mjId) {
                    // sprite.node.getComponent(cc.Button).interactable = false;
                    sprite.node.getChildByName("caishen").active = true;
                    continue;
                }
                sprite.node.getChildByName("caishen").active = false;
                // sprite.node.getComponent(cc.Button).interactable = true;
            }
            this.setDefectNumShow(sprite);
        }
    },

    isYouXian: function (mjid, mjArr) {
        for (var i = 0; i < mjArr.length; i++) {
            if (mjid == mjArr[i]) {
                return true;
            }
        }
        return false;
    },

    checkYouXianPai: function (data) {
        var str = ("checkYouXianPai");
        //初始化事件监听器
        var self = this;
        var caishen = cc.vv.gameNetMgr.caishu;
        var seats = cc.vv.gameNetMgr.seats;
        str += " " + ("cc.vv.gameNetMgr.seatIndex=" + cc.vv.gameNetMgr.seatIndex);
        var seatData = seats[cc.vv.gameNetMgr.seatIndex];
        // var holds = seatData.holds;
        var holds = this.sortHolds(seatData);
        str + " " + ("holds" + holds + "youXianPai" + cc.vv.gameNetMgr.youXianPai);

        var isYouXian = false;
        if (cc.vv.gameNetMgr.youXianPai) {
            for (var i = 0; i < cc.vv.gameNetMgr.youXianPai.length; i++) {
                var idx = holds.indexOf(cc.vv.gameNetMgr.youXianPai[i]);
                // console.log("holds i="+i+" idx="+idx+" pai="+cc.vv.gameNetMgr.youXianPai[i]);
                //如果youXianPai中有财神
                if (caishen == cc.vv.gameNetMgr.youXianPai[i]) {
                    continue;
                }

                //财神不是风牌时，白板不能优先出。
                var pai = cc.vv.gameNetMgr.youXianPai[i];
                if (29 == pai && caishen < 27) {
                    cc.vv.gameNetMgr.youXianPai.splice(i, 1);
                    str += ("pai=" + pai + " caishen=" + caishen + " youXianPai" + cc.vv.gameNetMgr.youXianPai);
                    continue;
                }

                if (idx != -1) {
                    isYouXian = true;
                    break;
                }
                str += " " + ("youxianPai reset length=0");
            }

        }
        str += " " + ("isYouXian:" + isYouXian);
        // console.log(str);

        //手牌显示
        for (var i = 0; i < this._myMJArr.length; i++) {
            var sprite = this._myMJArr[i];
            // console.log("手牌显示->" + i);
            if (sprite.node.mjId != null) {
                // console.log("sprite.node.mjId="+sprite.node.mjId);
                //是否为财神
                if (caishen != null && caishen != -1) {
                    if (caishen == sprite.node.mjId) {
                        // console.log("mj is caishen");
                        // console.log("continue");
                        // sprite.node.getComponent(cc.Button).interactable = false;
                        sprite.node.getChildByName("caishen").active = true; // 显示财神
                        continue;
                    }

                }

                if (isYouXian) {
                    if (cc.vv.gameNetMgr.youXianPai) {
                        // console.log("cc.vv.gameNetMgr.youXianPai.length"+cc.vv.gameNetMgr.youXianPai.length);
                        //是否还有优先
                        if (cc.vv.gameNetMgr.youXianPai.length > 0) {
                            var mjid = sprite.node.mjId;
                            var paiArr = cc.vv.gameNetMgr.youXianPai;
                            if (self.isYouXian(mjid, paiArr)) {
                                // sprite.node.getComponent(cc.Button).interactable = true;
                                this.setDefectNumShow(sprite);
                            } else {
                                // sprite.node.getComponent(cc.Button).interactable = false;
                            }
                            // console.log("continue");
                            sprite.node.getChildByName("caishen").active = false;
                            continue;
                        }
                    }
                }
                //youXianPai为空or长度为0时。
                // sprite.node.getComponent(cc.Button).interactable = true;
                this.setDefectNumShow(sprite);
                sprite.node.getChildByName("caishen").active = false;

                //如果为最后一张牌，且已经报听了。
                if (i === this.paiNumb && cc.vv.baoTingData && cc.vv.baoTingData.baoTingStatus) {
                    sprite.node.getComponent(cc.Button).interactable = true;
                    cc.vv.LogUtil.printLog("MjGame.js", "checkYouXianPai", "报听了，最后一张牌设置可点击.", JSON.stringify(data), 1);
                }
            }

        }

    },

    //如果玩家手上还有缺的牌没有打，则只能打缺牌
    checkQueYiMen: function () {
        console.log("checkQueYiMen");
        if (cc.vv.gameNetMgr.conf == null || !cc.vv.gameNetMgr.getSelfData().hued) {
            //遍历检查看是否有未打缺的牌 如果有，则需要将不是定缺的牌设置为不可用
            var dingque = 3;
            console.log("checkQueYiMen" + dingque);
            var hasQue = false;
            if (cc.vv.gameNetMgr.seatIndex == cc.vv.gameNetMgr.turn) {
                for (var i = 0; i < this._myMJArr.length; ++i) {
                    var sprite = this._myMJArr[i];
                    //                console.log("sprite.node.mjId:" + sprite.node.mjId);
                    if (sprite.node.mjId != null) {
                        var type = cc.vv.mahjongmgr.getMahjongType(sprite.node.mjId);
                        // console.log("sprite.node.isQue"=sprite.node.isQue);
                        if (type == dingque) {
                            hasQue = true;
                            break;
                        }
                    }
                }
            }

            //        console.log("hasQue:" + hasQue);
            for (var i = 0; i < this._myMJArr.length; ++i) {
                var sprite = this._myMJArr[i];
                if (sprite.node.mjId != null) {
                    var type = cc.vv.mahjongmgr.getMahjongType(sprite.node.mjId);
                    if (hasQue && type != dingque) {
                        // sprite.node.getComponent(cc.Button).interactable = false;
                    } else {
                        // sprite.node.getComponent(cc.Button).interactable = true;
                        this.setDefectNumShow(sprite);
                    }
                }
            }
        } else {
            if (cc.vv.gameNetMgr.seatIndex == cc.vv.gameNetMgr.turn) {
                for (var i = 0; i < 14; ++i) {
                    var sprite = this._myMJArr[i];
                    if (sprite.node.active == true) {
                        sprite.node.getComponent(cc.Button).interactable = i == 13;
                    }
                }
            } else {
                for (var i = 0; i < 14; ++i) {
                    var sprite = this._myMJArr[i];
                    if (sprite.node.active == true) {
                        // sprite.node.getComponent(cc.Button).interactable = true;
                        this.setDefectNumShow(sprite);
                    }
                }
            }
        }
    },

    onOptionClicked: function (event) {
        console.log(event.target.pai);
        console.log("event.target.name" + event.target.name);
        console.log("onOptionClicked");
        if (event.target.name == "op") {
            console.log(event.target.btnType);
            if (event.target.btnType == "btnPeng") {
                cc.vv.net.send("peng");
                cc.vv.LogUtil.printLog("game_action", "onOptionClicked", "用户点击了碰按钮", null /*JSON.stringify(data)*/ , 1);
            } else if (event.target.btnType == "btnGang") {
                cc.vv.net.send("gang", event.target.getChildByName("btnGang").pai);
                cc.vv.LogUtil.printLog("game_action", "onOptionClicked", "用户点击了杠按钮", null /*JSON.stringify(data)*/ , 1);
            } else if (event.target.btnType == "btnHu") {
                cc.vv.net.send("hu");
                cc.vv.LogUtil.printLog("game_action", "onOptionClicked", "用户点击了胡按钮", null /*JSON.stringify(data)*/ , 1);
            } else if (event.target.btnType == "btnChi") {
                console.log("onOptionClicked is chi");
                //隐藏ops
                if (this._options.active) {
                    this.hideOptions();
                }

                this.hideChiOptions();
                this._chiOptions.active = true;

                var len = this._chiPaiInfs.length / 3;
                //不能超过3
                len = len > 3 ? 3 : len;
                var paiArr = this._chiPaiInfs;

                for (var i = 0; i < len; i++) {

                    var j = i + 1;
                    var name = "op_" + j;
                    var child = this._chiOptions.getChildByName(name);
                    this._chiOptions.getChildByName("New Layout").active = true;

                    //显示出来
                    child.active = true;
                    var pai = child.getChildByName("pai_1").getComponent(cc.Sprite);
                    this.setSpriteFrameByMJID("M_", pai, paiArr[i * 3 + 0]);
                    var pai = child.getChildByName("pai_2").getComponent(cc.Sprite);
                    this.setSpriteFrameByMJID("M_", pai, paiArr[i * 3 + 1]);
                    var pai = child.getChildByName("pai_3").getComponent(cc.Sprite);
                    this.setSpriteFrameByMJID("M_", pai, paiArr[i * 3 + 2]);

                    child.paiArr = [paiArr[i * 3 + 0], paiArr[i * 3 + 1], paiArr[i * 3 + 2]];
                    console.log("choose chipai Arr=" + child.paiArr);
                }
            } else if (event.target.btnType == "btnTing") {
                console.log("听牌选择");
                cc.vv.net.send("baoting", true);
                cc.vv.LogUtil.printLog("game_action", "onOptionClicked", "用户点击了报听按钮", null /*JSON.stringify(data)*/ , 1);
            }
            //关闭提示框
            this._options.confirmGou.init(false);
        } else if (event.target.name == "btnGuo") {
            cc.vv.LogUtil.printLog("game_action", "onOptionClicked", "用户点击了过按钮,可能是听牌的过，也可能是一般的过。", null /*JSON.stringify(data)*/ , 1);
            if (cc.vv.baoTingData && cc.vv.baoTingData.baoTingStatus == false && this.isShowTing == true) {
                console.log("听牌过->" + this._selectedMJ.mjId); //'baoting'   isBaoTing [true|false]
                cc.vv.net.send("baoting", false);
                cc.vv.LogUtil.printLog("game_action", "onOptionClicked", "用户点击了过按钮,是听牌的过", null /*JSON.stringify(data)*/ , 1);
                //移除本次的选择能报听的牌,控制限定单个牌的报听次数
                // if (cc.vv.baoTingData && cc.vv.baoTingData.tingPaiStatus) {
                //     var tingPaiStatus = cc.vv.baoTingData.tingPaiStatus;
                //     console.log(tingPaiStatus);
                //     tingPaiStatus[this._selectedMJ.mjId] = false;
                // }
                return;
            }
            //查看是否提示
            if (this._options.confirmGou.isShowTip()) {
                this._options.confirmGou.tip();
                return;
            }
            console.log("qi pai");
            cc.vv.net.send("guo");
            cc.vv.LogUtil.printLog("game_action", "onOptionClicked", "用户点击了过按钮,是一般的过", null /*JSON.stringify(data)*/ , 1);
        }
    },

    onChiOptionClicked: function (event) {
        console.log("onChiOptionClicked paiArr is " + event.target.paiArr);
        cc.vv.net.send("chipai", event.target.paiArr);
        return;
    },

    onRefreshClick: function (event) {
        console.log('onRefreshClick');
        cc.vv.gameNetMgr.dispatchEvent('disconnect');
        // cc.vv.gameNetMgr.reConnectGameServer();
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {


        if (this._touchedMJ != null && this._touched_y >= 0) {
            // console.log("this._touched_y=" + this._touched_y);
            this._touchedMJ.y = this._touched_y;
        }
        //每帧刷新。
        // cc.vv.gameNetMgr.prepareLogic.refresh(dt);
        // this.checkTimeout(dt);
    },

    addTestNet: function () {
        // var self=this;
        // this.node.on('testNet',function() {
        //     console.log("testNet is ok");
        //     cc.vv.autoDisConnect=false;
        // });

        // this.node.on('resumeTestNet',function() {
        //     console.log('resumeTextNet');
        //     cc.director.getScheduler().resumeTarget(self);
        // });
    },

    checkTimeout: function (interval) {
        // var self=this;
        // var fn=function(data) {
        //     console.log('send testNet ');
        //     cc.vv.net.send('testNet');
        //     if(cc.vv.autoDisConnect) {
        //         self.node.emit('disconnect');
        //         cc.director.getScheduler().pauseTarget(self);
        //         return
        //     }
        //     cc.vv.autoDisConnect=true;
        // } 
        // cc.director.getScheduler().schedule(fn, this, 4,100000000,3,false);
        // // this._timeout+=dt;
        // // if(this._timeout>5) {
        // //     this._timeout=0;
        // //     console.log('is count time!');
        // //     cc.vv.net.send('testNet');
        // // }
        // // if(this._timeout>0) {
        // //     this._timeout+=dt;            
        // // }        
    },

    onDestroy: function () {
        console.log("onDestroy");
        // cc.vv.audioMgr.playBGM("bgMain.mp3");
        if (cc.vv) {
            cc.vv.gameNetMgr.clear();
        }
    }
});