cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _gameover:null,
        _gameresult:null,
        _seats:[],//设置viewData页面数据。
        _isGameEnd:false,
        _pingju:null,
        _win:null,
        _lose:null,
        _paiNum:17,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            console.log("cc.vv == null");
            return;
        }
        if(cc.vv.gameNetMgr.conf == null){
            console.log("cc.vv.gameNetMgr.conf == null");
            return;
        }
        if(cc.vv.gameNetMgr.conf.type == "xzdd"){
            this._gameover = this.node.getChildByName("game_over");
            console.log("cc.vv.gameNetMgr.conf.type == xzdd");
        }
        else{
            console.log("cc.vv.gameNetMgr.conf.type == xlch");
            this._gameover = this.node.getChildByName("game_over_xlch");
        }
        
        this._gameover.active = false;
        
        this._pingju = this._gameover.getChildByName("pingju");
        this._win = this._gameover.getChildByName("win");
        this._lose = this._gameover.getChildByName("lose");
        
        this._gameresult = this.node.getChildByName("game_result");
        
        var wanfa = this._gameover.getChildByName("wanfa").getComponent(cc.Label);
        wanfa.string = cc.vv.gameNetMgr.getWanfa();
        
        var listRoot = this._gameover.getChildByName("result_list");

        for(var i = 1; i <= 4; ++i){
            var s = "s" + i;
            var sn = listRoot.getChildByName(s);
            var viewdata = {};
            viewdata.username = sn.getChildByName('username').getComponent(cc.Label);
            viewdata.reason = sn.getChildByName('reason').getComponent(cc.Label);
            viewdata.ding_or_mai = sn.getChildByName('ding_or_mai').getComponent(cc.Label); //顶底（买底）
            viewdata.caishenqian = sn.getChildByName('caishenqian').getComponent(cc.Label); //财神钱

            var f = sn.getChildByName('fan');
            if(f != null){
                viewdata.fan = f.getComponent(cc.Label);    
            }
            
            viewdata.score = sn.getChildByName('score').getComponent(cc.Label);
            viewdata.hu = sn.getChildByName('hu');
            viewdata.mahjongs = sn.getChildByName('pai');
            viewdata.zhuang = sn.getChildByName('zhuang');

            viewdata.hupai = sn.getChildByName('hupai');
            viewdata.infos = sn.getChildByName("infos");//新添加的东西。
            viewdata.infos.active=false;

            if(viewdata.hupai)
            {
                console.log("viewdata.hupai"+viewdata.hupai);
            }else{
                console.log("viewdata.hupai null");
            }
            
            //放碰杠吃
            viewdata._pengandgang = [];
            this._seats.push(viewdata);
        }
        
        //初始化网络事件监听器
        var self = this;
        this.node.on('game_over',function(data)
        {
            console.log("game_over of GameOver.js");
            // self.onGameOver(data.detail);
            self.gameOverStati(data.detail);
        });
        
        this.node.on('game_end',function(data)
        {
            console.log("game_end of GameOver.js");
            self._isGameEnd = true;
        });
    },
    
    onGameOver(data){
        if(cc.vv.gameNetMgr.conf.type == "xzdd"){
            this.onGameOver_XZDD(data);
        }
        else{
            this.onGameOver_XLCH(data);
        }


    },
    
    onGameOver_XZDD(data){
        console.log("onGameOver_XZDD");
        console.log(data);
        if(data.length == 0){
            this._gameresult.active = true;
            return;
        }
        this._gameover.active = true;
        this._pingju.active = false;
        this._win.active = false;
        this._lose.active = false;

        var myscore = data[cc.vv.gameNetMgr.seatIndex].score;
        if(myscore > 0){
            this._win.active = true;
        }         
        else if(myscore < 0){
            this._lose.active = true;
        }
        else{
            this._pingju.active = true;
        }
           
        //显示玩家信息
        for(var i = 0; i < 4; ++i){
            var seatView = this._seats[i];
            var userData = data[i];
            var chis = [1,2,3,3,4,5,6,7,8];
            var hued = false;
            
            //胡牌的玩家才显示 是否清一色 根xn的字样
            var numOfGangs = userData.angangs.length + userData.wangangs.length + userData.diangangs.length;
            var numOfGen = userData.numofgen;
            // var numOfChi= userData.chi;//要添加吃的操作。
            var actionArr = [];
            var is7pairs = false;
            var ischadajiao = false;
            for(var j = 0; j < userData.actions.length; ++j){
                console.log("userData.actions.length of onGameOver_XZDD"+userData.actions.length);
                var ac = userData.actions[j];
                if(ac.type == "zimo" || ac.type == "ganghua" || ac.type == "dianganghua" || ac.type == "hu" || ac.type == "gangpaohu" || ac.type == "qiangganghu" || ac.type == "chadajiao"){
                    if(userData.pattern == "7pairs"){
                        actionArr.push("七对");
                    }
                    else if(userData.pattern == "l7pairs"){
                        actionArr.push("龙七对");
                    }
                    else if(userData.pattern == "j7pairs"){
                        actionArr.push("将七对");
                    }
                    else if(userData.pattern == "duidui"){
                        actionArr.push("碰碰胡");
                    }
                    else if(userData.pattern == "jiangdui"){
                        actionArr.push("将对");
                    }
                    
                    if(ac.type == "zimo"){
                        actionArr.push("自摸");
                    }
                    else if(ac.type == "ganghua"){
                        actionArr.push("杠上花");
                    }
                    else if(ac.type == "dianganghua"){
                        actionArr.push("点杠花");
                    }
                    else if(ac.type == "gangpaohu"){
                        actionArr.push("杠炮胡");
                    }
                    else if(ac.type == "qiangganghu"){
                        actionArr.push("抢杠胡");
                    }
                    else if(ac.type == "chadajiao"){
                        ischadajiao = true;
                    }
                    hued = true;
                }
                else if(ac.type == "fangpao"){
                    actionArr.push("放炮");
                }
                else if(ac.type == "angang"){
                    actionArr.push("暗杠");
                }
                else if(ac.type == "diangang"){
                    actionArr.push("明杠");
                }
                else if(ac.type == "wangang"){
                    actionArr.push("弯杠");
                }
                else if(ac.type == "fanggang"){
                   actionArr.push("放杠");
                }
                else if(ac.type == "zhuanshougang"){
                    actionArr.push("转手杠");
                }
                else if(ac.type == "beiqianggang"){
                    actionArr.push("被抢杠");
                }
                else if(ac.type == "beichadajiao"){
                    actionArr.push("被查叫");
                }
            }
            
            if(hued){
                if(userData.qingyise){
                    actionArr.push("清一色");
                }
                
                if(userData.menqing){
                    actionArr.push("门清");
                }
                
                if(userData.zhongzhang){
                    actionArr.push("中张");
                }
                
                if(userData.jingouhu){
                    actionArr.push("金钩胡");
                }
                                
                if(userData.haidihu){
                    actionArr.push("海底胡");
                }
                
                if(userData.tianhu){
                    actionArr.push("天胡");
                }
                
                if(userData.dihu){
                    actionArr.push("地胡");
                }
            
                if(numOfGen > 0){
                    actionArr.push("根x" + numOfGen); 
                }                
                
                if(ischadajiao){
                    actionArr.push("查大叫");
                }
            }
            
            for(var o = 0; o < 3;++o){
                seatView.hu.children[o].active = false;    
            }
            if(userData.huorder >= 0){
                seatView.hu.children[userData.huorder].active = true;    
            }

            seatView.username.string = cc.vv.gameNetMgr.seats[i].name;
            //button 就是庄
            seatView.zhuang.active = cc.vv.gameNetMgr.button == i;
            seatView.reason.string = actionArr.join("、");
            seatView.ding_or_mai.string = "不买";
            seatView.caishenqian.string = "0";
            //胡牌的玩家才有番
            var fan = 0;
            console.log("hude is" + hued);
            if(hued){
                fan = userData.fan;
                console.log("胡的玩家才有翻.............");
            }
            seatView.fan.string = fan + "番";
            
            //
            if(userData.score > 0){
                seatView.score.string = "+" + userData.score;    
            }
            else{
                seatView.score.string = userData.score;
            }
           
            
            var hupai = -1;
            if(hued){
                hupai = userData.holds.pop();
            }
            
            cc.vv.mahjongmgr.sortMJ(userData.holds,userData.dingque);
            
            //胡牌不参与排序
            if(hued){
                userData.holds.push(hupai);
            }
            
            //隐藏所有牌
            for(var k = 0; k < seatView.mahjongs.childrenCount; ++k){
                var n = seatView.mahjongs.children[k];
                n.active = false;
            }
        //    var lackingNum = (userData.pengs.length + numOfGangs)*3//再加上吃的数据。
            var lackingNum = (userData.pengs.length + numOfGangs)*3; 
            //显示相关的牌
            for(var k = 0; k < userData.holds.length; ++k){
                var pai = userData.holds[k];
                // console.log(pai)
                var n = seatView.mahjongs.children[k + lackingNum];
                n.active = true;
                var sprite = n.getComponent(cc.Sprite);
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",pai);
            }
            
            
            for(var k = 0; k < seatView._pengandgang.length; ++k){
                console.log("seatView._pengandgang.length"+seatView._pengandgang.length);
                seatView._pengandgang[k].active = false;
            }
            
            //初始化杠牌
            var index = 0;
            var gangs = userData.angangs;
            for(var k = 0; k < gangs.length; ++k){
                var mjid = gangs[k];
                this.initPengAndGangs(seatView,index,mjid,"angang");
                index++;    
            }
            
            var gangs = userData.diangangs;
            for(var k = 0; k < gangs.length; ++k){
                var mjid = gangs[k];
                this.initPengAndGangs(seatView,index,mjid,"diangang");
                index++;    
            }
            
            var gangs = userData.wangangs;
            for(var k = 0; k < gangs.length; ++k){
                var mjid = gangs[k];
                this.initPengAndGangs(seatView,index,mjid,"wangang");
                index++;    
            }
            
            //初始化碰牌
            var pengs = userData.pengs;
            if(pengs){
                for(var k = 0; k < pengs.length; ++k){
                    var mjid = pengs[k];
                    this.initPengAndGangs(seatView,index,mjid,"peng");
                    index++;    
                }    
            }

            if(userData.chis)
            {
                var chiArr=userData.chis;
                if(chis)
                {                
                    for(var k = 0; k < chis.length; ++k)
                    {
                        var mjid = [];
                        for(var j = 0; j < 3; ++j)
                        {
                            mjid[j] = chis[j+k*3];
                        }
                        this.initPengAndGangs(seatView,index,mjid,"chi");
                        index++;    
                    }
                }
            }
        }
    },
    onGameOver_XLCH:function(data){
        console.log(data);
        if(data.length == 0){
            this._gameresult.active = true;
            return;
        }
        this._gameover.active = true;
        this._pingju.active = false;
        this._win.active = false;
        this._lose.active = false;

        var myscore = data[cc.vv.gameNetMgr.seatIndex].score;
        if(myscore > 0){
            this._win.active = true;
        }         
        else if(myscore < 0){
            this._lose.active = true;
        }
        else{
            this._pingju.active = true;
        }
            
        //显示玩家信息
        for(var i = 0; i < 4; ++i){
            var seatView = this._seats[i];
            var userData = data[i];
            var hued = false;
            var actionArr = [];
            var is7pairs = false;
            var ischadajiao = false;
            var hupaiRoot = seatView.hupai;
            
            for(var j = 0; j < hupaiRoot.children.length; ++j){
                hupaiRoot.children[j].active = false;
            }
            
            var hi = 0;
            for(var j = 0; j < userData.huinfo.length; ++j){
                var info = userData.huinfo[j];
                hued = hued || info.ishupai;
                if(info.ishupai){
                    if(hi < hupaiRoot.children.length){
                        var hupaiView = hupaiRoot.children[hi]; 
                        hupaiView.active = true;
                        hupaiView.getComponent(cc.Sprite).spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("B_",info.pai);
                        hi++;   
                    }
                }
                
                var str = ""
                var sep = "";
                
                var dataseat = userData;
                if(!info.ishupai){
                    if(info.action == "fangpao"){
                        str = "放炮";
                    }
                    else if(info.action == "gangpao"){
                        str = "杠上炮";
                    }
                    else if(info.action == "beiqianggang"){
                        str = "被抢杠";
                    }
                    else{
                        str = "被查大叫";
                    }
                    
                    dataseat = data[info.target]; 
                    info = dataseat.huinfo[info.index];
                }
                else{
                    if(info.action == "hu"){
                        str = "接炮胡"
                    }
                    else if(info.action == "zimo"){
                        str = "自摸";
                    }
                    else if(info.action == "ganghua"){
                        str = "杠上花";
                    }
                    else if(info.action == "dianganghua"){
                        str = "点杠花";
                    }
                    else if(info.action == "gangpaohu"){
                        str = "杠炮胡";
                    }
                    else if(info.action == "qiangganghu"){
                        str = "抢杠胡";
                    }
                    else if(info.action == "chadajiao"){
                        str = "查大叫";
                    }   
                }
                
                str += "(";
                
                if(info.pattern == "7pairs"){
                    str += "七对";
                    sep = "、"
                }
                else if(info.pattern == "l7pairs"){
                    str += "龙七对";
                    sep = "、"
                }
                else if(info.pattern == "j7pairs"){
                    str += "将七对";
                    sep = "、"
                }
                else if(info.pattern == "duidui"){
                    str += "碰碰胡";
                    sep = "、"
                }
                else if(info.pattern == "jiangdui"){
                    str += "将对";
                    sep = "、"
                }
                    
                if(info.haidihu){
                    str += sep + "海底胡";
                    sep = "、";
                }
                
                if(info.tianhu){
                    str += sep + "天胡";
                    sep = "、";
                }
                
                if(info.dihu){
                    str += sep + "地胡";
                    sep = "、";
                }
                
                if(dataseat.qingyise){
                    str += sep + "清一色";
                    sep = "、";
                }
                
                if(dataseat.menqing){
                    str += sep + "门清";
                    sep = "、";
                }
                
                if(dataseat.jingouhu){
                    str += sep + "金钩胡";
                    sep = "、";
                }
                         
                if(dataseat.zhongzhang){
                    str += sep + "中张";
                    sep = "、";
                }
            
                if(info.numofgen > 0){
                    str += sep + "根x" + info.numofgen;
                    sep = "、"; 
                }
                
                if(sep == ""){
                    str += "平胡";
                }
                
                str += "、" + info.fan + "番";
                
                str += ")";
                actionArr.push(str);
            }
            
            seatView.hu.active = hued;
            
            if(userData.angangs.length){
                actionArr.push("暗杠x" + userData.angangs.length);
            }
            
            if(userData.diangangs.length){
                actionArr.push("明杠x" + userData.diangangs.length);
            }
            
            if(userData.wangangs.length){
                actionArr.push("巴杠x" + userData.wangangs.length);
            }

            seatView.username.string = cc.vv.gameNetMgr.seats[i].name;
            seatView.zhuang.active = cc.vv.gameNetMgr.button == i;
            seatView.reason.string = actionArr.join("、");
            
            //
            if(userData.score > 0){
                seatView.score.string = "+" + userData.score;    
            }
            else{
                seatView.score.string = userData.score;
            }
           
            //隐藏所有牌
            for(var k = 0; k < seatView.mahjongs.childrenCount; ++k){
                var n = seatView.mahjongs.children[k];
                n.active = false;
            }
            
            cc.vv.mahjongmgr.sortMJ(userData.holds,userData.dingque);
            
            var numOfGangs = userData.angangs.length + userData.wangangs.length + userData.diangangs.length;
           
            var lackingNum = (userData.pengs.length + numOfGangs)*3; 

            //显示相关的牌
            for(var k = 0; k < userData.holds.length; ++k){
                var pai = userData.holds[k];
                var n = seatView.mahjongs.children[k + lackingNum];
                n.active = true;
                var sprite = n.getComponent(cc.Sprite);
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",pai);
            }
            
            
            for(var k = 0; k < seatView._pengandgang.length; ++k){
                console.log("seatView._pengandgang.length"+seatView._pengandgang.length);
                seatView._pengandgang[k].active = false;
            }
            
            //初始化杠牌
            var index = 0;
            var gangs = userData.angangs;
            for(var k = 0; k < gangs.length; ++k){
                var mjid = gangs[k];
                this.initPengAndGangs(seatView,index,mjid,"angang");
                index++;    
            }
            
            var gangs = userData.diangangs;
            for(var k = 0; k < gangs.length; ++k){
                var mjid = gangs[k];
                this.initPengAndGangs(seatView,index,mjid,"diangang");
                index++;    
            }
            
            var gangs = userData.wangangs;
            for(var k = 0; k < gangs.length; ++k){
                var mjid = gangs[k];
                this.initPengAndGangs(seatView,index,mjid,"wangang");
                index++;    
            }
            
            //初始化碰牌
            var pengs = userData.pengs
            if(pengs){
                for(var k = 0; k < pengs.length; ++k){
                    var mjid = pengs[k];
                    this.initPengAndGangs(seatView,index,mjid,"peng");
                    index++;    
                }    
            }

            if(chis)
            {                
                for(var k = 0; k < chis.length; ++k){
                    var mjid = [];
                    for(var j = 0; j < 3; ++j)
                    {
                        mjid[j] = chis[j+k*3];
                    }
                    this.initPengAndGangs(seatView,index,mjid,"chi");
                    index++;    
                }
            }
        }
    },

    gameOverStati:function(data)
    {
        console.log(data);
        if(data.length == 0){
            this._gameresult.active = true;
            return;
        }

        var maiOrDingChooseArr=cc.vv.gameNetMgr.maiOrDingDiArr;
        this._gameover.active = true;
        this._pingju.active = false;
        this._win.active = false;
        this._lose.active = false;

        //显示本家输赢
        var myscore = data[cc.vv.gameNetMgr.seatIndex].score;
        if(myscore > 0){
            this._win.active = true;
        }         
        else if(myscore < 0){
            this._lose.active = true;
        }
        else{
            this._pingju.active = true;
        }
            
        //显示玩家信息
        for(var i = 0; i < 4; ++i){
            var seatView = this._seats[i];
            var userData = data[i];
            var hued = false;
            
            //胡牌的玩家才显示 是否清一色 根xn的字样
            var numOfGangs = userData.angangs.length + userData.wangangs.length + userData.diangangs.length;
            var numOfGen = userData.numofgen;
            // var numOfChi= userData.chi;//要添加吃的操作。
            var actionArr = [];
            var is7pairs = false;
            var ischadajiao = false;

            var strInf=" infos.childrenCount"+seatView.infos.childrenCount;
            for(var q=0;q<seatView.infos.childrenCount;q++)
            {
                seatView.infos.children[q].active=false;
            }

            var mai_type=-1;
            if(maiOrDingChooseArr)
            {
                mai_type= maiOrDingChooseArr[i];
            }
            var maiOrDingArr=["买底","顶底","不买"];
            //显示财神
            seatView.ding_or_mai.string = maiOrDingArr[mai_type==2?0:mai_type==4?1:2];
            this.getActionInfos(userData,actionArr,seatView,hued);

            seatView.username.string = cc.vv.gameNetMgr.seats[i].name;
            seatView.zhuang.active = cc.vv.gameNetMgr.button == i;
            seatView.reason.string = actionArr.join("、");

            // seatView.caishenqian.string = "0";
            var qian=userData.caishenMoney;
            seatView.caishenqian.string=(qian>0)?("+"+qian):qian;

            //胡牌的玩家才有番
            // var fan = 0;
            // if(hued){
            var fan = userData.fan;
            // }
            seatView.fan.string = fan + "番";
            
            //
            if(userData.score > 0){
                seatView.score.string = "+" + userData.score;    
            }
            else{
                seatView.score.string = userData.score;
            }
           
            
            var hupai = -1;
            if(hued){
                hupai = userData.holds.pop();
            }
            
            //要放财神。
            cc.vv.mahjongmgr.sortMJ(userData.holds,userData.dingque);
            
            //胡牌不参与排序
            if(hued){
                userData.holds.push(hupai);
            }
            
            //隐藏所有牌
            for(var k = 0; k < seatView.mahjongs.childrenCount; ++k){
                var n = seatView.mahjongs.children[k];
                n.active = false;
            }
            // console.log("seatView.mahjongs.childrenCount"+seatView.mahjongs.childrenCount);
            //    var lackingNum = (userData.pengs.length + numOfGangs)*3//再加上吃的数据。

            // var lackingNum = (userData.pengs.length + numOfGangs)*3; 
            var lackingNum=cc.vv.gameNetMgr.getLen(userData);
            // console.log("lackingNum"+lackingNum);

            //显示相关的牌
            for(var k = 0; k < userData.holds.length; ++k){
                var pai = userData.holds[k];
                // console.log(pai)
                var n = seatView.mahjongs.children[k + lackingNum];
                n.active = true;
                var sprite = n.getComponent(cc.Sprite);
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_",pai);
            }
            
            //如果之前有显示
            for(var k = 0; k < seatView._pengandgang.length; ++k){
                // console.log("seatView._pengandgang.length"+seatView._pengandgang.length);
                seatView._pengandgang[k].active = false;
            }
            
            if(userData.angangs)
            {
                //初始化杠牌
                var index = 0;
                var gangs = userData.angangs;
                for(var k = 0; k < gangs.length; ++k){
                    var mjid = gangs[k];
                    this.initPengAndGangs(seatView,index,mjid,"angang");
                    index++;    
                }
            }
            
            if(userData.diangangs)
            {
                var gangs = userData.diangangs;
                for(var k = 0; k < gangs.length; ++k){
                    var mjid = gangs[k];
                    this.initPengAndGangs(seatView,index,mjid,"diangang");
                    index++;    
                }
            }
            
            if(userData.wangangs)
            {
                var gangs = userData.wangangs;
                for(var k = 0; k < gangs.length; ++k){
                    var mjid = gangs[k];
                    this.initPengAndGangs(seatView,index,mjid,"wangang");
                    index++;    
                }
            }
            
            if(userData.pengs)
            {
                //初始化碰牌
                var pengs = userData.pengs;
                if(pengs){
                    for(var k = 0; k < pengs.length; ++k){
                        var mjid = pengs[k];
                        this.initPengAndGangs(seatView,index,mjid,"peng");
                        index++;    
                    }    
                }
            }
            
            if(userData.chis)
            {
                var chis=userData.chis;
                if(chis)
                {    
                    var len=chis.length/3;            
                    for(var k = 0; k < len; ++k)
                    {
                        var mjidArr = [];
                        for(var j = 0; j < 3; ++j)
                        {
                            mjidArr[j] = chis[j+k*3];
                        }
                        this.initPengAndGangs(seatView,index,mjidArr,"chi");
                        index++;    
                    }
                }
            }

        }
    },

    initPengAndGangs:function(seatView,index,mjid,flag){
        var pgroot = null;
        if(seatView._pengandgang.length <= index){
            pgroot = cc.instantiate(cc.vv.mahjongmgr.pengPrefabSelf);
            seatView._pengandgang.push(pgroot);
            seatView.mahjongs.addChild(pgroot);    
        }
        else{
            pgroot = seatView._pengandgang[index];
            pgroot.active = true;
        }
      
        var sprites = pgroot.getComponentsInChildren(cc.Sprite);

        pgroot.scaleX = 1.2;
        pgroot.scaleY = 1.2;

        if(flag == "chi")
        {
            
            for(var s = 0; s < sprites.length; ++s){
            var sprite = sprites[s];
            if(sprite.node.name == "gang")
            {
                sprite.node.active=false;
                continue;
            }
            else
            {
                console.log("s="+s);
                var id = mjid[s];
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("B_",id);
            }
        }
        
        }
        else{
        for(var s = 0; s < sprites.length; ++s){
            var sprite = sprites[s];
            if(sprite.node.name == "gang"){
                var isGang = flag != "peng";
                sprite.node.active = isGang;
                sprite.node.scaleX = 1.0;
                sprite.node.scaleY = 1.0;
                if(flag == "angang"){
                    sprite.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame("myself");
                    sprite.node.scaleX = 1.4;
                    sprite.node.scaleY = 1.4;                        
                }   
                else{
                    sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("B_",mjid);    
                }
            }
            else{ 
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("B_",mjid);
            }
        }
        
        }
        // pgroot.x = index * 55 * 3 + index * 10;
        pgroot.x = index * 55 * 3 + index * 40;
    },
    
   getActionInfos:function(userData,actionArr,seatView,hued)
   {
       for(var j = 0; j < userData.actions.length; ++j)
       {
                var ac = userData.actions[j];
                if(ac.type == "zimo" || ac.type == "ganghua" || ac.type == "dianganghua" || ac.type == "hu" || ac.type == "gangpaohu" || ac.type == "qiangganghu" || ac.type == "chadajiao"){
                    if(userData.pattern == "7pairs"){
                        actionArr.push("七对");
                    }
                    else if(userData.pattern == "l7pairs"){
                        actionArr.push("龙七对");
                    }
                    else if(userData.pattern == "j7pairs"){
                        actionArr.push("将七对");
                    }
                    else if(userData.pattern == "duidui"){
                        actionArr.push("碰碰胡");
                    }
                    else if(userData.pattern == "jiangdui"){
                        actionArr.push("将对");
                    }
                    
                    if(ac.type == "hu"){
                        actionArr.push("胡");
                        this.chooseInfos("hu",seatView);
                    }else if(ac.type == "zimo"){
                        actionArr.push("自摸");
                        this.chooseInfos("zimo",seatView);
                    }
                    else if(ac.type == "ganghua"){
                        actionArr.push("杠上花");
                    }
                    else if(ac.type == "dianganghua"){
                        actionArr.push("点杠花");
                    }
                    else if(ac.type == "gangpaohu"){
                        actionArr.push("杠炮胡");
                    }
                    else if(ac.type == "qiangganghu"){
                        actionArr.push("抢杠胡");
                    }
                    else if(ac.type == "chadajiao"){
                        ischadajiao = true;
                    }
                    hued = true;
                }
                else if(ac.type == "fangpao"){
                    actionArr.push("放炮");
                    this.chooseInfos("fangpao",seatView);
                }
                else if(ac.type == "angang"){
                    actionArr.push("暗杠");
                }
                else if(ac.type == "diangang"){
                    actionArr.push("明杠");
                }
                else if(ac.type == "wangang"){
                    actionArr.push("弯杠");
                }
                else if(ac.type == "fanggang"){
                   actionArr.push("放杠");
                }
                else if(ac.type == "zhuanshougang"){
                    actionArr.push("转手杠");
                }
                else if(ac.type == "beiqianggang"){
                    actionArr.push("被抢杠");
                }
                else if(ac.type == "beichadajiao"){
                    actionArr.push("被查叫");
                }
       }
   },

   chooseInfos:function(type,seatView)
   {
       var str="chooseInfos of type="+type+" seatView="+seatView;
       if(!seatView.infos)
       {
           console.log("seatView.infos is null");
           return;
       }

       var viewName=["hu_img","zimo_img","fangpao"];
       seatView.infos.active=true;
       var index=-1;
       switch(type)
       {
            case "hu":index=0;break;
            case "zimo":index=1;break;
            case "fangpao":index=2;break;
       }
       str+=" index"+index;
       if(index==-1)
       {
            console.log(str); 
            return; 
       }

       var child=seatView.infos.getChildByName(viewName[index]);
       if(child)
       {
           child.active=true;
        //    child.node.active=true;
           console.log(str+" "+viewName[index]);
       }else
       {
           console.log("child is null");
       }
    //    for(var i=0;i<seatView.infos.childrenCount;i++)
    //    {
    //        var child=seatView.infos.children[i];
    //        console.log("child.target="+child.target);
    //        if(child.name==type)
    //        {
    //            child.active=true;
    //            continue;
    //        }
    //        child.active=false;
    //    }
   },

    onBtnReadyClicked:function(){
        console.log("onBtnReadyClicked");
        if(this._isGameEnd){
            this._gameresult.active = true;
        }
        else{
            cc.vv.net.send('ready');   
        }
        this._gameover.active = false;
    },
    
    onBtnShareClicked:function(){
        console.log("onBtnShareClicked");
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // },
});
