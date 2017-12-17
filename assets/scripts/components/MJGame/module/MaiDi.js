cc.Class({
    extends: cc.Component,

    properties: {
        mai_or_ding:null,//显示选择框
        tips:[],
        selected:[],
        // mai_or_dings:[],//头像框
        maiOrDingIcon:[],
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv ==null){
            return;
        }
        this.initView();
        this.initEventHandlers();
    },
    initView:function(){

        var str=("initView of MaiDi");
        var gameChild = this.node.getChildByName("game");
        //选择框
        this.mai_or_ding = gameChild.getChildByName("dingdi");
        this.mai_or_ding.active = false;

        var arr = ["myself","right","up","left"];
        for(var i = 0;i<arr.length;++i){

            if(cc.vv.setPeople.hide_single(i)){//Ϊ1.3����
                cc.log("maiDi","i="+i);
                continue;
            }
            var side = gameChild.getChildByName(arr[i]);
            var seat = side.getChildByName("seat");
            // var mai_or_no = seat.getChildByName("maidi");
            // mai_or_no.active = false;
            // this.mai_or_dings.push(mai_or_no);

            var que=seat.getChildByName("que");
            var maiIcon=que.getChildByName("maidi");
            maiIcon.active=false;
            var dingIcon=que.getChildByName("dingdi");
            dingIcon.active=false;
            var icon={mai:maiIcon,ding:dingIcon};
            this.maiOrDingIcon.push(icon);
        }
        str+=" gameNetMgr.gamestate="+cc.vv.gameNetMgr.gamestate;
        this.initMaiOrDing(cc.vv.gameNetMgr.gamestate);

        var button_maidi = cc.find("Canvas/game/dingdi/button_maidi");//买底按钮
        var button_dingdi = cc.find("Canvas/game/dingdi/button_dingdi"); //顶底按钮
        var button_bumai = cc.find("Canvas/game/dingdi/button_bumai");//取消按钮

        if(button_maidi){
            cc.vv.utils.addClickEvent(button_maidi,this.node,"MaiDi","onConfirmOrClicked");
        }
        if(button_dingdi){
            cc.vv.utils.addClickEvent(button_dingdi,this.node,"MaiDi","onConfirmOrClicked");
        }
        if(button_bumai){
            cc.vv.utils.addClickEvent(button_bumai,this.node,"MaiDi","onConfirmOrClicked");
        }

        console.log(str);
    },
    
     //用于初始化接收 handlers
    initEventHandlers:function(){
        var self = this;
        this.node.on('is_mai_or_ding_di',function(data){
            console.log("isGameSync...." + cc.vv.gameNetMgr.isGameSync);
            cc.log("maiOrDingIcon.length="+self.maiOrDingIcon.length);
            if(!cc.vv.gameNetMgr.isGameSync)
            {
                for(var i = 0; i < self.maiOrDingIcon.length; ++i)
                {
                    if(self.maiOrDingIcon[i])
                    {
                        self.maiOrDingIcon[i].mai.active = false;
                        self.maiOrDingIcon[i].ding.active= false;
                    }
                }
            }
            console.log("买底开始..................");
            console.log("mai or di="+data.detail);
            self.showMaiDiChoice(data.detail);
        });
        //关闭面板
        this.node.on('buy_and_double_base',function(data){
            console.log("buy_and_double_base ="+data.detail);
            var data = data.detail;
            self.initMaiDi(data.type,data.seatIndex);
            if(cc.vv.gameNetMgr.seatIndex==data.seatIndex)
            {
                self.mai_or_ding.active=false;
            }
        });

        // this.node.on('refresh_sync_infs',function(data){
        //     console.log('refresh_sync_infs of MaiDi.js');
        //     console.log('cc.vv.gameNetMgr.gamestate='+cc.vv.gameNetMgr.gamestate);
        //     //如果有本家要选择买/顶就是显示选择。
        //     //如果已经有人选择过了，就在头像那显示出来
        //     self.initMaiOrDing(cc.vv.gameNetMgr.gamestate);

        // });
    },

    initMaiOrDing:function(state)
    {
        var arr=cc.vv.gameNetMgr.maiOrDingDiArr;        
        //主要用于sync_push
        if(arr)
        {
            //显示
            if("idle"==state){
                console.log("show MaiDiChoice ");
                var arr=cc.vv.gameNetMgr.maiOrDingDiArr;
                var type=arr[cc.vv.gameNetMgr.seatIndex];
                console.log("type of MaiDi.js="+type);
                this.showMaiDiChoice(type);
            } 

            for(var i=0;i<arr.length;i++)
            {
                this.initMaiDi(arr[i],i);
            }
        }
    },

    showMaiDiChoice:function(type){
        console.log("showMaiDiChoice of type="+type);
        this.mai_or_ding.active=(type==1)?true:(type==3)?true:false;
        console.log("mai_or_ding.active"+this.mai_or_ding.active);

        var isMai=false;var isDing=false;var isBu=false;
        if(1==type)
        {
            isMai=isBu=true;
        }
        if(3==type){
            isDing=isBu=true;
        }

        this.mai_or_ding.getChildByName("button_dingdi").active = isDing;
        this.mai_or_ding.getChildByName("button_bumai").active = isBu;
        this.mai_or_ding.getChildByName("button_maidi").active = isMai;
    },

    initMaiDi:function(type,seatIndex){

        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);

        var name="";
        var isActive=true;//用于是否显示头像图标的买底or顶底的信息。
        var isMai=false;var isDing=false;
        switch(type)
        {
            case 2: name="买底"; isMai=true; break;
            case 4: name="顶底"; isDing=true; break;
            default: isActive=false;break;
        }

        console.log("name="+name+" isActive="+isActive);
        if(this.maiOrDingIcon[localIndex])
        {
            this.maiOrDingIcon[localIndex].mai.active = isMai;
            this.maiOrDingIcon[localIndex].ding.active= isDing;
        }

    },
    onConfirmOrClicked:function(event){
      var type=5;
      if(event.target.name =="button_maidi"){
          console.log("button_maidi");
          type = 1;
      } else if(event.target.name =="button_dingdi"){
          console.log("button_dingdi");
          type = 3;
      } else if(event.target.name =="button_bumai"){
          console.log("button_bumai");      
      }
      
       for(var i = 0; i < this.selected.length; ++i){
            this.selected[i].active = false;
        }
        console.log(type);  
        // cc.vv.gameNetMgr.dingDiOrMaiDi = type;
        cc.vv.net.send("buy_and_double_base",type);//向服务器发送买底数据
    },

});
