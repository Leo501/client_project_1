// var item_test = '中#中#中#中#中#中#中#中#中#中#中#中#中#中#中#中#中#中#中#中#中#';
cc.Class({
    extends: cc.Component,

    properties: {
        // close_node: cc.Node,
        content_list: cc.Node,
        group: cc.Node, //活动列表
        item_list: cc.Node,
        content_infs: cc.Node, //内容框
        label_title_infs: cc.Label, //标题
        label_content_infs: cc.Label, //内容
        account_column: 0, //每列最少可以放几个字节（字节）27()
        spacing: 0, //间隔
        dispatch_node: cc.Node, //通讯节点
        _data: null, //服务端数据
        // _string_columns: 0,//
        max_default_column: 0, //默认最大列数
        height_default_content: 0, //content_infs默认最大长度
        height_column: 0, //单列长度
        btn_icon: cc.Node,
        _tip_data: null,
    },

    // use this for initialization
    init: function () {
        this.node.active = false;
        // this.removeAllChildren(this.group);
        console.log('length of content', this.countStringLength(this.label_content_infs.string));
        this.label_title_infs.string = '';
        this.label_content_infs.string = '';
        this.initItemList(this.group);
        // this.getData();
        var self = this;
        console.log('dispatch=', this.dispatch_node);
        this.dispatch_node.on('show_pape', function (data) {
            console.log('show_pape on ActivityManage.js', data.detail);
            if (data.detail === 1) {
                // self.node.active = true;
                self.getData();
            }
        })
    },

    //显示数据
    initData: function (data) {
        this.node.active = true;
        this.btn_icon.active = true;
        data.forEach(function (id, idx) {
            var node = this.group.children[idx];
            node.active = true;
        }.bind(this));
        let content = this.setContent(data[0].comment);
        this.setContentInfs(this.label_title_infs, data[0].title);
        this.setContentInfs(this.label_content_infs, content);
    },

    //隐藏Toggles
    initItemList: function (node) {
        // console.log('node', node);
        Array.isArray(node.children) && node.children.forEach(function (item, idx) {
            // console.log("item", item);
            var btn = cc.find('Background', item);
            btn.activity_idx = idx;
            item.active = false;
        }.bind(this));
    },

    //显示指定数据
    onClickItem: function (event) {
        var idx = event.target.activity_idx;
        this.setContentInfs(this.label_title_infs, this._data[idx].title);
        this.setContentInfs(this.label_content_infs, this.setContent(this._data[idx].comment));
    },

    //关闭页面
    onCloseNode: function (event) {
        this.node.active = false;
        this.dispatch_node.emit('close_pape', 2);
        cc.vv.audioMgr.playClick_buttomSFX(3);
    },
    onOpenNode: function (event) {
        cc.vv.audioMgr.playClick_buttomSFX(1);
        this.node.active = true;
        this.initItemList(this.group);
        let child = this.group.children[0];
        if (child !== null) { //设置第一个为选中状态
            child.getComponent(cc.Toggle).isChecked = true;
        }
        this.getData();

    },

    //设置内容
    setContentInfs: function (node, infs) {
        // console.log(infs);
        node.string = infs;
    },

    //计算内容需要的长度
    countLengthContentInfs: function (node, height, column) {
        node.height = column * (height) + this.spacing * 2;
    },

    //取得string长度。
    countStringLength: function (str) {
        var str_len = str.length;
        var str_length = 0;
        var a;
        for (var i = 0; i < str_len; i++) {
            a = str.charAt(i);
            str_length++;
            if (escape(a).length > 4) {
                //中文字符的长度经编码之后大于4
                str_length++;
            }
        }
        return str_length;
    },

    setData: function (data, isShowNext) {
        this._data = Array.isArray(data.data) ? data.data : null;
        if (this._data === null || this._data.length === 0) {
            this.btn_icon.active = false;
            //显示下一个页面。
            if (isShowNext) {
                this.dispatch_node.emit('close_pape', 2);
            }
            return;
        }
        this.initData(data.data);
    },

    //从服务器取得数据。
    getData: function () {
        const fn = function (data) {
            if (data.errcode === 0) {
                this._tip_data = data;
                console.log("data", data.data);
                this.setData(data, true);
            }
        };
        if (this._tip_data !== null) {
            // console.log('just show data');
            this.setData(this._tip_data, true);
            return;
        }
        cc.vv.http.sendRequest("/activity", {}, fn.bind(this));
    },

    //换行数据并计算长度
    setContent: function (str) {

        let strArr = [];
        strArr.push(str); /*.split('#');*/
        // console.log("strArr",strArr);
        let str_columns = 0;
        const allStr = strArr.reduce(function (str, item) {
            str_columns++;
            let column = parseInt(this.countStringLength(item) / this.account_column);
            // console.log(item, column);
            str_columns += column;
            return str + item /*+ '\n'*/ ;
        }.bind(this), '');
        // console.log('str_columns=', str_columns);
        //如果长度大于默认长度，重置长度。
        if (str_columns >= this.max_default_column) {
            this.countLengthContentInfs(this.content_infs, this.height_column, str_columns);
        } else {
            this.content_infs.height = this.height_default_content;
        }
        return allStr;
    },

    removeAllChildren: function (node) {
        node.removeAllChildren();
    }

});