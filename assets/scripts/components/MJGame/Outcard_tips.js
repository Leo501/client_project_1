cc.Class({
    extends: cc.Component,

    properties: {
        height:0,
        duration:0,
    },

    // use this for initialization
    init: function (side) {
        console.log("side=",side);
        if(side=='myself'||side=='up') {
            this.node.scaleX=2;
            this.node.scaleY=2;
            this.height*=2;
            // this.duration*=1.2;
            this.node.setPosition(0,15);
            console.log("heigth=",this.height);
        }
        var moveUp=cc.moveBy(this.duration/2, cc.p(0,this.height) );
        var moveDown=cc.moveBy(this.duration/2,cc.p(0,-(this.height)));
        this.node.runAction(cc.sequence(moveUp,moveDown).repeatForever());
    },
    
    stopActions:function() {
        this.node.stopAllActions();
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
