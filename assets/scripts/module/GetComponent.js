var CCComponent = cc.Class({
    extends: cc.Component,

    statics: {
        //取得Label组件
        setLabel: function (node, string) {
            let label = node.getComponent(cc.Label);
            if (!label) { //如果为空就是新建一个加进去，
                label = cc.instantiate(cc.Label);
                label.string = string;
                node.addChild(label);
            } else {
                label.string = string;
            }
            return label
        },

        findNode: function (name, root) {
            let node = null;
            if (root) {
                node = cc.find(name, root);
            } else {
                node = cc.find(name);
            }
            return node;

        },

        //取得脚本
        getScript: function (node, name) {
            let script = node.getComponent(name);
            if (!script) {
                console.log('script is not exist');
                script.aaaa();
            }
            return script;
        }
    }

});