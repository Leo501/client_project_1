cc.Class({
    extends: cc.Component,

    properties: {
        _gameresult:null,
        gameresult:null,
        _seats:[],
        _jushu:[],
        _showScore:[],
        icon:[],
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        this.gameresult = this.node.getChildByName("game_result_wz");
        this.gameresult.active=false;
        this.gameresult.getChildByName("game_result").active=false;
        this.gameresult.getChildByName("game_sreult_er").active=false;

        this._gameresult = this.gameresult.getChildByName("game_result");
        if(cc.vv.setPeople.isERMJ()){
            this._gameresult=this.gameresult.getChildByName("game_sreult_er");
            // cc.log("isERMJ",this._gameresult);
        }
        
        var seats = this._gameresult.getChildByName("seats");
        for(var i = 0; i < seats.children.length; ++i){
            if(!seats.children[i].getComponent("Seat")){
                console.log("seat is null/undefine");
                continue;
            }
            
            this._seats.push(seats.children[i].getComponent("Seat"));
            var siju =  seats.children[i].getChildByName("siju");
            var showScore = seats.children[i].getChildByName("showScore");
            var icon = seats.children[i].getChildByName("icon").getComponent("ImageLoader");
            this.icon.push(icon);
            this._showScore.push(showScore);
            var xinxi = [];
            for(var j = 0; j< siju.children.length;j++)
            {
                var s = "jushu_" + (j+1);
                xinxi.push(siju.getChildByName(s));
            }
            this._jushu.push(xinxi);   
        }
        for(var i = 0; i < seats.children.length; ++i)
        {
            
        }
        var btnClose = cc.find("Canvas/game_result_wz/game_result/btnClose");
        if(cc.vv.setPeople.isERMJ()){//二人麻将
            btnClose = cc.find("Canvas/game_result_wz/game_sreult_er/btnClose");
        }
        if(btnClose){
            cc.vv.utils.addClickEvent(btnClose,this.node,"GameResult","onBtnCloseClicked",3);
        }
        
        var btnShare = cc.find("Canvas/game_result_wz/btnShare");
        if(btnShare){
            cc.vv.utils.addClickEvent(btnShare,this.node,"GameResult","onBtnShareClicked");
        }
        var pengyouquan = cc.find("Canvas/game_result_wz/pengyouquan");
        if(pengyouquan)
        {
            cc.vv.utils.addClickEvent(pengyouquan,this.node,"GameResult","onBtnShareClicked");
        }
        
        //初始化网络事件监听器
        var self = this;
        this.node.on('game_end',function(data){
            console.log("game_end of GameResult");
            // console.log(data);
            self._gameresult.active=true;
            self.onGameEnd();
        });
        this.node.on('round_score',function(data){
            self.showjushu(data);
        })
    },
    
    onGameEnd:function(){
        console.log("onGameEnd");
        var seats = cc.vv.gameNetMgr.seats;
        var maxscore = -1;
        for(var i = 0; i < seats.length; ++i){
            var seat = seats[i];
            if(seat.score > maxscore){
                maxscore = seat.score;
            }
        }
        
        for(var i = 0; i < seats.length; ++i){
            var seat = seats[i];
            var isBigwin = false;
            if(seat.score > 0){
                console.log("seat.score="+seat.score);
                isBigwin = seat.score == maxscore;
            }
            var winScore = this._showScore[i].getChildByName("zongjiwin").getComponent(cc.Label);
            var loseScore = this._showScore[i].getChildByName("zongjilose").getComponent(cc.Label);
            if(winScore)
            {
                winScore.node.active=seat.score>-1?true:false;
                winScore.string=seat.score>0?"+"+seat.score:"0";
            }
            if(loseScore)
            {
                loseScore.node.active=seat.score<0?true:false;
                loseScore.string=seat.score;
            }
            // seat.score=10;
            this._seats[i].setInfo(seat.name,seat.score, isBigwin,true);
            this._seats[i].setID(seat.userid);
        }
        
    },
    showjushu:function(data)
    {
        var scores = data.detail;
        cc.log("scores",scores);
        for(var i = 0;i<this._jushu.length;i++)
        {
            if(!scores[i]){
                return ;
            }
            var icon = this.icon[i];
            icon.setUserID(scores[i].userId);
            var fenshu = scores[i].roundScore;
            var xinxi = this._jushu[i]
            for(var j=0;j< xinxi.length;++j)
            {
                if(j<cc.vv.gameNetMgr.maxNumOfGames){
                    if(fenshu[j] != null)
                    {
                        xinxi[j].getChildByName("score").getComponent(cc.Label).string = fenshu[j];
                    }
                    else
                    {
                        xinxi[j].getChildByName("score").getComponent(cc.Label).string = "0"; 
                    } 
                }else{
                    xinxi[j].active  = false;
                }
                // if(cc.vv.gameNetMgr.maxNumOfGames ==4)
                // {
                //     if(j<4)
                //     {
                //         if(fenshu[j] != null)
                //         {
                //             xinxi[j].getChildByName("score").getComponent(cc.Label).string = fenshu[j];
                //         }
                //         else
                //         {
                //            xinxi[j].getChildByName("score").getComponent(cc.Label).string = "0"; 
                //         }   
                //     }
                //     else
                //     {
                //         xinxi[j].active  = false;
                //     }
                // }
                // else
                // {
                //     if(fenshu[j] != null)
                //         {
                //             xinxi[j].getChildByName("score").getComponent(cc.Label).string = fenshu[j];
                //         }
                //         else
                //         {
                //            xinxi[j].getChildByName("score").getComponent(cc.Label).string = "0"; 
                //         }
                // }

            }
        }
    },
    
    onBtnCloseClicked:function(){
        cc.director.loadScene("hall");
    },
    
    onBtnShareClicked:function(event){
        var type = false;
        if(event.target.name =="btnShare")
        {
            type = true;
            cc.vv.anysdkMgr.shareResult(type,false); 
        }
        if(event.target.name =="pengyouquan")
        {
            type = false;
            cc.vv.anysdkMgr.shareResult(type,false);
        }
    }
});
