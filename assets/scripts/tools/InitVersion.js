
/**
 * 初始化本地版本号跟远程版本号
 * cc.vv.initVersion
 */
var initVersion=cc.Class({
    extends: cc.Component,
    statics: {
        //本地版本号
        _localVersion:"",
        //远程版本
        _remoteVersion:"",

        init:function(){
            this._localVersion=cc.LAST_VERSION||"";
            this._remoteVersion=cc.REMOTE_VERSION||"";
            console.log("--this._localVersion="+this._localVersion,"this._remoteVersion="+this._remoteVersion);
        },
        //比较版本
        compareVersion:function(){
            if(this._localVersion===""||this._remoteVersion==="") {
                console.log("can not compare");
                return false;
            }
            console.log("this._localVersion=",this._localVersion);
            var local=this._localVersion.split('.').map(e=>parseInt(e));
            console.log("local=",local);
            var remote=this._remoteVersion.split('.').map(e=>parseInt(e));
            console.log("remote=",remote);
            for(var i=0;i<local.length;++i) {
                var a=local[i];
                var b=remote[i]||0;
                if(a===b) {
                    continue;
                } 
                return a-b<0?false:true;
            }
            //
            return true;
        },
        //是否为最新版本
        isLastVersion:function(){
            //对比下
            var version=this.takeDB();
            console.log("initVersion.js version=",version);
            if(version==null || version!=this._localVersion) {
                this.saveDB(this._localVersion);
                console.log(this._localVersion,this.takeDB());
                return false;
            }
            return this.compareVersion();
        },
        //储入本地数据库
        saveDB:function(localVersion) {
            cc.sys.localStorage.setItem("version",localVersion);
        },
        //
        takeDB:function() {
            return cc.sys.localStorage.getItem("version");
        }
    },

});

