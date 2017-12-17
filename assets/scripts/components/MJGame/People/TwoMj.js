cc.Class({
    extends: cc.Component,

    properties: {
        // rootIcon:cc.Node,
        // isHide_icon:false,

        rootNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        if (cc.vv.setPeople.isERMJ() && this.rootNode) {
            this.rootNode.active = false;
            // this.node.active=false;
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.rootNode.active && cc.vv.setPeople.isERMJ() && this.rootNode) {
            this.rootNode.active = false;
        }
    },
});
