/**
 * 用于显示版本号脚本
 */
cc.Class({
    extends: cc.Component,

    properties: {
        tip: {
            default: null,
            type: cc.Label
        },
        isUpdate: false,

    },

    // use this for initialization
    onLoad: function () {
        console.log("init GameVersion");
        this.checkData();
    },

    checkData: function () {
        if (!cc.vv) {
            return;
        }
        if (!cc.vv && !cc.vv.initVersion) {
            return;
        }
        if (cc.vv.initVersion._localVersion !== "" && this.tip.string == cc.vv.initVersion._localVersion) {
            return;
        }
        this.tip != null && (this.tip.string = cc.vv.initVersion._localVersion);
        if (this.tip.string === '') {
            // console.log('init version label=');
            this.tip.string = G.VERSION;
        }
    },

    update: function (dt) {
        if (this.isUpdate) {
            this.checkData();
        }
    },

});