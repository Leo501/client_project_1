cc.Class({
    extends: cc.Component,

    properties: {
        _dataEventHandler:null,
    },

    init: function (node) {
        this._dataEventHandler=node;
    },

    dispatchEvent(event,data){
        if(this._dataEventHandler){
            this._dataEventHandler.emit(event,data);
        }    
    },

    inputPushOrder:function() {
        
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
