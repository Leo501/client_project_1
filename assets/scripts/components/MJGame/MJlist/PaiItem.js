

cc.Class({
    extends: cc.Component,

    properties: {
        pai:cc.Sprite,
        bottomAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
    },

    // use this for initialization
    init: function (mjid,mjidArr) {
        this.mahjongSprites=mjidArr;
        this.setSpriteFrameByMJID("M_",this.pai,mjid);
    },

    /**设置麻将的显示 */
    setSpriteFrameByMJID: function(pre, sprite, mjid) {
        sprite.spriteFrame = this.getSpriteFrameByMJID(pre, mjid);
        sprite.node.mjid=mjid;
    },

    /**点击事件 */
    btnClick:function(event) {
        //通过event.target可以拿到目标节点 
        var mjid=event.target.mjid;
        console.log("mjid="+mjid);
        cc.vv.net.send('hope_mo_pai', mjid);
    },

    getSpriteFrameByMJID:function(pre,mjid) {
        var spriteFrameName = this.getMahjongSpriteByID(mjid);
        spriteFrameName = pre + spriteFrameName;
        return this.bottomAtlas.getSpriteFrame(spriteFrameName);
    },

    getMahjongSpriteByID: function(id) {
        return this.mahjongSprites[id];
    },

    getWidth:function() {
        return this.pai.node.width ;
    },


    getHeight:function() {
        return this.pai.node.height ;
    }

});
