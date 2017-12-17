cc.Class({
    extends: cc.Component,
    properties: {
        target:cc.Node,
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _isShow:false,
        lblContent:cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return null;
        }
        
        console.log("onLoad waitingConnection ");
        
        cc.vv.wc = this;
        this.node.active = this._isShow;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.target.rotation = this.target.rotation - dt*45;
    },
    
    show:function(content){
        console.log("show wc");
        this._isShow = true;
        // console.log(this.node);
        if(this.node){
            this.node.active = this._isShow;   
        }
        console.log(this.lblContent);
        if(this.lblContent){
            if(content == null){
                content = "";
            }
            this.lblContent.string = content;
        }
        // else {
        //     this.node.active=true;
        // }
    },
    hide:function(){
        this._isShow = false;
        if(this.node){
            this.node.active = this._isShow;   
        }
    }
});
