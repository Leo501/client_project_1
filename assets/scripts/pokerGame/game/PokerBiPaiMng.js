cc.Class({
    extends: cc.Component,

    properties: {
        //用于管理比牌节点数组
        _seats: {
            default: [],
            type: [cc.Node]
        },
        _thisNode: null,
        // _size: null,
    },

    // use this for initialization
    onLoad: function () {
        console.log('onLoad pokerBiPaiMng.js');
        this.initSeatsSize();
        this.addLocalEvent();
        // this._thisNode.active = false;
    },

    //确定要有几个场
    initSeatsSize: function () {
        this._seats = [];
        let size = cc.vv.setPeople.getMenPoker();
        let children = cc.vv.setPeople.getMenIdxArr();
        //取得扑克节点
        let mngNode = this._thisNode = cc.find('Canvas/prepare/pokerNode');
        let seatIdx = cc.vv.gameNetMgr.seatIndex;

        if (mngNode) {
            children.forEach((item, idx) => {
                let child = mngNode.children[item];
                let pokerChuPai = child.getChildByName('pokerChuPai');
                pokerChuPai.active = false;
                if (child) {
                    this._seats.push(child);
                } else {
                    console.log('child is null');
                }
            });
        } else {
            console.log('mngNode is null');
        }
    },

    //设置同步数据
    initGameSync: function () {

    },

    //开始比牌
    startRunBiPaiAnim_1: function (data) {
        // console.log('startRunBiPaiAnim_1 data=', data);
        let size = this._seats.length;
        let i = 0;
        let count = size * 3 - 1;
        let timeId = setInterval(() => {
            // console.log('startRunBiPaiAnim_1', i);
            if (i > count) {
                // console.log('end i=', i);
                clearInterval(timeId);
                //去显示结算
                G.pokerGame.emit('show_result');
                this._thisNode.active = false;
                return;
            }
            try {
                let node = this._seats[i % size];
                let userId = node.userInfo.userid;
                if (userId === 0) {
                    console.log('userId=0');
                    i++;
                    return;
                }
                let userData = data[userId];
                // console.log('node userId=', userId);
                // console.log('data of userId=', data[userId]);
                let script = node.getComponent('PokerBiPai');
                //清除上局数据
                // script.initByData();
                //到一个商
                let san = parseInt(i / size);
                if (san % 3 == 0) {
                    script.initShowSd(userData[0]);
                } else if (san % 3 == 1) {
                    script.initShowZd(userData[1]);
                } else if (san % 3 == 2) {
                    script.initShowWd(userData[2]);
                }
            } catch (error) {
                console.log('data have error');
            }
            i++;
        }, 900);
    },

    //添加本地事件
    addLocalEvent: function () {
        this.node.on('play_out', (event) => {
            // console.log('play_out data=', event.detail);
            let data = event.detail;
            this._thisNode.active = true;
            this.startRunBiPaiAnim_1(data.userDetail);
            let size = cc.vv.setPeople.getMenPoker();
            for (let i = 0; i < size; i++) {
                let child = this._seats[i];
                let pokerChuPaiNode = child.getChildByName('pokerChuPai');
                let pokerFaiPaiList = child.getChildByName('pokerFaiPaiList');
                pokerFaiPaiList.active = false;
                pokerChuPaiNode.active = false;
            }
        });

        this.node.on('game_poker_holds', (event) => {
            console.log('game_hold');
            let seatIdx = cc.vv.gameNetMgr.seatIndex;
            let size = cc.vv.setPeople.getMenPoker();
            this._thisNode.active = true;
            for (let i = 0; i < size; i++) {
                let child = this._seats[i];
                child.userInfo = cc.vv.gameNetMgr.seats[seatIdx++ % size];
                // console.log('child.userid=', child.userInfo);
                let script = child.getComponent('PokerBiPai');
                //清除上局数据
                script.initByData();
                // let pokerChuPaiNode = child.getChildByName('pokerChuPai');
                // pokerChuPaiNode.active = false;
                let pokerFaiPaiList = child.getChildByName('pokerFaiPaiList');
                pokerFaiPaiList.active = true;
                let scriptAnim = pokerFaiPaiList.getComponent('PokerFanPaiAnimation');
                scriptAnim.startRunFaiPaiAnimation_2(150);
            }
        });

        this.node.on('game_sync_status', (event) => {
            console.log('game_sync_status');
            let seatIdx = cc.vv.gameNetMgr.seatIndex;
            let size = cc.vv.setPeople.getMenPoker();
            this._thisNode.active = true;
            for (let i = 0; i < size; i++) {
                // console.log('');
                let child = this._seats[i];
                child.userInfo = cc.vv.gameNetMgr.seats[seatIdx++ % size];
                // console.log('child.userid=', child.userInfo);
                let script = child.getComponent('PokerBiPai');
                //清除上局数据
                script.initByData();
                let pokerChuPaiNode = child.getChildByName('pokerChuPai');
                let pokerFaiPaiList = child.getChildByName('pokerFaiPaiList');
                if (child.userInfo.channelStatus) {
                    pokerChuPaiNode.active = true;
                    pokerFaiPaiList.active = false;
                } else {
                    pokerChuPaiNode.active = false;
                    pokerFaiPaiList.active = true;
                }
                // let scriptAnim = pokerFaiPaiList.getComponent('PokerFanPaiAnimation');
                // scriptAnim.startRunFaiPaiAnimation_2(150);
            }
        });

        /** 有人摆好牌了，显示摆牌节点，隐藏手牌节点 */
        this.node.on('play_out_ready', (event) => {
            console.log('play_out_ready pokerBiPaiMng.js', event.detail);
            let data = event.detail;
            let size = cc.vv.setPeople.getMenPoker();
            for (let i = 0; i < size; i++) {
                let child = this._seats[i];
                let userId = child.userInfo.userid;
                //找到是哪个人的
                if (data.userId == userId) {
                    let pokerChuPaiNode = child.getChildByName('pokerChuPai');
                    pokerChuPaiNode.active = true;
                    let pokerFaiPaiList = child.getChildByName('pokerFaiPaiList');
                    pokerFaiPaiList.active = false;
                    break;
                }
            }
        });

        this.node.on('show_result', (event) => {
            let size = cc.vv.setPeople.getMenPoker();
            let seatIdx = cc.vv.gameNetMgr.seatIndex;
            for (let i = 0; i < size; i++) {
                let child = this._seats[i];
                child.userInfo = cc.vv.gameNetMgr.seats[seatIdx++ % size];
                // console.log('child.userid=', child.userInfo);
                let script = child.getComponent('PokerBiPai');
                //清除上局数据
                script.initByData();
            }
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
