cc.Class({
    extends: cc.Component,

    properties: {
        title: cc.Label,
        content: cc.Label,
        btn_ok: cc.Node,
        btn_download: cc.Node,
        _onOk: null,
        _onDownload: null,
    },

    // use this for initialization
    onLoad: function () {

    },

    // init: function () {
    //     // cc.vv.utils.addClickEvent(this.btn_ok, this.node, "Alert", "onClickOk", 1);
    //     // cc.vv.utils.addClickEvent(this.btn_download, this.node, "Alert", "onClickDownload", 3);
    // },

    show: function (title, content, onOk, onDownload) {
        this.title.string = title;
        this.content.string = content;
        this._onOk = onOk;
        this._onDownload = onDownload;
        if (onDownload) {
            this.btn_download.active = true;
            this.btn_ok.x = -150;
            this.btn_download.x = 150;
        } else {
            this.btn_download.active = false;
            this.btn_ok.x = 0;
        }
        this.node.active = true;
    },

    onClickOk: function (event) {
        // console.log("onBtnClicked Alert.js");
        if (this._onOk) {
            this._onOk();
        }
        this.node.active = false;
        this._onOk = null;
        this._onDownload = null;

    },

    onClickDownload: function (event) {
        if (this._onDownload) {
            this._onDownload();
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});