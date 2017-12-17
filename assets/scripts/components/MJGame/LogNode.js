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
        
        labelArr:{
            default:[],
            type:[cc.Label],
        },
        _idx:0,
        _length:80,
    },

    // use this for initialization
    onLoad: function () {
        console.log("this.labelArr.length="+this.labelArr.length);
        for(var i=0;i<this.labelArr.length;i++) {
            this.labelArr[i].string="";
        }
        cc.vv.logNodeHandle=this.node;
        var self=this;
        this.node.on("show_log",function(data) {
            var detail=data.detail;
            var date=Date.now();
            detail+=" time"+date;
            self._length=80;
            console.log("data.length="+detail.length);
            for(var i=0;i<detail.length;i+=self._length){
                console.log("i="+i+" "+self._length);
                var substr=detail.substr(i,self._length);
                self.labelArr[self._idx++%6].string=substr;
            }
            // if(data.length)
            // self._idx++;
            
        });

        if(cc.vv.logNodeHandleArr&&cc.vv.logNodeHandleArr.length>0) {
            console.log("logNode have a array");
            var info=cc.vv.logNodeHandleArr;
            for(var i=0;i<info.length;i++) {
                cc.vv.logNodeHandle.emit("show_log",info[i]);
            }
        }
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
