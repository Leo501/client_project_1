const RoomBase = require('RoomBase');
const QuickChat = require('QuickChat');
const UserUtil = require('UserUtil');

cc.Class({
    extends: RoomBase,
    properties: {
        _btnExit: null,
    },

    // use this for initialization
    onLoad: function () {
        this._super();
        this.quickChatInfo = {};

        QuickChat.get13Shui(this.quickChatInfo);
        this._btnExit = cc.find('Canvas/btnNode/btn_exit_poker');
        cc.vv.utils.addClickEvent(this._btnExit, this.node, "PokerRoom", "onBtnExit");
    },

    start: function () {
        this._super();
        console.log('start');
        this.setAllSeats(cc.vv.gameNetMgr.seats);
        this.setBtnIcons();
    },

    onBtnExit: function (event) {
        console.log('event=', event);
    },

    setBtnIcons: function () {
        // console.log('setBtnIcons');
        if (this._players) {
            this._players.forEach((item => {
                let actor = item.getComponent('Actor');
                cc.vv.utils.addClickEvent(actor._sprIcon, this.node, 'PokerRoom', 'onBtnIcon');
            }));
        }
    },

    //设置
    onBtnIcon: function (event) {
        // console.log('event.target.parent', event.currentTarget.parent);
        let parent = event.currentTarget.parent;
        let actor = parent.getComponent('Actor');
        let seat = UserUtil.getSeatById(actor._userId);
        console.log('actor.userId', actor._userId, 'seat=', seat);
        if (actor._userId == 0 || actor._userId == null) {
            console.log('userId is o or null');
            return;
        }
        // let node = cc.director.getScene();
        // console.log('node=', node);
        cc.loader.loadRes('PokerPrefabs/PokerUserInfo', (err, prefab) => {
            console.log('err=', err);
            if (err) {
                console.log('error', err);
                return;
            }
            let userInfo = cc.instantiate(prefab);
            let scripte = userInfo.getComponent('PokerUserInfo');
            if (scripte) {
                scripte.setData(seat);
                this.node.addChild(userInfo);
            } else {
                console.log('PokerUserInfo scripte is null ');
            }
        });

        // //不错
        // cc.loader.loadRes('BasePrefabs/Alert', (err, prefab) => {
        //     console.log('err=', err);
        //     if (err) {
        //         console.log('error', err);
        //         return;
        //     }
        //     console.log('aaaabbbb error');
        //     let alertUtil = cc.instantiate(prefab);
        //     let scripte = alertUtil.getComponent('AlertUtil');
        //     if (scripte) {
        //         scripte.show('aaaa', 'bbbbbbbbbbbb', function () {
        //             console.log('console.log aaaaaa');
        //         });
        //         this.node.addChild(alertUtil);
        //     } else {
        //         console.log('PokerUserInfo scripte is null ');
        //     }
        // });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});