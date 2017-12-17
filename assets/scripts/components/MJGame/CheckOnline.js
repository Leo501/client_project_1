
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
        _status:null,
        _timeout:null,
        _receiveTime:null,
        _lastRecTime:null,
        _interval:5,
    },

    // use this for initialization
    onLoad: function () {
        this._status='online';
        this._lastRecTime=0;
        this._receiveTime=-1;
        // this._interval=5;
        var self=this;
        this.node.on('testNet',function() {
            self._status='online';
            self._receiveTime=Date.now();
            console.log(self._receiveTime);
            console.log(self._lastRecTime);
            console.log('receive callback ');
        });
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this._timeout+=dt;
        if(this._timeout>this._interval) {
            // console.log('test time 5');
            this._timeout=0;
            // if(this._l)
            if(this._lastRecTime==this._receiveTime&& this._status=='online') {
                console.log('send disconnct');
                this._status='off' ;
                cc.vv.gameNetMgr.dispatchEvent('disconnect');
            } else if(this._status=='online') {
                console.log('socket is a live');
                this._lastRecTime=this._receiveTime;
                console.log(this._lastRecTime);
            }
            cc.vv.net.send('testNet');
        }

    },
});
