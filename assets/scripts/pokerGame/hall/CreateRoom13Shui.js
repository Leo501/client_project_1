
//定义一个enum，用于选择显示节点
const nodeTypeEnum = {
    people: 0,//为设置人数节点
    config: 1,//为设置选择配置节点
};
//对应人数的键值对
const selectBtnNameArr = { 'two': 0, 'three': 1, 'four': 2, 'five': 3, 'six': 4 };
//局数对应的钻石数。
const diamondCountArr = { '0': 16, '1': 30, '2': 46 };
cc.Class({
    extends: cc.Component,

    properties: {
        jushuxuanze: cc.ToggleGroup, //局数选择
        _peoplecountType: null, //人数,2,3,4,5,6人场
        selectPayType: cc.Toggle,//设置收费类型，是否为AA制0--房主出 1--AA制收费开房        
        isMaiMaToggle: cc.Toggle,//是否开启买码
        specialPaiType: cc.Toggle,//0--支持特殊牌型 1--无特殊牌型
        maiMa: cc.ToggleGroup,//0--不买码 1--买码0: 3,    黑桃5 1: 8,    黑桃10  2: 12   黑桃A
        daQiangRule: cc.ToggleGroup,//0--计分+1 1--计分*2
        zhuangMode: cc.Toggle,//0--非庄家模式 1--庄家模式
        duoSe: cc.Toggle,//0--无多色 1--多一色或多二色
        duoTwo: cc.Toggle,//多一色
        autoPeiPai: cc.Toggle,//0--不自动配牌 1--5分钟自动配牌 
        headNoType: cc.Toggle,//头道是否支持同花或顺子  0--不支持 1--支持
        diamondNumb: cc.Label,//显示钻石数量
        maiMaToggle: cc.Node,//
        maiMaBack: cc.Node,//

        selectPeopleNode: cc.Node,//用于管理选择人数的节点,主要作用为管理是否显示
        setConfigNode: cc.Node,//用于管理选择配置的节点,主要作用为管理是否显示
    },

    initShowNode: function (type) {
        if (type == nodeTypeEnum.people) {
            /*this.selectPeopleNode && */(this.selectPeopleNode.active = true);
            /*this.setConfigNode && */(this.setConfigNode.active = false);
        } else if (type == nodeTypeEnum.config) {
            /*this.selectPeopleNode && */(this.selectPeopleNode.active = false);
            /*this.setConfigNode && */(this.setConfigNode.active = true);
        }
    },


    /**初始化房间数据 */
    initRoomConf: function () {
        this.initToggleGroup(this.jushuxuanze, 0);
        this.initToggle(this.selectPayType, false);
        this.initToggle(this.specialPaiType, false);
        this.initToggleGroup(this.maiMa, 0);
        this.initToggleGroup(this.daQiangRule, 0);
        this.initToggle(this.zhuangMode, false);
        this.initToggle(this.duoSe, true);
        this.initToggle(this.duoTwo, true);
        this.initToggle(this.autoPeiPai, false);
        this.initToggle(this.headNoType, false);
        this.initToggle(this.isMaiMaToggle, false);
        //如果为5人的话，就是锁定一色
        // if (this._peoplecountType === 3) {
        //     this.setBtnEnableByToggleNode(this.duoSe, false);
        //     this.duoTwo.node.active = false;
        //     this.duoSe.node.active = true;
        // } else if (this._peoplecountType === 4) {
        //     this.duoSe.node.active = false;
        //     this.duoTwo.node.active = true;
        // } else {

        // }
    },

    /**初始化ToggleGroup */
    initToggleGroup: function (group, tData) {
        if (group) {
            group.node.children.forEach((item, idx) => {
                let toggle = item.getComponent(cc.Toggle);
                toggle.isChecked = idx == tData;
            });
        }
    },

    /**初始化Toggle */
    initToggle: function (toggle, tData) {
        if (toggle) {
            toggle.isChecked = tData;
        }
    },

    /**取得选中idx从ToggleGroup中 */
    getIdxToggleGroup: function (group) {
        if (group) {
            let len = group.node.children.length;
            for (let i = 0; i < len; i++) {
                let toggle = group.node.children[i].getComponent(cc.Toggle);
                if (toggle.isChecked) {
                    return i;
                }
            }
        }
        //如果为空，返回0;
        return 0;
    },

    /**取得结果，从toggle中 */
    getReturnFormToggle: function (toggle) {
        if (toggle) {
            return toggle.isChecked;
        }
        return false;
    },

    // use this for initialization
    onLoad: function () {
        console.log('onLoad from CreateRoom13shui.js');
        //设置先进行人数选择。
        this.initShowNode(nodeTypeEnum.people);
        //配置时的退出按钮
        var btn_back = cc.find("setConfigNode/close", this.node);
        cc.vv.utils.addClickEvent(btn_back, this.node, "CreateRoom13Shui", "onBtnBack", 3);
        //选择人数时的退出按钮
        var btn_back_select = cc.find("selectPeopleNode/close", this.node);
        cc.vv.utils.addClickEvent(btn_back_select, this.node, "CreateRoom13Shui", "onBtnBack", 3);
        //确认开房按钮
        var btn_ok = cc.find("setConfigNode/confirm", this.node);
        cc.vv.utils.addClickEvent(btn_ok, this.node, "CreateRoom13Shui", "onBtnOK", 1);
        //绑定按钮
        let btnTwo = cc.find('selectPeopleNode/two', this.node);
        cc.vv.utils.addClickEvent(btnTwo, this.node, "CreateRoom13Shui", "onBtnSelectPeople", 1);
        let btnThree = cc.find('selectPeopleNode/three', this.node);
        cc.vv.utils.addClickEvent(btnThree, this.node, "CreateRoom13Shui", "onBtnSelectPeople", 1);
        let btnFour = cc.find('selectPeopleNode/four', this.node);
        cc.vv.utils.addClickEvent(btnFour, this.node, "CreateRoom13Shui", "onBtnSelectPeople", 1);
        let btnFive = cc.find('selectPeopleNode/five', this.node);
        cc.vv.utils.addClickEvent(btnFive, this.node, "CreateRoom13Shui", "onBtnSelectPeople", 1);
        let btnSix = cc.find('selectPeopleNode/six', this.node);
        cc.vv.utils.addClickEvent(btnSix, this.node, "CreateRoom13Shui", "onBtnSelectPeople", 1);
        // this.setBtnEnable('three', false);
        // this.setBtnEnable('four', false);
        // this.setBtnEnable('five', false);
        // this.setBtnEnable('six', false);
    },

    onBtnBack: function (event) {
        const currentNode = event.target;
        console.log('onBtnBack target.name=', currentNode.name);
        //是选择的退出
        if (this.selectPeopleNode && this.selectPeopleNode.active) {
            this.node.active = false;
        } else {//是配置时的退出
            this.node.active = true;
            this.initShowNode(nodeTypeEnum.people);
        }
    },

    onBtnOK: function () {
        this.createRoom();
    },

    //确定选择几个场
    onBtnSelectPeople: function (event) {
        let currentNode = event.target;
        let name = currentNode.name;
        //取得人数的配置
        this._peoplecountType = selectBtnNameArr[name];
        this.initShowNode(nodeTypeEnum.config);
        //初始化配置信息
        this.initRoomConf();
        this.setDiaMondNumb();
    },

    createRoom: function () {
        //缓存数据

        let conf = {};
        //局数选择
        conf.paiNum = this.getIdxToggleGroup(this.jushuxuanze);
        //人数选择
        conf.type = this._peoplecountType;
        //收费选择
        conf.roomType = this.getReturnFormToggle(this.selectPayType) == true ? 1 : 0;
        //0--支持特殊牌型 1--无特殊牌型
        conf.specialPaiType = this.getReturnFormToggle(this.specialPaiType) == true ? 0 : 1;
        // conf.maiMa = this.getIdxToggleGroup(this.maiMa);
        //0--不买码 1--买码
        conf.maiMa = this.getReturnFormToggle(this.isMaiMaToggle) == true ? 1 : 0;
        //马牌选中的牌索引
        conf.selectPai = this.getIdxToggleGroup(this.maiMa);
        //0--计分+1 1--计分*2
        conf.daQiangRule = this.getIdxToggleGroup(this.daQiangRule);
        //0--非庄家模式 1--庄家模式
        conf.zhuangMode = this.getReturnFormToggle(this.zhuangMode) == true ? 1 : 0;
        //0--无多色 1--多一色或多二色
        conf.duoSe = this.getReturnFormToggle(this.duoSe) == true ? 1 : 0;
        //0--不自动配牌 1--5分钟自动配牌 
        conf.autoPeiPai = this.getReturnFormToggle(this.autoPeiPai) == true ? 1 : 0;
        //0--头道是否支持同花或顺子  0--不支持 1--支持
        conf.headNoType = this.getReturnFormToggle(this.headNoType) == true ? 1 : 0;
        console.log('conf=', conf);
        this.sendMsg(conf);

    },

    /**发送消息 */
    sendMsg: function (conf) {
        var self = this;
        let timeoutId = null;
        var onCreate = function (ret) {
            clearTimeout(timeoutId);
            if (ret.errcode !== 0) {
                cc.vv.wc.hide();
                //console.log(ret.errmsg);
                switch (ret.errcode) {
                    case 2222:
                        cc.vv.alert.show("提示", "钻石不足，创建房间失败!");
                        break;
                    case 101:
                    case 102:
                        cc.vv.alert.show("提示", "由于网络或其它原因，游戏服务器连接已断开，请重试!");
                        break;
                    case -1:
                    case 103:
                        cc.vv.alert.show("提示", "网络繁忙，请重试!");
                        break;
                    default:
                        cc.vv.alert.show("提示", "创建房间失败,错误码:" + ret.errcode);
                        break;
                }
            } else {
                cc.vv.userMgr.roomData_reconnect = ret;
                cc.vv.userMgr.roomData = ret;
                ret.gameType = cc.vv.gameType.Type.card;
                cc.vv.gameNetMgr.connectGameServer(ret);
            }
        };
        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            conf: JSON.stringify(conf),
        };
        console.log('create room info=', data);
        cc.vv.wc.show("正在创建房间");
        cc.vv.http.sendRequest("/create_private_room", data, onCreate);
        timeoutId = setTimeout(() => {
            cc.vv.wc.hide();
            cc.vv.alert.show("提示", "获取信息失败，请检查网络后 \n 再进行操作！");
        }, 7000);
    },

    setBtnEnable: function (btnName, enabel) {
        let btnNode = this.selectPeopleNode.getChildByName(btnName);
        let btn = btnNode.getComponent(cc.Button);
        btn.enableAutoGrayEffect = true;
        btn.interactable = enabel;
    },

    setBtnEnableByToggleNode: function (node, enabel) {
        let btn = node.getComponent(cc.Toggle);
        btn.interactable = enabel;
    },

    //
    onBtnisMaiMa: function (event) {
        let isOpen = this.getReturnFormToggle(this.isMaiMaToggle);
        if (isOpen) {
            this.maiMaToggle.active = true;
            this.maiMaBack.active = false;
            this.initToggleGroup(this.maiMa, 0);
        } else {
            this.maiMaToggle.active = false;
            this.maiMaBack.active = true;
        }
    },

    setDiaMondNumb: function () {
        console.log('setDiaMondNumb');
        //设置钻石个数。
        // if (this.selectPayType) {
        let idx = this.getIdxToggleGroup(this.jushuxuanze);
        let isAA = this.getReturnFormToggle(this.selectPayType);
        let config = cc.vv.userMgr.creatRoomComfig[this._peoplecountType];
        // console.log('uncomment');
        let numb = isAA == true ? config[idx].costDiamond / 2 : config[idx].costDiamond;
        this.diamondNumb.string = parseInt(numb);
        // } else {
        //     let idx = this.getIdxToggleGroup(this.jushuxuanze);
        //     // let isAA = this.getReturnFormToggle(this.selectPayType);
        //     let config = cc.vv.userMgr.creatRoomComfig[this._peoplecountType];
        //     // console.log('uncomment');
        //     let numb = config[idx];
        //     this.diamondNumb.string = parseInt(numb);
        // }
    },

    setDiaMondNumbBtn: function (event, idx) {
        console.log('setDiaMondNumbBtn');
        //设置钻石个数。
        // if (this.selectPayType) {
        // let idx = this.getIdxToggleGroup(this.jushuxuanze);
        let isAA = this.getReturnFormToggle(this.selectPayType);
        let config = cc.vv.userMgr.creatRoomComfig[this._peoplecountType];
        // console.log('uncomment');
        let numb = isAA == true ? config[idx].costDiamond / 2 : config[idx].costDiamond;
        this.diamondNumb.string = parseInt(numb);
    },


    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        // //设置钻石个数。
        // if (this.selectPayType) {
        //     let idx = this.getIdxToggleGroup(this.jushuxuanze);
        //     let isAA = this.getReturnFormToggle(this.selectPayType);
        //     let config = cc.vv.userMgr.creatRoomComfig[this._peoplecountType];
        //     // console.log('uncomment');
        //     let numb = isAA == true ? config[idx] / 2 : config[idx];
        //     this.diamondNumb.string = parseInt(numb);
        // }
    },
});