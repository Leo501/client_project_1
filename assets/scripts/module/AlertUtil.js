cc.Class({
    extends: cc.Component,

    properties: {
        _title: cc.Label,
        _content: cc.Label,
        _btnOK: cc.Node,
        _btnCancel: cc.Node,
        //是一个函数
        _onOkCallback: null,
    },

    onLoad() {
        // this._title = this.node.getChild('titile').getComponent(cc.Label);
        // this._content = this.node.getChild('content').getComponent(cc.Label);
        // this._btnOK = this.node.getChild('btn_ok')
        // this._btnCancel = this.node.getChild('btn_cancel');

        // cc.vv.utils.addClickEvent(this._btnOK, this.node, "AlertUtil", "onBtnClicked", 1);
        // cc.vv.utils.addClickEvent(this._btnCancel, this.node, "AlertUtil", "onBtnClicked", 3);
    },

    start() {

    },

    //设置数据，后
    init(title, content, onok, needcancel) {
        this._title = this.node.getChildByName('title').getComponent(cc.Label);
        this._content = this.node.getChildByName('content').getComponent(cc.Label);
        this._btnOK = this.node.getChildByName('btn_ok')
        this._btnCancel = this.node.getChildByName('btn_cancel');

        cc.vv.utils.addClickEvent(this._btnOK, this.node, "AlertUtil", "onBtnClicked", 1);
        cc.vv.utils.addClickEvent(this._btnCancel, this.node, "AlertUtil", "onBtnClicked", 3);
    },

    onBtnClicked(event) {
        // console.log("onBtnClicked Alert.js");
        if (event.target.name == "btn_ok") {
            if (this._onok) {
                this._onok();
            }
        }
        this._onok = null;
        this.node.removeFromParent();
    },

    show(title, content, onok, needcancel) {
        this.init();
        this._onok = onok;
        this._title.string = title;
        this._content.string = content;
        if (needcancel) {
            this._btnCancel.active = true;
            this._btnOK.x = -150;
            this._btnCancel.x = 150;
        } else {
            this._btnCancel.active = false;
            this._btnOK.x = 0;
        }
    },

    // update (dt) {},
});