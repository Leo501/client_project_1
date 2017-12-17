cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _jushuxuanze: null, //局数
        _type: null, //人数
        _jipaixuanzhe: null, //鸡牌选择
        _chongjixuanzhe: null, //冲鸡选择
        diamondNumb: cc.Label,
        //房间配置数据

        roomConf_type: 0,
        roomConf_paiNum: 0,
        roomConf_jiPaiRule: [],
        roomConf_chongfengJi: [],
    },

    /**初始化房间数据 */
    initRoomConf: function () {

    },
    // use this for initialization
    onLoad: function () {

        //
        this.initPaiNumData();
        this.initTypeData();
        this.initJiPaiRuleData();
        this.initChongFengJiData();

        //其他按钮
        var btn_back = cc.find("Canvas/CreateRoom/btn_back");
        cc.vv.utils.addClickEvent(btn_back, this.node, "CreateRoom", "onBtnBack", 3);
        var btn_ok = cc.find("Canvas/CreateRoom/btn_ok");
        cc.vv.utils.addClickEvent(btn_ok, this.node, "CreateRoom", "onBtnOK", 1);

        //下回再创建房间的时候的默认上次的创建房间数据
        console.log("下回再创建房间的时候的默认上次的创建房间数据");
        var selectData = JSON.parse(cc.sys.localStorage.getItem('selectData'));
        console.log('selectData=' + selectData);
        if (selectData == null || typeof (selectData) == 'undefined') {
            this.roomConf_type = 0;
            this.roomConf_paiNum = 0;
            this.roomConf_jiPaiRule = [];
            this.roomConf_chongfengJi = [];
        } else {
            try {
                console.log("有数据");
                console.log(JSON.stringify(selectData));
                this.roomConf_type = selectData.type;
                this.setSelect(this._type, this.roomConf_type);
                this.roomConf_paiNum = selectData.paiNum;
                this.setSelect(this._jushuxuanze, this.roomConf_paiNum);
                this.roomConf_jiPaiRule = selectData.jiPaiRule;
                this.setSelect(this._jipaixuanzhe, -1);
                for (var i = 0; i < this.roomConf_jiPaiRule.length; i++) {
                    this._jipaixuanzhe[this.roomConf_jiPaiRule[i]].isChecked = true;
                }
                this.roomConf_chongfengJi = selectData.chongfengJi;
                this.setSelect(this._chongjixuanzhe, -1);
                for (var i = 0; i < this.roomConf_chongfengJi.length; i++) {
                    this._chongjixuanzhe[this.roomConf_chongfengJi[i]].isChecked = true;
                }
            } catch (e) {
                this.roomConf_type = 0;
                this.roomConf_paiNum = 0;
                this.roomConf_jiPaiRule = [];
                this.roomConf_chongfengJi = [];
            }
        }
        this.onCheckJiPai();
    },


    setSelect: function (arr, sele) {
        for (var i = 0; i < arr.length; i++) {
            arr[i].isChecked = i == sele;
        }
    },

    /**初始化牌局数据 */
    initPaiNumData: function () {
        this._jushuxuanze = []; //局数选择
        var xuanzejushu = this.node.getChildByName("xuanzejushu");
        for (var i = 0, len = xuanzejushu.childrenCount; i < len; ++i) {
            var n = xuanzejushu.children[i].getComponent(cc.Toggle);
            if (n != null) {
                this._jushuxuanze.push(n);
                if (n.isChecked) {
                    this.roomConf_paiNum = i;
                    console.log("this.roomConf_paiNum->" + this.roomConf_paiNum);
                }
            }
        }
    },
    /**初始化人数数据 */
    initTypeData: function () {
        //人数
        this._type = [];
        var people = this.node.getChildByName("people");
        // cc.log("people.childrenCount"+people.childrenCount);
        for (var i = 0, len = people.childrenCount; i < len; ++i) {
            var child = people.children[i].getComponent(cc.Toggle);
            if (child) {
                // cc.log("aaaaaCreateRoom","i="+i);
                // cc.log("isChecked="+child.isChecked);
                this._type.push(child);
                // cc.log("this._type.length="+this._type.length);
                if (child.isChecked) {
                    this.roomConf_type = i - 2; //人数
                    console.log("this.roomConf_type->" + this.roomConf_type);
                }
                // //禁用3人的
                // if (child.node.name == "toggle_3_people") {
                //     child.isChecked = false;
                //     child.interactable = false;
                // }

            }
        }
    },
    /**初始化冲锋鸡数据 */
    initChongFengJiData: function () {
        //冲鸡选择
        this._chongjixuanzhe = [];
        this.roomConf_chongfengJi = [];
        var chongjixuanzhe = this.node.getChildByName("chongjixuanzhe");
        for (var i = 0, len = chongjixuanzhe.childrenCount; i < len; ++i) {
            var child = chongjixuanzhe.children[i].getComponent(cc.Toggle);
            if (child) {
                // cc.log("CreateRoom", "i=" + i);
                // cc.log("isChecked="+child.isChecked);
                this._chongjixuanzhe.push(child);
                cc.log("this._chongjixuanzhe.length=" + this._chongjixuanzhe[i].isChecked);
                if (child.isChecked) {
                    this.roomConf_chongfengJi.push(i);
                }
            }
        }
        console.log("this.roomConf_chongfengJi->" + this.roomConf_chongfengJi);
    },
    /**初始化鸡牌数据 */
    initJiPaiRuleData: function () {
        //鸡牌选择
        this._jipaixuanzhe = [];
        var jipaixuanzhe = this.node.getChildByName("jipaixuanzhe");
        this.roomConf_jiPaiRule = [];
        for (var i = 0, len = jipaixuanzhe.childrenCount; i < len; ++i) {
            var n = jipaixuanzhe.children[i].getComponent(cc.Toggle);
            if (n != null) {
                if (n.node.name == "toggle5") {
                    n.isChecked = true;
                    n.interactable = false;
                }
                this._jipaixuanzhe.push(n);
                if (n.isChecked) {
                    this.roomConf_jiPaiRule.push(i);
                }

            }
        }
        console.log("this.roomConf_jiPaiRule->" + this.roomConf_jiPaiRule);
    },
    /**检测是否选择当前鸡规则 */
    checkIsSelectJiRule: function (indexRule) {
        for (var i = 0, len = this.roomConf_jiPaiRule.length; i < len; i++) {
            if (this.roomConf_jiPaiRule[i] == indexRule) {
                return true;
            }
        }
        return false;
    },
    /**当鸡牌选择的时候 */
    onCheckJiPai: function () {
        console.log("当鸡牌选择的时候");
        //检测鸡牌的选择项目
        this.initJiPaiRuleData();
        //4个规则遍历
        for (var i = 0, len = 4; i < len; i++) {
            var isCheckRule = this.checkIsSelectJiRule(i);
            var chongjitoggle = this._chongjixuanzhe[i];
            if (!isCheckRule) {
                if (chongjitoggle.isChecked) {
                    chongjitoggle.isChecked = false;
                }
                chongjitoggle.interactable = false;
            } else {
                chongjitoggle.interactable = true;
            }
        }
        //没有选择的就设置下面的冲鸡无法显示

    },

    onBtnBack: function () {
        this.node.active = false;
    },

    onBtnOK: function () {
        // this.node.active = false;
        this.createRoom();
    },

    createRoom: function () {
        //缓存数据
        this.initPaiNumData();
        this.initTypeData();
        this.initJiPaiRuleData();
        this.initChongFengJiData();
        var selectData = {
            type: this.roomConf_type,
            paiNum: this.roomConf_paiNum,
            jiPaiRule: this.roomConf_jiPaiRule,
            chongfengJi: this.roomConf_chongfengJi,
        };
        // console.log("===============");
        console.log(JSON.stringify(selectData));
        cc.sys.localStorage.setItem('selectData', JSON.stringify(selectData));

        var conf = {
            type: this.roomConf_type,
            paiNum: this.roomConf_paiNum,
            jiPaiRule: this.roomConf_jiPaiRule,
            chongfengJi: this.roomConf_chongfengJi,
        };

        this.sendMsg(conf);

    },
    /**发送消息 */
    sendMsg: function (conf) {
        var self = this;
        var onCreate = function (ret) {
            cc.vv.timeout.unschedule(self.getCallback, self);
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
        console.log('sign=' + cc.vv.userMgr.sign);
        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            conf: JSON.stringify(conf),
        };
        console.log(data);
        cc.vv.wc.show("正在创建房间");
        cc.vv.http.sendRequest("/create_private_room", data, onCreate);
        cc.vv.timeout.timeoutOne(self.getCallback, self, 7);
    },

    getCallback: function () {
        cc.vv.wc.hide();
        cc.vv.alert.show("提示", "获取信息失败，请检查网络后 \n 再进行操作！");
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

        if (this._jushuxuanze) {
            this.diamondNumb.string = this._jushuxuanze[0].isChecked == true ? "2" : (this._jushuxuanze[1].isChecked == true ? "3" : "");
        }
        // if(this._zimo)
        // {
        //    var shuangshu = cc.find("Canvas/CreateRoom/zimojiacheng/shuangshu").active = !this._zimo[0].checked;
        //    var danshu = cc.find("Canvas/CreateRoom/zimojiacheng/danshu").active = !this._zimo[1].checked; 
        // }
        if (this._ismai) {
            // cc.log("1="+this._ismai[0].isChecked,"2="+this._ismai[1].isChecked)
        }
    },
});