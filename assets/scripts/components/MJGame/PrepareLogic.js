/**
 * 准备时，可能的状态
 */
var State = cc.Enum({
    None   : -1,//无状态
    Zhuang : -1,//进行庄
    PaiDun : -1,//牌墩状态
    Init   : -1,//初始化麻将页面
    Que    : -1,//开始定缺
    QueCall: -1,//定缺确认
    FiniQue: -1,//完成定缺
    Begin  : -1,//开始打麻将
    Run    : -1,//进行定时操作

    Sync   :-1,//重连操作
    Action :-1,//碰，杠，胡的选择页面
});

cc.Class({
    extends: cc.Component,

    properties: {
        _inputAction:null,
        _runAction:null,
        _state:{
            default:State.None,
            type:State,
        }
    },

    // use this for initialization
    init: function () {
        // console.log(this._state);
        this._state=cc.vv.State.None;
        this._inputAction=new Array();
        this._runAction=null;
    },

    /**输入数据*/
    inputData:function(key,data) {
        //确保data不能为空。
        if(data===undefined) {
            console.log("inputData of key="+key+" is undefined")
            data=key;
        }
        this._inputAction[key]=data;
    },

    /**设置执行对象 */
    setRunAction:function(obj) {
        this._runAction=obj;
    },

    /**执行对应命令的动作 */
    runAction:function(name,data) {
        if(this._runAction!=null) {
            this._runAction.chooseEvent(name,data);
        }
    },

    /**判空*/
    isEmpty:function(key) {
        if(this._inputAction[key]==undefined||this._inputAction[key]==null) {
            return true;
        }
        return false;
    },

    /**移除数据 */
    removeForKey:function(key) {
        this._inputAction[key]=null;
    },

    /**执行庄动作后回调 */
    callbackOfZhuang:function() {
        if(!this.isEmpty(cc.vv.State.PaiDun)) {
            this._state=cc.vv.State.PaiDun;
            return;
        }

        this._state=cc.vv.State.None;
    },

    /**执行定缺后回调 */
    callbackOfDingQue:function() {
        this._state=cc.vv.State.None;
    },

    //执行牌墩后回调
    callbackOfPaiDun:function() {
        if(!this.isEmpty(cc.vv.State.Init)) {
            this._state=cc.vv.State.Init;
            return;
        }
        this._state=cc.vv.State.None;
    },

    /**执行初始化后回调 */
    callbackOfInit:function() {
        this._state=cc.vv.State.None;
    },


    callbackOfBegin:function() {
        this._state=cc.vv.State.None;
    },

    /** 取出状态数据并返回*/
    runState:function(name) {
        if(this.isEmpty(name)) {
            return null;
        }
        var data=this._inputAction[name];
        this.removeForKey(name);
        return data;
    }, 
    /**一般状态回调 */
    callback:function() {
        this._state=cc.vv.State.None;
    },
    
    /**执行状态 */
    execute:function(key,callback) {
        var data=this.runState(key);
        if(data!=null) {
            //传递数据
            this.runAction(key,data);
            callback();
        }
    }, 

    // called every frame, uncomment this function to activate update callback
    refresh: function (dt) {
        // console.log("prepareLogic.js dt");
        var self=this;
        switch(this._state) {
            case cc.vv.State.None:{                   
                    if(!this.isEmpty(cc.vv.State.Zhuang)) {
                        console.log("zhuang of refresh ");
                        this._state=cc.vv.State.Zhuang;
                        break;
                    }
                    if(!this.isEmpty(cc.vv.State.PaiDun)) {
                        console.log("PaiDun of refresh");
                        this._state=cc.vv.State.PaiDun;
                        break;
                    }
                    if(!this.isEmpty(cc.vv.State.Init)) {
                        this._state=cc.vv.State.Init;
                        break;
                    }
                    if(!this.isEmpty(cc.vv.State.Que)) {
                        this._state=cc.vv.State.Que;
                        break;
                    }
                    if(!this.isEmpty(cc.vv.State.QueCall)) {
                        this._state=cc.vv.State.QueCall;
                        break;
                    }
                    if(!this.isEmpty(cc.vv.State.FiniQue)) {
                        this._state=cc.vv.State.FiniQue;
                        break;
                    }
                    if(!this.isEmpty(cc.vv.State.Begin)) {
                        this._state=cc.vv.State.Begin;
                        break;
                    }

                    if(!this.isEmpty(cc.vv.State.Sync)) {
                        this._state=cc.vv.State.Sync;
                        break;
                    }

                    if(!this.isEmpty(cc.vv.State.Action)) {
                        this._state=cc.vv.State.Action;
                        break;
                    }
                break;
            }
            case cc.vv.State.Zhuang: {
                //
                this.execute(cc.vv.State.Zhuang,function() {
                    // 定时操作
                    cc.vv.timeout.timeoutOne(self.callback,self,2);
                });
                break;
            }
            case cc.vv.State.PaiDun: {
                this.execute(cc.vv.State.PaiDun,function() {
                    cc.vv.timeout.timeoutOne(self.callback,self,2);
                });
                break;
            }
            case cc.vv.State.Init: {
                console.log("execute init");
                this.execute(cc.vv.State.Init,function() {
                    self.callback();
                });
                break;
            }
            case cc.vv.State.Que: {
                this.execute(cc.vv.State.Que,function() {
                    self.callback();
                });
                break;
            }
            case cc.vv.State.QueCall: {
                this.execute(cc.vv.State.QueCall,function() {
                    self.callback();
                }); 
                break;
            }
            case cc.vv.State.FiniQue: {
                this.execute(cc.vv.State.FiniQue,function() {
                    self.callback();
                });
                break;
            }
            case cc.vv.State.Begin: {
                this.execute(State.Begin,function() {
                    self.callback();
                });
                break;
            }

            case cc.vv.State.Sync: {
                this.execute(cc.vv.State.Sync,function() {
                    self.callback();
                });
                break;
            }
            case cc.vv.State.Action: {
                this.execute(cc.vv.State.Action,function() {
                    self.callback();
                })
            }
            default :{
                console.log("stata=default");
                break;
            }
        }
    },
});
