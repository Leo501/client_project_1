cc.Class({
    extends: cc.Component,

    properties: {
        gou_node:cc.Node,
        _isShow:false
    },

    // use this for initialization
    init: function (isShow) {
        // console.log("init isShow=",isShow);
        this._isShow=isShow;
    },

    isShowTip: function() {
        // console.log("isShowTip");
        return this._isShow;
    },

    tip:function() {
        // console.log("do this.isShow=",this._isShow);
        cc.vv.alert.show("提示","确定过胡么？",this.yes,true);
    },

    yes:function() {
        cc.vv.net.send("guo");
        this._isShow=false;
        cc.vv.LogUtil.printLog("ConfirmGou.js", "yes函数", "用户点击了过按钮,且确定过胡", null /*JSON.stringify(data)*/, 1);
    },

    no:function() {
        // console.log("sorry, touch failed");
    }

});
