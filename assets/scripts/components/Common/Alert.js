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
        _alert:null,
        _btnOK:null,
        _btnCancel:null,
        _title:null,
        _content:null,
        _onok:null,
        isLoginNode:false
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv === null){
            return;
        }
        
        console.log("Alert");
        this._alert = cc.find("Canvas/alert");
        this._title = cc.find("Canvas/alert/title").getComponent(cc.Label);
        this._content = cc.find("Canvas/alert/content").getComponent(cc.Label);
        
        this._btnOK = cc.find("Canvas/alert/btn_ok");
        this._btnCancel = cc.find("Canvas/alert/btn_cancel");
        
        cc.vv.utils.addClickEvent(this._btnOK,this.node,"Alert","onBtnClicked",1);
        cc.vv.utils.addClickEvent(this._btnCancel,this.node,"Alert","onBtnClicked",3);
        
        this._alert.active = false;
        if(this.isLoginNode){
            cc.log("this is isLoginNode");
            cc.vv.login_alert=this;
            return;
        }

        cc.vv.alert = this;
        // console.log('----------------');
        // if(cc.vv) {
        //     console.log('cc.vv.');
        //     cc.vv.alert = this;  
        // }

        // this.node.on('enter_login_push',function(data) {
        //     console.log("enter_login_push alert.js");
        //     cc.vv.alert = this;
        // });
    },
    
    onBtnClicked:function(event){
        // console.log("onBtnClicked Alert.js");
        if(event.target.name == "btn_ok"){
            if(this._onok){
                this._onok();
            }
        }
        this._alert.active = false;
        this._onok = null;
    },
    
    show:function(title,content,onok,needcancel){
        // console.log("show of Alert.js");
        this._alert.active = true;
        this._onok = onok;
        this._title.string = title;
        this._content.string = content;
        if(needcancel){
            this._btnCancel.active = true;
            this._btnOK.x = -150;
            this._btnCancel.x = 150;
        }
        else{
            this._btnCancel.active = false;
            this._btnOK.x = 0;
        }
    },
    
    onDestory:function(){
        // cc.log("alert.js ","onDestory");
        if(this.isLoginNode){
            cc.log("alert is LoginNode");
            if(cc.vv){
            cc.vv.login_alert = null;    
            }
            return;
        }
        if(cc.vv){
            cc.vv.alert = null;    
        }
    }

});
