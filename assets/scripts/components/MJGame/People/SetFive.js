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
        rootNode: cc.Node,
    },

    onLoad: function () {
        if (cc.vv.setPeople.isFive() && this.rootNode) {
            this.rootNode.active = false;
            // this.rootNode.forEach((e) => {
            //     // console.log("e=",e);
            //     e.active = false
            // });
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.rootNode.active && cc.vv.setPeople.isFive() && this.rootNode) {
            this.rootNode.active = false;
            // this.rootNode.forEach((e) => {
            //     // console.log("e=",e);
            //     e.active = false
            // });
        }
    },
});
