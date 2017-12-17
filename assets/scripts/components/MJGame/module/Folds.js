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
        _folds:null,//各家出牌元素
        chupai_node:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        this.initView();
        this.initEventHandler();
        this.initAllFolds();
    },
    
    initView:function(){
        this._folds = {};
        var game = this.node.getChildByName("game");
        //确定几个麻将
        var sides = cc.vv.setPeople.getSeats();

        for(var i = 0; i < sides.length; ++i){
            var sideName = sides[i];
            var sideRoot = game.getChildByName(sideName);
            var folds = [];
            var foldRoot = sideRoot.getChildByName("folds");
            if(cc.vv.setPeople.isERMJ()){//显示2人时的出牌列表
                foldRoot.active=false;
                foldRoot = sideRoot.getChildByName("folds_er");
                foldRoot.active=true;                
            }
            for(var j = 0; j < foldRoot.children.length; ++j){
                var n = foldRoot.children[j];
                n.active = false;
                var sprite = n.getComponent(cc.Sprite); 
                sprite.spriteFrame = null;
                folds.push(sprite);            
            }
            this._folds[sideName] = folds; 
        }
        this.hideAllFolds();
    },
    
    hideAllFolds:function(){
        // console.log("hideAllFolds ");

        for(var k in this._folds){
            var f = this._folds[k];
            var len="len=";
            for(var i in f){
                f[i].node.active = false;
                len+=" "+i;
            }
        }
    },
    
    initEventHandler:function(){
        var self = this;

        this.node.on('game_begin',function(data){
            console.log("game_begin of folds");
            self.initAllFolds();
        });  
        
        this.node.on('game_sync',function(data){
            console.log("game_begin of folds");
            self.initAllFolds(cc.vv.gameNetMgr.showPai);
        });

        this.node.on('refresh_sync_infs',function(data){
            console.log("refresh_sync_infs");
            //idle状态
            var func1=function() {
                self.hideAllFolds();
            }
            //playing状态
            var func2=function () {
                self.initAllFolds(cc.vv.gameNetMgr.showPai);
            }
            cc.vv.gameStatusHandle.runStatusAction(null,func1,func2,null);
        });
        
        //刷新出牌列表
        this.node.on('guo_notify',function(data){
            console.log("guo_notify",data.detail);
            self.initFolds(data.detail,true);
        });

        //出现chi gang peng push 时,把吃，碰，杠应该隐藏的牌给隐藏掉。
        this.node.on('refresh_folds',function(data){
            // cc.log(data.detail,"guo_notify");
            self.initFolds(data.detail);
        });

        // this.node.on('delete_pai_push',function(data){
        //     cc.log(data.detail.seatData,"delete_pai_push");
        //     self.initFolds(data.detail.seatData);
        // });

        this.node.on("game_over",function(data){
            console.log("game_over of Fold.js");
            self.hideAllFolds();
        });
    },
    
    initAllFolds:function(chupaiInfo){
        // console.log("chupaiInfo=",chupaiInfo);
        var seatIndex=-1;
        (chupaiInfo!=undefined && chupaiInfo!=null) && (seatIndex=chupaiInfo.seatIndex);
        var seats = cc.vv.gameNetMgr.seats;
        for(var i in seats){
            var chupaiSide=parseInt(seatIndex);
            this.initFolds(seats[i],parseInt(i)===seatIndex);
        }
    },
    
    initFolds:function(seatData,isSide){
        var folds = seatData.folds;
        if(folds == null){
            return;
        }
        console.log("initFolds isSide=",isSide);

        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
        //用于二人and 三人麻将
        localIndex=cc.vv.setPeople.getReadIdx(localIndex);

        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        
        var foldsSprites = this._folds[side];
        for(var i = 0; i < foldsSprites.length; ++i){
            var index = i;
            if(side == "right" || side == "up"){
                index = foldsSprites.length - i - 1;
            }
            if(side == "left")
            {
                if(i<12)
                {
                    index = i + 12;
                }
                else
                {
                    index = i - 12;
                }
            }
            var sprite = foldsSprites[index];
            sprite.node.active = true;
            var isLast=isSide&&(i==(folds.length-1));
            if(isLast) {
                console.log("isLast="+isLast,"pai="+folds[i]);
                this.setNode(sprite.node,side);
            }
            this.setSpriteFrameByMJID(pre,sprite,folds[i],isLast);
        }
        for(var i = folds.length; i < foldsSprites.length; ++i){
            var index = i;
            if(side == "right" || side == "up"){
                index = foldsSprites.length - i - 1;
            }
            if(side == "left")
            {
                if(i<12)
                {
                    index = i + 12;
                }
                else
                {
                    index = i - 12;
                }
            }
            var sprite = foldsSprites[index];
            
            sprite.spriteFrame = null;
            sprite.node.active = false;
        }  
    },
    
    setSpriteFrameByMJID:function(pre,sprite,mjid,isLast){
        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre,mjid);
        sprite.node.active = true;        
    },

    //对出牌node做标识
    setNode:function(node,side) {
        console.log("set chupai node ");
        if(this.chupai_node!=null) {
            this.chupai_node.removeChild(this.chupai_node.addChildNode,true);        
        }
        var childNode=cc.instantiate(cc.vv.mahjongmgr.outcard_tip);
        childNode.getComponent('Outcard_tips').init(side);  
        node.addChild(childNode);
        this.chupai_node=node;
        this.chupai_node.addChildNode=childNode;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
