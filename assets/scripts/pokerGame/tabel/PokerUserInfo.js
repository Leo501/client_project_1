const Actor = require('Actor');
const actor = new Actor();
cc.Class({
    extends: cc.Component,

    properties: {
        _ip: {
            default: null,
            type: cc.Label
        },

        _sexFemale: {
            default: null,
            type: cc.Node
        },

        _sexMale: {
            default: null,
            type: cc.Node
        },

        _backLayout: {
            default: null,
            type: cc.Node
        },

        //要刷新的数据
        _data: null,

        _actor: null,

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        console.log('onload userInfoBase',this.node);
        this.node.addComponent('Actor');
        
        this._actor = this.node.getComponent('Actor');
        this._actor.init();
        this._sexFemale = this.node.getChildByName('sex_female');
        this._sexMale = this.node.getChildByName('sex_male');
        this._backLayout = this.node.getChildByName('bg');
        cc.vv.utils.addClickEvent(this._backLayout, this.node, 'PokerUserInfo', 'onBtnBack');
        this._ip = this.node.getChildByName('id').getComponent(cc.Label);
    },

    start() {
        if (this._data) {
            this.setUserDetailInfo(this._data);
        }
    },

    setUserDetailInfo(data) {
        console.log('setUserBaseInfo');
        if (data) {
            this._actor.setUserInfo(data.userid, data.name, data.score);
            this.setSex(data.sex);
            if (this._ip) {
                try {
                    this._ip.string = data.ip.replace("::ffff:", "");
                } catch (error) {
                    console.log('set ip error ', data.ip);
                }
            }

        }
    },

    setSex(sex) {
        console.log('setSex');
        if (this._sexFemale && this._sexMale) {
            this._sexFemale.active = false;
            this._sexMale.active = false;
            if (sex == 1) {
                this._sexMale.active = true;
                this._sexFemale.active = false;
            } else if (sex == 2) {
                this._sexFemale.active = true;
                this._sexMale.active = false;
            }
        } else {
            console.log('set sex this._sexFemale or this._sexmale is null');
        }
    },

    //设置数据
    setData(data) {
        console.log('setUserInfoBase=', data);
        this._data = data;
    },

    onBtnBack(event) {
        console.log('event=', event);
        this.node.removeFromParent();
    },

    update(dt) {
        // this._super();
    },
});