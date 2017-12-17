cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _huanpaitip:null,
        _huanpaiArr:[]
    },

    // use this for initialization
    onLoad: function () {
        this._huanpaitip = cc.find("Canvas/huansanzhang");
        this._huanpaitip.active = cc.vv.gameNetMgr.isHuanSanZhang;
        if(this._huanpaitip.active){
            this.showHuanpai();
        }
        
        var btnOk = cc.find("Canvas/huansanzhang/btn_ok");
        if(btnOk){
            cc.vv.utils.addClickEvent(btnOk,this.node,"HuanSanZhang","onHuanSanZhang");
        }
        
        var self = this;
        
        this.node.on('game_huanpai',function(data){
           self._huanpaitip.active = true;
           self.showHuanpai();
        });
        
        this.node.on('game_huanpai_result',function(data){
            cc.vv.gameNetMgr.isHuanSanZhang = false;
            self._huanpaitip.active = false;
            for(var i = 0; i < self._huanpaiArr.length; ++i){
                self._huanpaiArr[i].y = 0;
            }
            self._huanpaiArr = [];
        });
        
        this.node.on('mj_clicked',function(data){
            var target = data.detail;
            //如果已经点起来，则取消
            var idx = self._huanpaiArr.indexOf(target); 
            if(idx != -1){
                target.y = 0;
                self._huanpaiArr.splice(idx,1);
            }
            else{
                //如果是新的，则加入
                if(self._huanpaiArr.length < 3){
                    self._huanpaiArr.push(target);
                    target.y = 15;
                }
            } 
        });
    },
    
    showHuanpai:function(){
        this._huanpaitip.getChildByName("info").getComponent(cc.Label).string = "请选择三张一样花色的牌";
        this._huanpaitip.getChildByName("btn_ok").getComponent(cc.Button).interactable = true;
        this._huanpaitip.getChildByName("mask").active = false;        
    },
    
    onHuanSanZhang:function(event){
        if(this._huanpaiArr.length != 3){
            return;
        }
        
        var type = null;
        for(var i = 0; i < this._huanpaiArr.length; ++i){
            var pai = this._huanpaiArr[i].mjId;
            var nt = cc.vv.mahjongmgr.getMahjongType(pai); 
            if(type == null){
                type = nt;
            }
            else{
                if(type != nt){
                    return;
                }
            }
        }
        
        var data = {
            p1:this._huanpaiArr[0].mjId,
            p2:this._huanpaiArr[1].mjId,
            p3:this._huanpaiArr[2].mjId,
        }
        
        this._huanpaitip.getChildByName("info").getComponent(cc.Label).string = "等待其他玩家选牌...";
        this._huanpaitip.getChildByName("btn_ok").getComponent(cc.Button).interactable = false;
        this._huanpaitip.getChildByName("mask").active = true;
        
        cc.vv.net.send("huanpai",data);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});