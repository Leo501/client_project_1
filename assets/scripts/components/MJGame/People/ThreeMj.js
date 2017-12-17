cc.Class({
    extends: cc.Component,

    properties: {
        rootNode:{
            default:[],
            type:[cc.Node],
        },
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv.setPeople.isThreeMJ()&&this.rootNode) {
            this.rootNode.forEach((e)=>{
                // console.log("e=",e);
                e.active=false});
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.rootNode.active&&cc.vv.setPeople.isThreeMJ()&&this.rootNode) {
            this.rootNode.forEach((e)=>{
                // console.log("e=",e);
                e.active=false});
        }
    },
});
