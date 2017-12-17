/**
 * cocos creator 定时类
 * time单位为秒
 * 不建议使用，请用js自带setTimeout与setInterval代替
 */
var check = cc.Class({
    extends: cc.Component,
    statics: {
        // _version:VERSION,
        timeoutOne: function (callback, target, time) {

            var scheduler = cc.director.getScheduler();
            scheduler.schedule(callback, target, 0, 0, time, false);

        },
        timeoutRepeat: function (callback, target, interval, repeat, delay) {
            var scheduler = cc.director.getScheduler();
            scheduler.schedule(callback, target, interval, repeat, delay, false);
        },
        timeoutRepeatAndpause: function (callback, target, interval, paused) {
            var scheduler = cc.director.getScheduler();
            scheduler.schedule(callback, target, interval, repeat, delay, false);
        },
        unschedule: function (callback, target) {
            var scheduler = cc.director.getScheduler();
            scheduler.unschedule(callback, target);

        }
    },

});