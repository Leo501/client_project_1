cc.Class({
    extends: cc.Component,

    properties: {
        dingques: [],
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
    },

    // use this for initialization
    onLoad: function() {
        this.init();
    },
    /**初始化 */
    init: function() {
        var gameChild = this.node.getChildByName("game");

        var arr = ["myself", "right", "up", "left"];
        for (var i = 0, len = arr.length; i < len; ++i) {
            var side = gameChild.getChildByName(arr[i]);
            var seat = side.getChildByName("seat");
            var dingque = seat.getChildByName("defect_icon");
            var sprite = dingque.getComponent(cc.Sprite);
            this.dingques.push(sprite);
            sprite.spriteFrame = cc.vv.mahjongmgr.getDefectSpriteFrameById(i + 1);
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});