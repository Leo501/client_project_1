/**游戏结束ui管理器 */
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        //over
        game_over_node: null,
        seats_node: null,
        seat_node: null,
        xiangqing_btn: null,
        //result
        game_result_node: null,
        seats_result_node: null,
        seat_result_node: null,
        _show_fan_text: null, //翻鸡牌node
        _show_fan_card: null, //翻鸡牌显示
        //game_over_datiel
        game_over_datiel_seats_node: null,
        game_over_datiel_seat_node: null,
        fanhui_btn: null,
        //
        _isGameEnd: false,
        _jiDatielColors: null, //结算详细数据的颜色
        //
        _Z_jiesuanditu: null, //结算底图
    },

    // use this for initialization
    onLoad: function () {
        this._jiDatielColors = ["#d26a16", "#1b928c", "#437e14", "#8252b0"]; //颜色配置
        //每局结算
        this.game_over_node = this.node.getChildByName("game_over");
        var game_over_show_node = this.game_over_node.getChildByName("game_over_show");
        this._Z_jiesuanditu = game_over_show_node.getChildByName("Z_jiesuanditu");
        this._show_fan_text = game_over_show_node.getChildByName("fan_ji_text_label");
        this._show_fan_text.active = false;
        this._show_fan_card = game_over_show_node.getChildByName("show_fan_icon");
        this._show_fan_card.active = false;
        this.seats_node = game_over_show_node.getChildByName("seats");
        this.seat_node = this.seats_node.getChildByName("seat");
        this.seat_node.parent = game_over_show_node;
        this.seat_node.active = false;
        this.game_over_node.active = false;
        //四局/八局后的结算
        this.game_result_node = this.node.getChildByName("game_result");
        var game_result_show_node = this.game_result_node.getChildByName("game_result_show");
        this.seats_result_node = game_result_show_node.getChildByName("seats");
        this.seat_result_node = this.seats_result_node.getChildByName("seat");
        this.seat_result_node.parent = game_result_show_node;
        this.seat_result_node.active = false;
        this.game_result_node.active = false;
        //结算详情
        this.game_over_datiel_seats_node = game_over_show_node.getChildByName("seats_datatiel");
        this.game_over_datiel_seat_node = this.game_over_datiel_seats_node.getChildByName("seat");
        this.game_over_datiel_seat_node.parent = game_over_show_node;
        this.game_over_datiel_seat_node.active = false;
        this.game_over_datiel_seats_node.active = false;

        //
        this.addEventHandle();
        // this.showGameOverViewByData(null);
        // this.showGameResultViewByData(null);
    },
    /**添加监听 */
    addEventHandle: function () {
        var self = this;
        this.node.on('game_over', function (data) {
            console.log("game_over", data.detail);
            //正常结算
            self.showGameOverViewByData(data);
            //算分详情
            self.showGameOverDatielViewByData(data);
        });
        this.node.on('game_end', function (data) {
            console.log("game_end");
            self.showGameResultViewByData(data);
            self.game_result_node.active = false;
        });
        //game_over准备
        var btnReady = self.game_over_node.getChildByName("btnReady");
        if (btnReady) {
            cc.vv.utils.addClickEvent(btnReady, self.node, "GameOverUIManager", "onBtnReadyClicked", 1);
        }
        //分享
        var fenxiang = self.game_over_node.getChildByName("fenxiang");
        if (fenxiang) {
            cc.vv.utils.addClickEvent(fenxiang, self.node, "GameOverUIManager", "onshare");
        }
        //结算关闭
        var btnClose = self.game_over_node.getChildByName("btnClose");
        if (btnClose) {
            cc.vv.utils.addClickEvent(btnClose, self.node, "GameOverUIManager", "onBtnReadyClicked", 3);
        }
        //详情
        self.xiangqing_btn = self.game_over_node.getChildByName("xiangqing");
        if (self.xiangqing_btn) {
            cc.vv.utils.addClickEvent(self.xiangqing_btn, self.node, "GameOverUIManager", "onShowDatatiel", 1);
        }
        //game_over_datatiel详情返回
        self.fanhui_btn = self.game_over_node.getChildByName("fanhui");
        if (self.fanhui_btn) {
            cc.vv.utils.addClickEvent(self.fanhui_btn, self.node, "GameOverUIManager", "onFanHui", 1);
        }
        //game_result大结算关闭
        var btnClose_r = self.game_result_node.getChildByName("btnClose");
        if (btnClose_r) {
            cc.vv.utils.addClickEvent(btnClose_r, self.node, "GameOverUIManager", "onBtnCloseClicked", 3);
        }
        //大结算分享
        var fenxiang_r = self.game_result_node.getChildByName("fenxiang");
        if (fenxiang_r) {
            cc.vv.utils.addClickEvent(fenxiang_r, self.node, "GameOverUIManager", "onshare");
        }
        // 分享朋友圈
        var pengyouquan = self.game_result_node.getChildByName("pengyouquan");
        if (pengyouquan) {
            cc.vv.utils.addClickEvent(pengyouquan, self.node, "GameOverUIManager", "onshare");
        }
        //
        this.xiangqing_btn.active = true;
        this.fanhui_btn.active = false;
    },
    /**gameresult close */
    onBtnCloseClicked: function () {
        cc.director.loadScene("hall");
    },
    /**分享战绩 */
    onshare: function onshare(event) {
        var type = true;
        if (event.target.name == "pengyouquan") {
            type = false;
            cc.vv.anysdkMgr.shareResult(type, false);
            return;
        }
        console.log("分享战绩");
        cc.vv.anysdkMgr.shareResult(type, false);
    },
    /**准备 */
    onBtnReadyClicked: function onBtnReadyClicked() {
        console.log("onBtnReadyClicked");
        if (this._isGameEnd) {
            this.game_result_node.active = true;
        } else {
            if (cc.vv.gameType.isCardGame()) {
                cc.vv.net.send('ready');
            } else if (cc.vv.gameType.isCoinGame()) {
                //说明要退出房间
                if (cc.vv.gameNetMgr.coinConfig === null) {
                    cc.director.loadScene("hall");
                    return;
                }
            }
            cc.vv.gameNetMgr.dispatchEvent('game_over_ready');
        }
        this.game_over_node.active = false;
    },

    /**显示详情 */
    onShowDatatiel: function () {
        console.log("显示详情");
        this.game_over_datiel_seats_node.active = true;
        this.seats_node.active = false;
        this.xiangqing_btn.active = false;
        this.fanhui_btn.active = true;
    },

    /**返回小结算 */
    onFanHui: function () {
        console.log("返回小结算");
        this.game_over_datiel_seats_node.active = false;
        this.seats_node.active = true;
        this.xiangqing_btn.active = true;
        this.fanhui_btn.active = false;
    },

    removeOverShowNode: function () {
        this.seats_node.removeAllChildren();
    },

    removeResultShowNode: function () {
        this.seats_result_node.removeAllChildren();
    },

    /**根据数据显示游戏结束面板 */
    showGameOverViewByData: function (data) {
        this.xiangqing_btn.active = true;
        this.fanhui_btn.active = false;

        this.removeOverShowNode();
        var overs = data.detail.overs;
        this._isGameEnd = data.detail.isend;
        var zhuangId = data.detail.zhuangId;
        var show_fan_id = data.detail.fanId; //翻鸡牌id
        //翻鸡牌显示
        if (show_fan_id != null || show_fan_id != undefined) {
            this._show_fan_text.active = true;
            this._show_fan_card.active = true;
            this._show_fan_card.getComponent(cc.Sprite).spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", parseInt(show_fan_id));
        } else {
            this._show_fan_text.active = false;
            this._show_fan_card.active = false;
        }
        var roomUserId = data.detail.createRoomUserId;
        if (!overs || overs == null) {
            return;
        }
        console.log("overs = " + overs);
        var user_infos = overs;
        //每一个人的信息
        var interWidth = 0;
        switch (user_infos.length) {
            case 2:
                interWidth = 65;
                break;
            case 3:
                interWidth = 35;
                break;
            case 4:
                interWidth = 2;
                break;
        }
        var interW = this.seat_node.width + interWidth;
        var beginX = -((user_infos.length - 1) * interW + this.seat_node.width) / 2 + this.seat_node.width / 2;
        var peopleNum = 1;
        for (var i = 0, leni = user_infos.length; i < leni; i++) {
            var user_info = user_infos[i];
            var node = cc.instantiate(this.seat_node);
            node.name = "seatCopy" + i;
            node.parent = this.seats_node;
            //自己的信息放在第一位
            if (user_info.userId == cc.vv.userMgr.userId) {
                node.setPosition(beginX + interW * 0, this.seat_node.y);
            } else {
                node.setPosition(beginX + interW * peopleNum, this.seat_node.y);
                peopleNum++;
            }
            //玩家信息
            var user_info_node = node.getChildByName("user_info");
            var icon = user_info_node.getChildByName("icon").getComponent("ImageLoader");
            icon.setUserID(user_info.userId);
            var name = user_info_node.getChildByName("name").getComponent(cc.Label);
            name.string = cc.vv.gameNetMgr.setName(user_info.nickName, 8, true);
            var id = user_info_node.getChildByName("id").getComponent(cc.Label);
            id.string = user_info.userId;
            var zhuang = user_info_node.getChildByName("zhuang");
            if (user_info.userId == zhuangId) {
                zhuang.active = true;
            } else {
                zhuang.active = false;
            }
            var fangzhu = node.getChildByName("fangzhu");
            if (user_info.userId == roomUserId) {
                fangzhu.active = true;
            } else {
                fangzhu.active = false;
            }
            //胡牌信息
            var show_win_node = node.getChildByName("show_win_node");
            var show_info_win = show_win_node.getChildByName("show_info_win");
            show_info_win.active = false;
            var show_info_lose = show_win_node.getChildByName("show_info_lose");
            show_info_lose.active = false;
            var show_info_hu = show_win_node.getChildByName("show_info_hu");
            show_info_hu.active = false;
            var hutype = user_info.huType;
            switch (hutype.type) {
                case 0:
                    show_info_hu.active = true;
                    break;
                case 1:
                    show_info_win.active = true;
                    break;
                case 2:
                    show_info_lose.active = true;
                    break;
            }

            var show_win_lable = show_win_node.getChildByName("show_win_lable").getComponent(cc.Label);
            var newStr = "";
            var strTitle = hutype.titleText;
            var strArr = strTitle.split(";");
            var lastC = -1;
            if (strArr.length % 2 == 0) {
                lastC = strArr.length / 2;
            } else {
                lastC = (strArr.length - 1) / 2;
            }
            if (lastC != -1) {
                for (var index = 0, lenIndex = strArr.length; index < lenIndex; index++) {
                    newStr += strArr[index];
                    if ((index < lastC - 1 || index > lastC - 1) && index < lenIndex - 1) {
                        newStr += " ";
                    }
                    if (index == lastC - 1) {
                        newStr += "\n";
                    }
                }
            }
            show_win_lable.string = newStr;
            var show_huType_node = node.getChildByName("show_huType");
            var config = hutype.config; //icon
            if (config == -1) {
                show_huType_node.getChildByName("show_icon_hu").active = false;
                show_huType_node.getChildByName("show_icon_pao").active = false;
            } else if (config == 0) {
                show_huType_node.getChildByName("show_icon_hu").active = true;
                show_huType_node.getChildByName("show_icon_pao").active = false;
            } else if (config == 1) {
                show_huType_node.getChildByName("show_icon_hu").active = false;
                show_huType_node.getChildByName("show_icon_pao").active = true;
            }
            var score = hutype.score; //score
            var socre_text = show_huType_node.getChildByName("score").getComponent(cc.Label);
            if (!score || score == undefined) {
                socre_text.string = "";
            } else if (score > 0) {
                socre_text.string = "+" + score;
            } else {
                socre_text.string = score;
            }
            //鸡的信息Object
            var jiTypes = user_info.scoreList;
            var jiNode = node.getChildByName("jiNode").getChildByName("view").getChildByName("content");
            var ji = jiNode.getChildByName("ji");
            var len = jiTypes.length;
            var showNumJi = 0;
            for (var j = 0; j < len; j++) {
                if (jiTypes[j].type == null) {
                    //没有类型
                    continue;
                }
                if (parseInt(jiTypes[j].type) == -2) {
                    //是查缺
                    if (jiTypes[j].score && parseInt(jiTypes[j].score) > 0) {
                        //差缺只是显示负分
                        continue;
                    }
                } else {
                    //不是查缺
                    if (jiTypes[j].score && parseInt(jiTypes[j].score) < 0) {
                        //是负分不显示
                        continue;
                    }
                }
                var node_ji = cc.instantiate(ji);
                node_ji.parent = jiNode;
                node_ji.setPosition(ji.x, ji.y - showNumJi * ji.height); //-190
                showNumJi++;
                var jiIcon = node_ji.getChildByName("icon");
                var type = jiTypes[j].type;
                var num = jiTypes[j].num;
                var hiddeNum = jiTypes[j].hiddeNum;
                //显示多少个鸡牌
                for (var numJi = 0; numJi < num; numJi++) {
                    if (type < 0) {
                        //没有类型牌
                        break;
                    }
                    var conloeJiIcon = cc.instantiate(jiIcon);
                    conloeJiIcon.parent = node_ji;
                    conloeJiIcon.setPosition(jiIcon.x + numJi * 8, jiIcon.y);
                    var spr = conloeJiIcon.getComponent(cc.Sprite);
                    //getEmptySpriteFrame("up");
                    if (hiddeNum && hiddeNum != null && numJi == 0) {
                        spr.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame("up");
                        conloeJiIcon.active = true;
                        continue;
                    }
                    spr.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", type);
                    conloeJiIcon.active = true;
                }
                jiIcon.active = false;
                node_ji.active = true;
                var jiText = node_ji.getChildByName("jiText").getComponent(cc.Label);
                jiText.string = jiTypes[j].title;
                var score = node_ji.getChildByName("score").getComponent(cc.Label);
                if (!jiTypes[j].score) {
                    //没有分数信息
                    score.string = "";
                    continue;
                }
                if (parseInt(jiTypes[j].type) != -2 && jiTypes[j].score > 0) {
                    //正分
                    score.string = "+" + jiTypes[j].score;
                } else {
                    if (parseInt(jiTypes[j].type) != -2) {
                        //不是查缺
                        score.string = ""; //不显示负分或没有分
                    } else {
                        //是查缺
                        //查缺显示负分
                        score.string = "" + jiTypes[j].score;
                    }
                }
            }
            jiNode.height = len * ji.height;
            //分数
            var showScore = null;
            showScore = node.getChildByName("showScore").getChildByName("showText").getComponent(cc.Label);
            var sumScore = user_info.sumScore;
            if (sumScore > 0) {
                showScore.string = "+" + sumScore;
            } else {
                showScore.string = sumScore;
            }
            ji.active = false;
            node.active = true;
        }
        this.seat_node.active = false;
        console.log("seats_node节点数->" + this.seats_node.childrenCount);
        this.game_over_node.active = true;
        this.game_over_datiel_seats_node.active = false;
        this.seats_node.active = true;

        //调整面板大小
        switch (peopleNum) {
            case 2:
                this._Z_jiesuanditu.width = 580;
                break;
            case 3:

                this._Z_jiesuanditu.width = 710;
                break;
            case 4:
                this._Z_jiesuanditu.width = 860;
                break;
        }
    },

    /**根据seatid获取显示颜色 */
    getColorStrBySeatId: function (seatId) {
        var userSeatId = cc.vv.gameNetMgr.getSeatIndexByID(cc.vv.userMgr.userId)
        if (userSeatId == seatId) {
            //自己
            return this._jiDatielColors[0];
        }
        if ((seatId + 1) % 4 == userSeatId) {
            return this._jiDatielColors[1];
        } else if ((seatId + 2) % 4 == userSeatId) {
            return this._jiDatielColors[2];
        } else if ((seatId + 3) % 4 == userSeatId) {
            return this._jiDatielColors[3];
        }
        return this._jiDatielColors[0];
    },

    /**显示计分详情 */
    showGameOverDatielViewByData: function (data) {
        this.game_over_datiel_seats_node.removeAllChildren();
        var overs = data.detail.overs;
        var zhuangId = data.detail.zhuangId;
        var show_fan_id = data.detail.fanId; //翻鸡牌id
        var roomUserId = data.detail.createRoomUserId;
        var userInfoListDataDetils = overs;
        //每一个人的信息
        var interWidth = 0;
        switch (userInfoListDataDetils.length) {
            case 2:
                interWidth = 65;
                break;
            case 3:
                interWidth = 35;
                break;
            case 4:
                interWidth = 2;
                break;
        }
        var interW = this.game_over_datiel_seat_node.width + interWidth;
        var beginX = -((userInfoListDataDetils.length - 1) * interW + this.game_over_datiel_seat_node.width) / 2 + this.game_over_datiel_seat_node.width / 2;
        var peopleNum = 1;
        for (var i = 0, len = userInfoListDataDetils.length; i < len; i++) {
            var user_info = userInfoListDataDetils[i];
            var node = cc.instantiate(this.game_over_datiel_seat_node);
            node.name = "seatCopy" + i;
            node.parent = this.game_over_datiel_seats_node;
            //自己的信息放在第一位
            if (user_info.userId == cc.vv.userMgr.userId) {
                node.setPosition(beginX + interW * 0, this.seat_node.y);
            } else {
                node.setPosition(beginX + interW * peopleNum, this.seat_node.y);
                peopleNum++;
            }
            //玩家信息
            var user_info_node = node.getChildByName("user_info");
            var icon = user_info_node.getChildByName("icon").getComponent("ImageLoader");
            icon.setUserID(user_info.userId);
            var name = user_info_node.getChildByName("name").getComponent(cc.Label);
            name.string = cc.vv.gameNetMgr.setName(user_info.nickName, 8, true);
            var id = user_info_node.getChildByName("id").getComponent(cc.Label);
            id.string = user_info.userId;
            var zhuang = user_info_node.getChildByName("zhuang");
            if (user_info.userId == zhuangId) {
                zhuang.active = true;
            } else {
                zhuang.active = false;
            }
            var fangzhu = node.getChildByName("fangzhu");
            if (user_info.userId == roomUserId) {
                fangzhu.active = true;
            } else {
                fangzhu.active = false;
            }
            //胡牌信息
            var show_win_node = node.getChildByName("show_win_node");
            var show_info_win = show_win_node.getChildByName("show_info_win");
            show_info_win.active = false;
            var show_info_lose = show_win_node.getChildByName("show_info_lose");
            show_info_lose.active = false;
            var show_info_hu = show_win_node.getChildByName("show_info_hu");
            show_info_hu.active = false;
            var hutype = user_info.huType;
            switch (hutype.type) {
                case 0:
                    show_info_hu.active = true;
                    break;
                case 1:
                    show_info_win.active = true;
                    break;
                case 2:
                    show_info_lose.active = true;
                    break;
            }
            //字样
            var show_win_lable = show_win_node.getChildByName("show_win_lable").getComponent(cc.Label);
            var newStr = "";
            var strTitle = hutype.titleText;
            var strArr = strTitle.split(";");
            var lastC = -1;
            if (strArr.length % 2 == 0) {
                lastC = strArr.length / 2;
            } else {
                lastC = (strArr.length - 1) / 2;
            }
            if (lastC != -1) {
                for (var index = 0, lenIndex = strArr.length; index < lenIndex; index++) {
                    newStr += strArr[index];
                    if ((index < lastC - 1 || index > lastC - 1) && index < lenIndex - 1) {
                        newStr += " ";
                    }
                    if (index == lastC - 1) {
                        newStr += "\n";
                    }
                }
            }
            show_win_lable.string = newStr;
            var show_huType_node = node.getChildByName("show_huType");
            var config = hutype.config; //icon
            if (config == -1) {
                show_huType_node.getChildByName("show_icon_hu").active = false;
                show_huType_node.getChildByName("show_icon_pao").active = false;
            } else if (config == 0) {
                show_huType_node.getChildByName("show_icon_hu").active = true;
                show_huType_node.getChildByName("show_icon_pao").active = false;
            } else if (config == 1) {
                show_huType_node.getChildByName("show_icon_hu").active = false;
                show_huType_node.getChildByName("show_icon_pao").active = true;
            }
            var score = hutype.score; //score
            var socre_text = show_huType_node.getChildByName("score").getComponent(cc.Label);
            if (!score || score == undefined) {
                socre_text.string = "";
            } else if (score > 0) {
                socre_text.string = "+" + score;
            } else {
                socre_text.string = score;
            }
            //鸡的信息Object
            var jiTypes = user_info.scoreList;
            var jiNode = node.getChildByName("jiNode").getChildByName("view").getChildByName("content");
            var ji = jiNode.getChildByName("ji");
            ji.active = false;
            //进
            var showNum = 0;
            var jin = jiNode.getChildByName("jin");
            showNum++;
            var lenJ = jiTypes.length;
            var maxSeatNum = 4; //最多的人数位置
            //遍历每个位置依次显示数据
            for (var seatIdIndex = 0; seatIdIndex < maxSeatNum; seatIdIndex++) {
                //遍历每个数据
                for (var j = 0; j < lenJ; j++) {
                    if (parseInt(jiTypes[j].seatId) != seatIdIndex) {
                        continue;
                    }
                    if (jiTypes[j].score && parseInt(jiTypes[j].score) < 0) {
                        continue;
                    }
                    var node_ji = cc.instantiate(ji);
                    node_ji.parent = jiNode;
                    node_ji.setPosition(ji.x, ji.y - showNum * ji.height); //-190
                    showNum++;
                    var jiIcon = node_ji.getChildByName("icon");
                    var type = jiTypes[j].type;
                    var num = jiTypes[j].num;
                    var hiddeNum = jiTypes[j].hiddeNum;
                    //显示多少个鸡牌
                    for (var numJi = 0; numJi < num; numJi++) {
                        if (type == -1) {
                            break;
                        }
                        var conloeJiIcon = cc.instantiate(jiIcon);
                        conloeJiIcon.parent = node_ji;
                        conloeJiIcon.setPosition(jiIcon.x + numJi * 15, jiIcon.y);
                        var spr = conloeJiIcon.getComponent(cc.Sprite);
                        //getEmptySpriteFrame("up");
                        if (hiddeNum && hiddeNum != null && numJi == 0) {
                            spr.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame("up");
                            conloeJiIcon.active = true;
                            continue;
                        }
                        spr.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", type);
                        conloeJiIcon.active = true;
                    }
                    jiIcon.active = false;
                    node_ji.active = true;
                    var jiText = node_ji.getChildByName("jiText").getComponent(cc.Label);
                    jiText.string = jiTypes[j].title;
                    jiText.node.color = (new cc.Color()).fromHEX(this.getColorStrBySeatId(jiTypes[j].seatId));
                    var score = node_ji.getChildByName("score").getComponent(cc.Label);
                    if (jiTypes[j].score) {
                        score.string = jiTypes[j].score;
                        if (jiTypes[j].score > 0) {
                            score.string = "+" + jiTypes[j].score;
                        }
                    } else {
                        score.string = "";
                    }

                }
            }
            //出
            var chu = jiNode.getChildByName("chu");
            chu.setPosition(ji.x, ji.y - showNum * ji.height); //-190
            showNum++;
            //遍历每个位置依次显示数据
            for (var seatIdIndex = 0; seatIdIndex < maxSeatNum; seatIdIndex++) {
                //遍历每个数据
                for (var j = 0; j < lenJ; j++) {
                    if (parseInt(jiTypes[j].seatId) != seatIdIndex) {
                        continue;
                    }
                    if (jiTypes[j].score && parseInt(jiTypes[j].score) > 0) {
                        continue;
                    }
                    var node_ji = cc.instantiate(ji);
                    node_ji.parent = jiNode;
                    node_ji.setPosition(ji.x, ji.y - showNum * ji.height); //-190
                    showNum++;
                    var jiIcon = node_ji.getChildByName("icon");
                    var type = jiTypes[j].type;
                    var num = jiTypes[j].num;
                    var hiddeNum = jiTypes[j].hiddeNum;
                    //显示多少个鸡牌
                    for (var numJi = 0; numJi < num; numJi++) {
                        if (type == -1) {
                            break;
                        }
                        var conloeJiIcon = cc.instantiate(jiIcon);
                        conloeJiIcon.parent = node_ji;
                        conloeJiIcon.setPosition(jiIcon.x + numJi * 15, jiIcon.y);
                        var spr = conloeJiIcon.getComponent(cc.Sprite);
                        //getEmptySpriteFrame("up");
                        if (hiddeNum && hiddeNum != null && numJi == 0) {
                            spr.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame("up");
                            conloeJiIcon.active = true;
                            continue;
                        }
                        spr.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", type);
                        conloeJiIcon.active = true;
                    }
                    jiIcon.active = false;
                    node_ji.active = true;
                    var jiText = node_ji.getChildByName("jiText").getComponent(cc.Label);
                    jiText.string = jiTypes[j].title;
                    jiText.node.color = (new cc.Color()).fromHEX(this.getColorStrBySeatId(jiTypes[j].seatId));
                    var score = node_ji.getChildByName("score").getComponent(cc.Label);
                    if (jiTypes[j].score) {
                        score.string = jiTypes[j].score;
                        if (jiTypes[j].score > 0) {
                            score.string = "+" + jiTypes[j].score;
                        }
                    } else {
                        score.string = "";
                    }

                }
            }
            jiNode.height = showNum * ji.height;
            //分数
            var showScore = null;
            showScore = node.getChildByName("showScore").getChildByName("showText").getComponent(cc.Label);
            var sumScore = user_info.sumScore;
            if (sumScore > 0) {
                showScore.string = "+" + sumScore;
            } else {
                showScore.string = sumScore;
            }
            //
            node.active = true;
        }

        //调整面板大小
        switch (peopleNum) {
            case 2:
                this._Z_jiesuanditu.width = 580;
                break;
            case 3:

                this._Z_jiesuanditu.width = 710;
                break;
            case 4:
                this._Z_jiesuanditu.width = 860;
                break;
        }
    },

    /**根据数据显示游戏结果面板 */
    showGameResultViewByData: function (data) {
        // return;
        this.removeResultShowNode();
        var results = data.detail.results;
        var zhuangId = data.detail.zhuangId;
        var roomUserId = data.detail.createRoomUserId;
        var user_infos_r = results;
        //找出大赢家
        var winAllId = 0;
        var winScore = -99999999;
        for (var i = 0, leni = user_infos_r.length; i < leni; i++) {
            if (user_infos_r[i].scoreAll > winScore) {
                winScore = user_infos_r[i].scoreAll;
                winAllId = user_infos_r[i].userId;
            }
        }
        var interWidth = 0;
        switch (user_infos_r.length) {
            case 2:
                interWidth = 65;
                break;
            case 3:
                interWidth = 65;
                break;
            case 4:
                interWidth = 0;
                break;
        }
        var interW = this.seat_result_node.width + interWidth;
        var beginX = -((user_infos_r.length - 1) * interW + this.seat_result_node.width) / 2 + this.seat_result_node.width / 2;
        //每一个人的信息
        for (var i = 0, leni = user_infos_r.length; i < leni; i++) {
            var user_info = user_infos_r[i];
            var node = cc.instantiate(this.seat_result_node);
            node.parent = this.seats_result_node;
            node.name = "seatCopy" + i;
            node.setPosition(beginX + interW * i, this.seat_result_node.y);
            //玩家信息
            var dayingjia = node.getChildByName("dayingjia");
            if (winAllId == user_info.userId) {
                dayingjia.active = true;
            } else {
                dayingjia.active = false;
            }
            var fangzhu = node.getChildByName("fangzhu");
            if (roomUserId == user_info.userId) {
                fangzhu.active = true;
            } else {
                fangzhu.active = false;
            }
            var user_info_node = node.getChildByName("user_info");
            var icon = user_info_node.getChildByName("icon").getComponent("ImageLoader");
            icon.setUserID(user_info.userId);
            var name = user_info_node.getChildByName("name").getComponent(cc.Label);
            name.string = cc.vv.gameNetMgr.setName(user_info.nickName, 8, true);
            var id = user_info_node.getChildByName("id").getComponent(cc.Label);
            id.string = user_info.userId;
            //score
            if (user_info.scoreAll > 0) {
                var showText = node.getChildByName("showScore").getChildByName("zongjiwin").getComponent(cc.Label);
                showText.string = "+" + user_info.scoreAll;
                node.getChildByName("showScore").getChildByName("zongjiwin").active = true;
                node.getChildByName("showScore").getChildByName("zongjilose").active = false;
            } else {
                var showText = node.getChildByName("showScore").getChildByName("zongjilose").getComponent(cc.Label);
                showText.string = "+" + user_info.scoreAll;
                node.getChildByName("showScore").getChildByName("zongjilose").active = true;
                node.getChildByName("showScore").getChildByName("zongjiwin").active = false;
            }
            //各个局信息
            var sijuNode = node.getChildByName("siju").getChildByName("view").getChildByName("content");
            var jushu = sijuNode.getChildByName("jushu");
            var juShus = user_info.juShus;
            var len = juShus.length;
            for (var j = 0; j < len; j++) {
                var node_jushu = cc.instantiate(jushu);
                node_jushu.parent = sijuNode;
                node_jushu.setPosition(jushu.x, -(jushu.height / 2) - j * jushu.height);
                var num = node_jushu.getChildByName("jushuText").getComponent(cc.Label);
                num.string = "第" + juShus[j].num + "局";
                var score = node_jushu.getChildByName("score").getComponent(cc.Label);
                if (juShus[j].score > 0) {
                    score.string = "+" + juShus[j].score;
                } else {
                    score.string = juShus[j].score;
                }
            }
            node.active = true;
            jushu.active = false;
            sijuNode.height = jushu.height * len;
        }
        this.seat_result_node.active = false;
        console.log("seats_node节点数->" + this.seats_node.childrenCount);
        this.game_result_node.active = true;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});