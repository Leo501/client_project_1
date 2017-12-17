cc.Class({
    extends: cc.Component,

    properties: {
        total: cc.Label,
        give: cc.Label,
        pay: cc.Label,
        _cardData: null,
        bgAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
        _bgSrpite: null,
        _idx: null,
        _spriteSet: null,
        _type: null,

    },

    // use this for initialization
    init: function (data, idx, type) {
        this._type = type;
        this._cardData = data;
        this._cardData.idx = idx;
        let uint = '';
        let _spriteSet = null;
        if (this._type === G.payType.card) {
            _spriteSet = {
                0: 'Btn_100_up',
                1: 'Btn_300_up',
                2: 'Btn_1000_up',
                3: 'Btn_3000_up',
            }
            uint = '钻';
        } else if (this._type === G.payType.coin) {
            _spriteSet = {
                0: 'Btn_Jiudou100_up',
                1: 'Btn_Jiudou300_up',
                2: 'Btn_Jiudou1000_up',
                3: 'Btn_Jiudou3000_up',
            }
            uint = '豆';
        }
        this._spriteSet = _spriteSet;
        this._bgSrpite = this.node.getComponent(cc.Sprite);

        this.setString(this.total, this._cardData.gem + uint);
        let name = '';
        if (this._cardData.money) {
            name += this._cardData.money;
        }
        if (this._cardData.unit) {
            name += this._cardData.unit;
        }
        this.setString(this.pay, name);
        this.setSpriteFrame(this._bgSrpite, idx);
        let str = '';
        if (this._cardData.give > 0) {
            str = '赠送' + this._cardData.give + uint;
        }
        this.setString(this.give, str);
    },

    setSpriteFrame: function (sprite, idx) {
        // console.log('bgAtlas=', this.bgAtlas);
        idx = idx > 3 ? 3 : idx;
        const name = this._spriteSet[idx];
        sprite.spriteFrame = this.bgAtlas.getSpriteFrame(name);
    },

    setString: function (label, string) {
        label.string = string;
    },

    onClickPay: function (event) {
        console.log("event=", event.target, 'idx=' + this._cardData.money);
        let money = this._cardData.money;
        cc.vv.anysdkMgr.startPlay({
            money: money,
            gem: this._cardData.gem,
            give: this._cardData.give,
            type: this._type,
        });
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});