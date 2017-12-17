const Actor = require('Actor');
const actor = new Actor();

function UserInfoBase(targetNode) {
    this._sexFemale = null;
    this._sexMale = null;
    this._backLayout = null;
    this._ip = null;
    if (!targetNode) {
        console.log('targetNode is not node');
        return;
    }
    this._targetNode = targetNode;
    actor.init(targetNode);
    this._sexFemale = targetNode.getChildByName('sex_female');
    this._sexMale = targetNode.getChildByName('sex_male');
    // try {
    //     this._backLayout = targetNode.getChildByName('bg');
    //     cc.vv.utils.addClickEvent(this._backLayout, this.node, 'UserInfoBase', 'onBtnBack');
    // } catch (error) {
    //     console.log('this._backLayout have a error', error);
    // }
    try {
        this._ip = targetNode.getChildByName('id').getComponent(cc.Label);
    } catch (error) {
        console.log('error is ', error);
    }
}

UserInfoBase.prototype.setSex = function (sex) {
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
};

UserInfoBase.prototype.setUserDetailInfo = function (data) {
    console.log('setUserBaseInfo');
    if (data) {
        actor.setUserInfo(data.userid, data.name, data.score);
        this.setSex(data.sex);
        if (this._ip) {
            try {
                this._ip.string = data.ip.replace("::ffff:", "");
            } catch (error) {
                console.log('set ip error ', data.ip);
            }
        }

    }
};

module.exports = UserInfoBase;