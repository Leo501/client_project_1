cc.Class({
    extends: cc.Component,
    properties: {},

    // use this for initialization
    loadString: function (url, fn) {
        cc.loader.loadRes(url, (err, str) => {
            if (err) {
                fn('');
                return;
            }
            fn(str);
        });
    },

});