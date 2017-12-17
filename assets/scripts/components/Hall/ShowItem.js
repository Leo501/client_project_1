var showItem=cc.Class({
    extends: cc.Component,
    statics:{
        getItemObject:function() {
            return {
                account:0,
                time:'',
            };
        },
        getToday:function() {
            var now=new Date(Date.now());
            var month=now.getMonth()+1;
            var today=''+month+':'+now.getDate();
            return today;
        },
        getItemFromDB:function(name) {
            var data=cc.sys.localStorage.getItem(name);
            // console.log("aaaaaaaaaaaaaa");
            // console.log(data);
            if(data==null||typeof(data)==='undefined'||data=='undefined'||data=='null') {
                console.log("create object");
                data=this.getItemObject();
                data=JSON.stringify(data);
            }
            var item=JSON.parse(data);
            return item;
        },
        setItemFromDB:function(name,data) {
            if(data==null||typeof(data)==='undefined'||data=='undefined'||data=='null') {
                data=this.getItemObject();
            }
            cc.sys.localStorage.setItem(name, JSON.stringify(data));
        },
        isShowItem:function(name) {
            var isShow=false;
            var today=this.getToday();
            var item=this.getItemFromDB(name);
            if(item.account==0&&item.time!=today) {
                isShow=true;
            }
            item.account++;
            this.setItemFromDB(name,item);
            return isShow;
        },
        resetAccountFromItem:function(name) {
            var item=this.getItemFromDB(name);
            item.account=0;
            // console.log(item);
            this.setItemFromDB(name,item);
        },
        setTimeFromItem:function(name) {
            var item=this.getItemFromDB(name);
            var today=this.getToday();
            item.time=today;
            this.setItemFromDB(name,item);
        },
    }
});
