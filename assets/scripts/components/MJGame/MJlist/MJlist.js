
var Config={
    open:1,
    close:0,
};

var mahjongSprites = [];
function createMJNameArr() {
    console.log("createMJNameArr");
    //筒
    for (var i = 1; i < 10; ++i) {
        mahjongSprites.push("dot_" + i);
    }

    //条
    for (var i = 1; i < 10; ++i) {
        mahjongSprites.push("bamboo_" + i);
    }

    //万
    for (var i = 1; i < 10; ++i) {
        mahjongSprites.push("character_" + i);
    }
}
cc.Class({
    extends: cc.Component,

    properties: {
        paiItem:cc.Prefab,
        row:0,//行
        column:0,//列
        itemWidth:0,
        itemHeight:0,
        length:0,
        bg:cc.Node,
        root:cc.Node,
        bt:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        var self=this;
        this.centerX=Math.floor((this.row)/2);
        this.centerY=Math.floor((this.column)/2);
        createMJNameArr();
        this.init();
        cc.vv.net.addHandler('get_pei_pai_config_push',function(data) {
            self.config_callback(data);
        });
        cc.vv.net.send('get_pei_pai_config');
    },
    
    init:function() {
        this.node.active=true;
        this.bg.active=false;
        this.root.active=false;
        this.bt.active=false;
        this.createList(this.length);  
    },

    config_callback:function(data) {
        console.log("get_pei_pai_config_push=",data);
        if(Config.open==data) {
            this.bt.active=true;
        }
    },

    /**
     * 0~8 筒
     * 9~17 条
     * 18~26 万
     */
    createList:function(length) {
        for(var i=0;i<length;i++) {
            var item=this.createItem(i);
            this.root.addChild(item);
        }
    },

    /**
     * 创建一个实例并设置位置
     */
    createItem:function(mjid) {
        var item=cc.instantiate(this.paiItem);
        var paiItem=item.getComponent('PaiItem');
        paiItem.init(mjid,mahjongSprites);
        // this.itemWidth=paiItem.getWidth()+this.interval;
        // this.itemHeight=paiItem.getHeight()+this.interval;
        var posi=this.calculatePosition(mjid,this.itemWidth,this.itemHeight);
        item.setPosition(posi);
        return item;
    },

    /**
     * 计算出放置位置
     * row(行)以 row/2为中心
     * column(列)以 column/2为中心
     */
    calculatePosition:function(mjid,width,heigth) {
        console.log("aa");
        var r=mjid%this.row;
        var c=Math.floor(mjid/this.row);

        var x=(r-this.centerX)*width;
        var y=(this.centerY-c)*heigth;
        return cc.v2(x,y);
    },

    createMJNameArr:function() {
        console.log("createMJNameArr");
        //筒
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("dot_" + i);
        }

        //条
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("bamboo_" + i);
        }

        //万
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("character_" + i);
        }
    },
    
    btnCallback:function() {
        this.bg.active=!this.bg.active;
        this.root.active=!this.root.active;
    },

    getMahjongSpriteByID: function(id) {
        return mahjongSprites[id];
    },

});
