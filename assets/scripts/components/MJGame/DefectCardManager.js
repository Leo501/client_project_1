/**定缺牌管理器 */
cc.Class({
    extends: cc.Component,

    properties: {
        _defectNode: null,
        _wan: null,
        _tiao: null,
        _tong: null,
        _rotation_bg: null,
        _btnNode: null,
    },

    // use this for initialization
    onLoad: function () {
        var gameChild = this.node.getChildByName("game");
        this._defectCardNode = gameChild.getChildByName("defectCardNode");
        this._defectCardNode.active = false;
        this._btnNode = this._defectCardNode.getChildByName("btnNode")
        this._wan = this._btnNode.getChildByName("wan");
        this._tiao = this._btnNode.getChildByName("tiao");
        this._tong = this._btnNode.getChildByName("tong");
        this._rotation_bg = this._btnNode.getChildByName("rotation_bg");
        this._rotation_bg.active = false;
        this.init();
    },

    /**添加事件 */
    addEvent: function () {
        var self = this;

        /**通知显示选择缺 */
        this.node.on('show_defect_card_bre', function (data) {
            console.log('show_defect_card_bre ofdefectCardManager.js');
            self.showDefectBtn();
            cc.vv.gameNetMgr.isDingQue = false;
        });
        /**服务收到自己选择缺的信息返回 ,隐藏3个*/
        this.node.on('show_defect_card_return', function (data) {
            console.log('show_defect_card_return');
            self.hiddDefectBtn();
        });
        /**服务收到所有人选择缺的信息返回 */
        this.node.on('game_dingque_finish_push_return', function (data) {
            console.log('game_dingque_finish_push_return');
            self.hiddDefectAll()
        });

    },

    /**初始化 */
    init: function () {
        if (this._wan) {
            cc.vv.utils.addClickEvent(this._wan, this.node, "DefectCardManager", "onClicked", 1);
        }
        if (this._tiao) {
            cc.vv.utils.addClickEvent(this._tiao, this.node, "DefectCardManager", "onClicked", 1);
        }
        if (this._tong) {
            cc.vv.utils.addClickEvent(this._tong, this.node, "DefectCardManager", "onClicked", 1);
        }
        this.addEvent();
    },

    /**显示缺牌按钮 */
    showDefectBtn: function () {
        console.log("showDefectBtn");
        this._tong.scale = 1.5;
        this._tiao.scale = 1.5;
        this._wan.scale = 1.5;
        this._defectCardNode.active = true;
        // //已选缺后，不显示选择
        // if (cc.vv.defectType != undefined && cc.vv.defectType != null && cc.vv.defectType != -1) {
        //     console.log('this._btnNode hide showdefectBtn');
        //     this._btnNode.active = false;
        //     return;
        // }
        this._btnNode.active = true;
        console.log('this._btnNode.active=', this._btnNode);
        for (var i = 0; i < this._btnNode.childrenCount; i++) {
            var child = this._btnNode.children[i];
            if (child.name == "rotation_bg_obj_clone") {
                this._btnNode.removeChild(child);
                i--;
            }
        }
        try {
            var seats = cc.vv.gameNetMgr.seats;
            var seatData = seats[cc.vv.gameNetMgr.seatIndex];
            var holds = seatData.holds;
            holds = cc.vv.mahjongmgr.getSomeCardsColorArrByHolds(holds);
            console.log("显示缺牌按钮打印");
            console.log(holds);
            var sprFrame = null;
            var samllNum = cc.vv.mahjongmgr.getSmallNumByArr(holds);
            for (var i = 0, len = holds.length; i < len; i++) {
                if (holds[i] == samllNum) {
                    switch (i) {
                        case 0:
                            var rotation_bg_obj = cc.instantiate(this._rotation_bg);
                            rotation_bg_obj.parent = this._btnNode;
                            rotation_bg_obj.name = "rotation_bg_obj_clone";
                            rotation_bg_obj.setPosition(cc.p(this._tong.x, this._tong.y));
                            var playAni = rotation_bg_obj.getComponent(cc.Animation);
                            playAni.play("play_rotation_defect_bg");
                            rotation_bg_obj.active = true;
                            break;
                        case 1:
                            var rotation_bg_obj = cc.instantiate(this._rotation_bg);
                            rotation_bg_obj.parent = this._btnNode;
                            rotation_bg_obj.name = "rotation_bg_obj_clone";
                            rotation_bg_obj.setPosition(cc.p(this._tiao.x, this._tiao.y));
                            var playAni = rotation_bg_obj.getComponent(cc.Animation);
                            playAni.play("play_rotation_defect_bg");
                            rotation_bg_obj.active = true;
                            break;
                        case 2:
                            var rotation_bg_obj = cc.instantiate(this._rotation_bg);
                            rotation_bg_obj.parent = this._btnNode;
                            rotation_bg_obj.name = "rotation_bg_obj_clone";
                            rotation_bg_obj.setPosition(cc.p(this._wan.x, this._wan.y));
                            var playAni = rotation_bg_obj.getComponent(cc.Animation);
                            playAni.play("play_rotation_defect_bg");
                            rotation_bg_obj.active = true;
                            break;
                    }
                }
            }
        } catch (error) {
            console.log('-----------------------------------defectCardManager.js error:', error);
        }
    },

    /**隐藏btn */
    hiddDefectBtn: function () {
        console.log('this._btnNode  hide');
        this._defectCardNode.active = true;
        this._btnNode.active = false;
    },

    /**隐藏 All*/
    hiddDefectAll: function () {
        this._defectCardNode.active = false;
    },

    /**点击返回 */
    onClicked: function (event) {
        console.log(event.target.name);
        switch (event.target.name) {
            case "wan":
                console.log("click wan");
                this.sendMsg(3);
                break;
            case "tiao":
                console.log("click tiao");
                this.sendMsg(2);
                break;
            case "tong":
                console.log("click tong");
                this.sendMsg(1);
                break;
        }
    },
    /**发送消息 */
    sendMsg: function (type) {
        console.log("type=" + type);
        cc.vv.net.send('dingque', type);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

});