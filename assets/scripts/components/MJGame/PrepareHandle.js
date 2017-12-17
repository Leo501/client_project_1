// var State = cc.Enum({
//     None   : -1,//无状态
//     Zhuang : -1,//进行庄
//     PaiDun : -1,//牌墩状态
//     Init   : -1,//初始化麻将页面
//     Que    : -1,//开始定缺
//     QueCall: -1,//定缺确认
//     FiniQue: -1,//完成定缺
//     Begin  : -1,//开始打麻将
//     Run    : -1,//进行定时操作

//     Sync   :-1,//重连操作
// });
cc.Class({
    extends: cc.Component,

    properties: {
        _dataEventHandler:null,
    },

    // use this for initialization
    init: function (node) {
        this._dataEventHandler=node;
    },

    chooseEvent:function(event,data) {
        var self=this;
        if(event==cc.vv.State.Zhuang) {
            console.log("zhuang");
            this.dispatchEvent("banker_push",data);
            return;
        }

        if(event==cc.vv.State.PaiDun) {
            console.log('paiDun');
            self.dispatchEvent('initpaiqiang');
            self.dispatchEvent("paidun_push",data);
            return ;
        }

        if(event==cc.vv.State.Init) {
            console.log("game_begin dispatch");
            self.dispatchEvent('game_begin');
            console.log("button=",cc.vv.gameNetMgr.button);
            self.dispatchEvent('initZhuang',cc.vv.gameNetMgr.button);
            return;
        }

        if(event==cc.vv.State.Que) {
            self.dispatchEvent('show_defect_card_bre');
            return;
        }

        if(event==cc.vv.State.QueCall) {
            self.dispatchEvent('show_defect_card_return');
            self.dispatchEvent('show_us_defect');
            self.dispatchEvent('selectSureDefectNum');
            return;
        }

        if(event==cc.vv.State.FiniQue) {
            console.log("finishQue dispatch");
            self.dispatchEvent('game_dingque_finish_push_return');
            self.dispatchEvent("show_all_defect");
            self.dispatchEvent('game_dingque_return')
            return;
        }

        if(event==cc.vv.State.Sync) {
            console.log("sync dispatch");
            self.dispatchEvent('game_sync');
            if(cc.vv.gameStatusHandle.isPlaying()) {
                console.log("is playing");
                //主动查询是否有操作。
                cc.vv.net.send("get_action");
            }
        }

        if(event==cc.vv.State.Action) {
            console.log("showAction dispatch");
            self.dispatchEvent('game_action', data);
        }

    },

    dispatchEvent(event,data){
        if(this._dataEventHandler){
            this._dataEventHandler.emit(event,data);
        }    
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
