/**
 * 用于代码添加button的点击事件
 * cc.vv.utils使用
 */
cc.Class({
    extends: cc.Component,

    properties: {},

    addClickEvent: function (node, target, component, handler, number) {
        // console.log(component + ":" + handler);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
        if (number) {
            node.on(cc.Node.EventType.TOUCH_START, function (event) {
                cc.vv.audioMgr.playClick_buttomSFX(number);
            });
        }
    },


    addSlideEvent: function (node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
    },

    addCheckGroupEvent: function (node, target, component, handler, number) {
        // console.log(component + ":" + handler);
        node.children.forEach((childNode) => {
            var eventHandler = new cc.Component.EventHandler();
            eventHandler.target = target;
            eventHandler.component = component;
            eventHandler.handler = handler;

            var checkEvents = childNode.getComponent(cc.Toggle).checkEvents;
            checkEvents.push(eventHandler);
            if (number) {
                node.on(cc.Node.EventType.TOUCH_START, function (event) {
                    cc.vv.audioMgr.playClick_buttomSFX(number);
                });
            }
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});