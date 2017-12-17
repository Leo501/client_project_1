
cc.Class({
    "extends": cc.Component,

    properties: {
        _gameover: null,
        _gameresult: null,
        game_over:null,
        _seats: [], //设置viewData页面数据。
        _isGameEnd: false,
        _pingju: null,
        _win: null,
        _lose: null,
        _maidi:0,
        _fangpao:false,
    },

    // use this for initialization
    onLoad: function onLoad() {
        if (cc.vv == null) {
            console.log("cc.vv == null");
            return;
        }
	
        if (cc.vv.gameNetMgr.conf == null) {
            console.log("cc.vv.gameNetMgr.conf == null");
            return;
        }
		//
        this.game_over = this.node.getChildByName("game_over");
        this.game_over.active=false;
        this._gameresult = this.node.getChildByName("game_result_wz");
        //初始化
        this.game_over.getChildByName("game_over_wz").active=false;
        this.game_over.getChildByName("game_over_er").active=false;

        this._gameover = this.game_over.getChildByName("game_over_wz");

        if(cc.vv.setPeople.isERMJ()){
            this._gameover = this.game_over.getChildByName("game_over_er");
        }
        this._gameover.active = false;
        var gameresult = this.node.getChildByName("game_result");
        this._gameresult = this.node.getChildByName("game_result_wz");
        this._gameover.active = false;
        this._gameresult = this.node.getChildByName("game_result_wz");
        this._result = this._gameover.getChildByName("result");
        this._pingju = this._result.getChildByName("pingju");
        this._win = this._result.getChildByName("win");
        this._lose = this._result.getChildByName("lose");
        this._zhuangTable = this._gameover.getChildByName("zhuangTable");
        this._infs = this._zhuangTable.getChildByName("infs");
        // this._hupaizhe = this._infs.getChildByName("hupaizhe").getComponent(cc.Label);
        this._zhuang = this._infs.getChildByName("zhuang").getComponent(cc.Label);
        this._laozhuang = this._infs.getChildByName("laozhuang").getComponent(cc.Label);
        this._paixing = this._infs.getChildByName("paixing").getComponent(cc.Label);
        this._difen = this._infs.getChildByName("difen").getComponent(cc.Label);
        this._dishu = this._infs.getChildByName("dishu").getComponent(cc.Label);
        this._beishu = this._infs.getChildByName("beishu").getComponent(cc.Label);
        
        var lengthMan=4;
        if(cc.vv.setPeople.isERMJ()){
            lengthMan=2;
        }
        for (var i = 1; i <= lengthMan; ++i) {
            var s = "wanjia_" + i;
            var sn = this._infs.getChildByName(s);
            var viewdata = {};
            
            viewdata.username = sn.getChildByName('username').getComponent(cc.Label);
            viewdata.maidi = sn.getChildByName('maidi');
            viewdata.dingdi = sn.getChildByName('dingdi'); //顶底
            viewdata.fanshu = sn.getChildByName('fanshu').getComponent(cc.Label);
            viewdata.caishenqian = sn.getChildByName('caishenqian').getComponent(cc.Label); //财神钱
            viewdata.zongjiwin = sn.getChildByName('zongjiwin');
            viewdata.zongjilose = sn.getChildByName('zongjilose');
            viewdata.userid = sn.getChildByName('userid').getComponent(cc.Label);
            viewdata.hu = sn.getChildByName('hu');
            viewdata.fangpao = sn.getChildByName('fangpao');
            viewdata.zhuang = sn.getChildByName('zhuang');
            viewdata._userImg = sn.getChildByName("userimg").getComponent("ImageLoader");
            this._seats.push(viewdata);
        }
        var self = this;
        this.node.on('game_over', function (data) {
            console.log("game_over of GameOver.js");
            self.gameOverStati(data.detail);
        });

        this.node.on('game_end', function (data) {
            console.log("game_end of GameOver.js");
            self._isGameEnd = true;
        });

        this.node.on('refresh_sync_infs',function(data) {
            console.log('refresh_sync_infs of gameOver_zw.js');
            var state=cc.vv.gameNetMgr.gamestate;
            console.log('state='+state);
            if(state=='playing'||state=='idle') {
                self.game_over.active=false;
            }
        });
        var btnReady = cc.find("Canvas/game_over/btnReady");
        console.log("btnReady is " + btnReady);
        
        if(btnReady){
            cc.vv.utils.addClickEvent(btnReady,this.node,"GameOver_zw","onBtnReadyClicked",1);
        }
        var fenxiang = cc.find("Canvas/game_over/fenxiang");
        if(fenxiang)
        {
            cc.vv.utils.addClickEvent(fenxiang,this.node,"GameOver_zw","onshare");
        }
    },
    onshare:function onshare()
    {
        console.log("分享战绩");
        var type = true;
        cc.vv.anysdkMgr.shareResult(type,false);
    },
    gameOverStati: function gameOverStati(data) {
        console.log(data);
        if (data.length == 0) {
            this._gameresult.active = true;
            return;
        }

        var maiOrDingChooseArr = cc.vv.gameNetMgr.maiOrDingDiArr;
        this.game_over.active = true;
        this._gameover.active = true;
        this._pingju.active = false;
        this._win.active = false;
        this._lose.active = false;
        this._difen.string = cc.vv.gameNetMgr.difen;
        //显示本家输赢
        // var myscore = data[cc.vv.gameNetMgr.seatIndex].score;
        // if (myscore > 0) {
        //     this._win.active = true;
        // } else if (myscore < 0) {
        //     this._lose.active = true;
        // } else {
        //     this._pingju.active = true;
        // }
        if (cc.vv.gameNetMgr.getSeatIndexByID(data[cc.vv.gameNetMgr.seatIndex].huorder) == cc.vv.gameNetMgr.seatIndex) {
            this._win.active = true;
        } else if (data[cc.vv.gameNetMgr.seatIndex].huorder == 0) {
            this._pingju.active = true;
            // this._hupaizhe.string = "";
            this._paixing.string = "";
            this._laozhuang.string = data[cc.vv.gameNetMgr.seatIndex].laozhuang;
            this._beishu.string = data[cc.vv.gameNetMgr.seatIndex].beishu;
            this._dishu.string = data[cc.vv.gameNetMgr.seatIndex].dishu;
        } else {
            this._lose.active = true;
        }
        // if(maiOrDingChooseArr)
        // {
        //     if(maiOrDingChooseArr[cc.vv.gameNetMgr.button] == 2){
        //         this._maidi = 2;
        //     }
        // }
         for (var i = 0; i < this._seats.length; ++i) {
            var seatView = this._seats[i];
            var userData = data[i];
            //显示庄家 和玩家名称
            if(cc.vv.gameNetMgr.button == i)
            {
                this._zhuang.string =  cc.vv.gameNetMgr.setName(cc.vv.gameNetMgr.seats[i].name,8,true);
            }
            seatView._userImg.setUserID(userData.userId);
            var mai_type = -1;
            if (maiOrDingChooseArr) {
                mai_type = maiOrDingChooseArr[i];
            }
            seatView.maidi.active = mai_type == 2;
            seatView.dingdi.active = mai_type == 4; 
            seatView.userid.string = "ID:" + userData.userId;
            seatView.hu.active = cc.vv.gameNetMgr.getSeatIndexByID(userData.huorder) == i;
            seatView.zhuang.active = cc.vv.gameNetMgr.button == i;
            seatView.username.string = cc.vv.gameNetMgr.setName(cc.vv.gameNetMgr.seats[i].name,8,true);
            seatView._userImg.setUserID(userData.userId);
            //显示财神钱
            var qian = userData.caishenMoney;
            seatView.caishenqian.string = qian > 0 ? "+" + qian : qian;
            //显示番数
            var fan = userData.fan;
            seatView.fanshu.string = fan;
            //显示总计
            if (userData.score > 0) {
                 seatView.zongjiwin.active = true;
                 seatView.zongjiwin.getComponent(cc.Label).string = "+" + userData.score;
                 seatView.zongjilose.active = false;
            }else {
                 seatView.zongjilose.active = true;
                 seatView.zongjilose.getComponent(cc.Label).string = userData.score;
                 seatView.zongjiwin.active = false;
            }
            if(i == 0)
            {
                //显示牌型
                // this._hupaizhe.string = cc.vv.gameNetMgr.seats[i].name;
                this._laozhuang.string = userData.laozhuang;
                this._beishu.string = userData.beishu;
                this._dishu.string = userData.dishu;
                var str = "";
                if(userData.pattern == "soft8pairs")
                {
                    str = "软8对";
                }else if(userData.pattern == "hard8pairs")
                {
                    str = "硬8对双翻";
                }else if(userData.pattern == "threecaishenabnormal"||userData.pattern == "threecaishennormal")
                {
                    str = "三财双翻";
                }else if(userData.pattern == "dandiao")
                {
                    str = "单吊双翻";
                }else if(userData.pattern == "pengpenghu")
                {
                    str = "碰碰胡";
                }else if(userData.pattern == "quanqiongshen")
                {
                    str = "全球神";
                }else if(userData.pattern == "tianhu")
                {
                    str = "天胡";
                }else if(userData.pattern == "dihu")
                {
                    str = "地胡";
                }
                else if(userData.pattern =="softnormal")
                {
                    str = "软牌";
                }else if(userData.pattern =="hardnormal")
                {
                    str = "硬牌";
                }
                this._paixing.string = str;
                
            }
            var isfangpao = false; 
            for(var j = 0; j < userData.actions.length; ++j)
            {
                var ac = userData.actions[j];
                if(ac.type == "fangpao")
                {
                    isfangpao = true;
                }
            }
            seatView.fangpao.active = isfangpao;
         }
    },
     onBtnReadyClicked: function onBtnReadyClicked() {
        console.log("onBtnReadyClicked");
        if (this._isGameEnd) {
            this._gameresult.active = true;
        } else {
            cc.vv.net.send('ready');
            cc.vv.gameNetMgr.dispatchEvent('game_over_ready');
        }
        this._gameover.active = false;
        this.game_over.active = false;
    },

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },