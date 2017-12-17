module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        info: cc.Label,
        fileProgress: cc.ProgressBar,
        fileProgressNode:cc.Node,
        byteProgress: cc.ProgressBar,
        close: cc.Node,
        checkBtn: cc.Node,
        retryBtn: cc.Node,
        updateBtn: cc.Node,
        board : cc.Node,
        updatePackage:cc.Node,
        enter:cc.Node
    },
    
    onLoad () {
        var self=this;
        this.close.on(cc.Node.EventType.TOUCH_END, function () {
            this.node.parent.active = false;
            console.log("hello ");
            self.node.emit("init_login_push",true);
        }, this);

    },
    
    initTip:function() {
        this.board.active=false;
        this.retryBtn.active = false;
        this.updatePackage.active=false;
        this.enter.active=false;
        this.fileProgressNode.active=false;
    },
    
    showTip:function() {
        this.board.active=true;
        this.retryBtn.active = true;
        this.updatePackage.active=true;
        this.enter.active=true;
        console.log("this.enter.active="+this.enter.active);
    }
});
