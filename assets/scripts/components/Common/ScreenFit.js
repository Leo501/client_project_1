cc.Class({
    extends: cc.Component,

    properties: {
        node: cc.Node,
        width: false,
        height: false,
        only: false,
        isovergame: false,
        mask_bg: cc.Node,
    },

    // use this for initialization
    onLoad: function() {
        var node = this.node;
        var realwidth = cc.director.getVisibleSize().width;
        var realheight = cc.director.getVisibleSize().height;
        console.log("realwidth" + realwidth + " realheight" + realheight);
        var scaleWidth = realwidth / 1280;
        var scaleHeight = realheight / 720;
        if (this.only) {
            if (this.width) {
                node.scaleX *= scaleWidth;
            } else if (this.height) {
                node.scaleY *= scaleHeight;
            }
        } else {
            if (this.width) {
                node.scaleX *= scaleWidth;
                node.scaleY *= scaleWidth;
            } else if (this.height) {
                node.scaleX *= scaleHeight;
                node.scaleY *= scaleHeight;
            } else if (this.width && this.height) {
                node.scaleX *= scaleWidth;
                node.scaleY *= scaleHeight;
            }
        }
        if (this.isovergame) {
            node.scaleX *= 0.9;
            node.scaleY *= 0.9;
        }

        if (this.mask_bg) {
            var size = realwidth > realheight ? realwidth : realheight;
            console.log("this.mask_bg" + size);
            this.mask_bg.height = size * 2;
            this.mask_bg.width = size * 2;
        }

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});