const setMoney = {
    'btn_100': '100',
    'btn_300': '300',
    'btn_1000': '1000',
    'btn_3000': '3000'
};
cc.Class({
    extends: cc.Component,
    properties: {
        // close:cc.Node,
        toggleGroup: cc.Node,
        nodeGroup: cc.Node,
        item_template: cc.Node,
        cardContent: cc.Node,
        coinContent: cc.Node,
        tipInfo: cc.Label,
        _item_column: 3,
        _origin_point: null,
        _item_heigth: 216,
        _configData: null,
    },

    // use this for initialization
    init: function () {
        cc.vv.utils.addClickEvent(this.node.getChildByName('close'), this.node, "Store", "onClickClose", 3);
        if (this._configData === null) {
            console.log("require server");
            this.getPayItemData((data) => {
                this._configData = data;
                this.node.active = true;
                this.initToggleGroup();
                this.setPayItem(data.config.card, G.payType.card);
                this.setPayItem(data.config.coin, G.payType.coin);
                this.setTipInfo(this.tipInfo, data.hintMsg);
            });
        } else {
            console.log('quickly enter ');
            const data = this._configData;
            this.node.active = true;
            this.initToggleGroup();
            this.setPayItem(data.config.card, G.payType.card);
            this.setPayItem(data.config.coin, G.payType.coin);
            this.setTipInfo(this.tipInfo, data.hintMsg);
        }
    },

    getDataByType: function (data) {
        const config = data.config;
        data.config = {
            coin: [],
            card: [],
        };
        config.forEach((item, idx) => {
            if (item.type === G.payType.coin) {
                data.config.coin.push(item);
            } else if (item.type === G.payType.card) {
                data.config.card.push(item);
            }
        });
        // console.log(data.config.coin, data.config.card);
    },

    //设置ToggleGroup的编号
    initToggleGroup: function () {
        this.setFirstItem(0);
        const children = this.toggleGroup.children;
        Array.isArray(children) && children.forEach((item, idx) => {
            let btn = cc.find('Background', item);
            btn.idx = idx;
            item.getComponent(cc.Toggle).isChecked = false;
        });
        children[0].getComponent(cc.Toggle).isChecked = true;
    },

    setTipInfo: function (node, str) {
        node.string = str + '!!';
    },

    //选中哪个。
    setFirstItem: function (idx) {
        let child = this.toggleGroup.children[idx];
        if (child !== null) {
            child.getComponent(cc.Toggle).isChecked = true;
        } else {
            console.log('setFirstitem', 'child==null');
        }
        this.setNodeContent(idx);
    },

    //点亮对应的内容node
    setNodeContent: function (idx) {
        const name = 'node' + (idx + 1);
        const children = this.nodeGroup.children;
        if (Array.isArray(children) && idx >= children.length) {
            console.log('setNodeContent/Store.js', '输入idx有误');
            return;
        }
        //全部隐藏
        Array.isArray(children) && children.forEach((item, idx) => {
            item.active = false;
        });
        //显示某个
        let child = this.nodeGroup.getChildByName(name);
        if (child !== null) {
            // console.log('child=', child);
            child.active = true;
        }
    },

    setPayItem: function (data, type) {
        console.log('init setPayItem');
        let node = null;
        let template = null;
        if (type === G.payType.card) {
            node = this.cardContent;
            template = node.children[0];
        } else if (type == G.payType.coin) {
            node = this.coinContent;
            template = node.children[0];
        }
        node.removeAllChildren();
        let len = 0;
        Array.isArray(data) && (len = data.length);
        const itemData = data;
        console.log('itemData=', itemData);
        for (let i = 0; i < len; i++) {
            const child = cc.instantiate(template);
            child.name = 'Btn_' + i;
            node.addChild(child);
            const item = child.getComponent('CardItem');
            item.init(itemData[i], i, type);
        }
    },

    //计算位置
    calculatePosition: function (No, origin_point, width, heigth) {
        var c = No % this._item_column; //在第几列，
        var r = Math.floor(No / this._item_column); //在第几行。
        var x = origin_point.x + c * width;
        var y = origin_point.y - r * heigth;
        return cc.v2(x, y);
    },
    //_default=430, _item_heigth=216
    calculateLength: function (node, numb, interval, _default, _heigth) {
        const height = (numb < 6) ? _default : (Math.ceil(numb / this._item_column) * _heigth + interval);
        node.height = height;
    },

    //显示对应item的node
    onClickToggleGroupItem: function (event) {
        const target = event.target;
        const idx = target.idx;
        // console.log('target=', target, 'idx=', idx);
        this.setNodeContent(idx);
    },

    onClickClose: function (event) {
        this.node.active = false;
    },

    onClickOpen: function (event) {
        this.init();
        cc.vv.audioMgr.playClick_buttomSFX(1);
    },

    getPayItemData: function (fn) {
        let timeoutId = null;
        cc.vv.http.sendRequest("/get_pay_config", {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
        }, (ret) => {
            clearTimeout(timeoutId);
            if (ret.errcode === 0) {
                // console.log("get_pay_config", ret);
                this.getDataByType(ret.errmsg);
                fn(ret.errmsg);
            } else {
                console.log("errcode=", ret.errcode);
                cc.vv.alert.show('提示', ret.errmsg);
            }
        });
        timeoutId = setTimeout(() => {
            cc.vv.alert.show('提示', '联网超时');
        }, 4000);
    },

    //充值钻石
    onClickDiamondPlay: function (event) {
        let name = event.target.name;
        let money = setMoney[name];
        console.log('money=', money);
    }
});