 /**
  * 定位实现接口类
    cc.vv.location来使用
  */
 var location = cc.Class({
     extends: cc.Component,

     statics: {
         latitude: null,
         longitude: null,

         iosAPI: null,
         androidAPI: null,
         otherUserDistance: null,
         eventHandler: null,

         init: function () {
             console.log("Location init");
             this.latitude = 0;
             this.longitude = 0;
             this.iosAPI = "AppController";
             this.androidAPI = "com/ypgames/zymj/utils/Location";
             this.androidRegister = "org/cocos2dx/javascript/AppActivity";
             //监听socket事件
             this.addHandleEvent();
             // var aa=Math.random()*10; 
             // this.latitude=22+aa;
             // this.longitude=113;
         },

         setEventHandler: function (node) {
             console.log("setEvnetHandler");
             this.eventHandler = node;
         },

         dispatchEvent: function (event, data) {
             if (this.eventHandler) {
                 this.eventHandler.emit(event, data);
             } else {
                 console.log("dispatchEvent");
                 if (cc.vv.gameNetMgr.dataEventHandler != null) {
                     this.eventHandler = cc.vv.gameNetMgr.dataEventHandler;
                     this.eventHandler.emit(event, data);
                 } else {
                     console.log("can't send mgr");
                 }
             }
         },

         convertData: function (value) {
             return parseFloat(value);
         },

         convertToKmOrM: function (data) {
             var distance = parseInt(data);
             //km
             if (distance > 0) {
                 var numb = distance.toFixed(2);
                 console.log("numb=" + numb);
                 return "" + numb + "km";
             }
             data *= 1000;
             console.log("numb=" + data);
             data = data.toFixed(2);
             return "" + data + "m";
         },

         /**原生平台回调函数 
          * 取得本机位置 */
         setLocation: function (locStr) {
             console.log("setLocation of locStr=" + locStr);
             var arr = locStr.split("_");
             this.latitude = this.convertData(arr[0]);
             this.longitude = this.convertData(arr[1]);
             console.log("lat=" + this.latitude + " lnt=" + this.longitude);
             this.updateLatAndLng();
         },

         /**上传位置给服务器 */
         updateLatAndLng: function () {
             var account = cc.sys.localStorage.getItem("wx_account");
             var sign = cc.sys.localStorage.getItem("wx_sign");
             console.log('account=' + account, 'sign=' + sign);
             if (cc.sys.isBrowser) {
                 account = cc.sys.localStorage.getItem("account");
                 sign = cc.sys.localStorage.getItem("sign");
                 console.log("browser_account=" + account, " si=" + sign);
             }
             var posi = {
                 account: account,
                 sign: sign,
                 lat: this.latitude,
                 lng: this.longitude,
             };
             console.log("posi=", posi);
             cc.vv.http.sendRequest("/upload_user_position", posi, function (data) {
                 console.log(data);
                 console.log("upload_user_position ok");
             });
         },

         sayHi: function () {
             console.log("sayHi");
         },

         /** 调用原生的函数
          * 通过setLocation
          * 返回位置 */
         updateLocation: function () {
             //要查看下account and sign 是否有值
             if (cc.sys.os == cc.sys.OS_ANDROID) {
                 jsb.reflection.callStaticMethod(this.androidAPI, "getLocation", "()V");
                 return;
             }

             if (cc.sys.os == cc.sys.OS_IOS) {
                 var isOK = jsb.reflection.callStaticMethod(this.iosAPI, "getLocation");
                 return;
             }
             if (cc.sys.isBrowser) {
                 this.updateLatAndLng();
             }
         },

         /** 获取userid跟本家的距离 */
         acquireDistance: function (userId) {
             console.log("acquireDistance");
             var userIdArr = [];
             var arr = cc.vv.gameNetMgr.seats;
             // var selfId=arr[cc.vv.gameNetMgr.seatIndex].userid;
             // console.log(arr);
             // userIdArr.push(selfId);
             // //本家不发
             // if(selfId!=userId) {
             //     userIdArr.push(userId);
             // }
             var idx = cc.vv.gameNetMgr.getSeatIndexByID(userId);
             var length = cc.vv.setPeople.getMen();
             for (var i = 0; i < length; i++) {
                 var seat = arr[idx % length];
                 // console.log("seat=",seat);
                 // console.log("seat.userId=",seat.userid);
                 idx++;
                 if (!seat) {
                     continue;
                 }
                 if (seat.userid == 0) {
                     continue;
                 }
                 userIdArr.push(parseInt(seat.userid));
             }
             console.log(userIdArr);
             //添加mjgame节点分发消息
             this.setEventHandler(cc.vv.gameNetMgr.dataEventHandler);
             cc.vv.net.send("user_distance", userIdArr);
         },

         /** 添加socket监听事件 */
         addHandleEvent: function () {
             var self = this;
             console.log("addHandleEvent");
             cc.vv.net.addHandler("user_distance_push", function (data) {
                 console.log("user_distance_push");
                 console.log(data);
                 var distcArr = data.distance;
                 self.otherUserDistance = distcArr;
                 self.dispatchEvent("user_distance", data);
             });
         },


     }
 });