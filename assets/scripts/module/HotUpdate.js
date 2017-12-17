var UpdatePanel = require('UpdatePanel');
var UpdatePackage = require("WebUtil");
var logUtilTmp = require("LogUtil");
var logUtil = logUtilTmp.getInstance();
var updatePackage = new UpdatePackage();
updatePackage.init();
cc.Class({
    extends: cc.Component,

    properties: {
        panel: UpdatePanel,
        manifestUrl: cc.RawAsset,
        updateUI: cc.Node,
        _updating: false,
        _canRetry: false,
        _isEnterUpdate: false,
        numb: 0,
    },

    checkCb: function (event) {
        cc.log('Code: ' + event.getEventCode());

        var isUpdate = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.panel.info.string = "No local manifest file found, hot update skipped.";
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.panel.info.string = "Fail to download manifest file, hot update skipped.";
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.panel.info.string = "Already up to date with the latest remote version.";
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                console.log(" ready update!");
                this.updateUI.active = true;
                isUpdate = true;
                this.panel.info.string = '有新版本，正在更新！';
                this.panel.checkBtn.active = false;
                this.panel.fileProgress.progress = 0;
                //显示出来
                this.panel.fileProgressNode.active=true;
                this._isEnterUpdate = true;
                this.setScheduler();
                break;
            default:
                return;
        }
        if (logUtil) {
            logUtil.printLog("hotupdate", null, "热更", this.panel.info.string);
        }
        if (!isUpdate) {
            this.node.emit("enter_login_push", true);
        }
        cc.eventManager.removeListener(this._checkListener);
        this._checkListener = null;
        this._updating = false;
    },

    updateCb: function (event) {
        this._isEnterUpdate = false;

        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                console.log("ERROR_NO_LOCAL_MANIFEST of hotUpdate.js");
                this.panel.info.string = 'No local manifest file found, hot update skipped.';
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                this.panel.byteProgress.progress = event.getPercent() / 100;
                this.panel.fileProgress.progress = event.getPercentByFile() / 100;

                var msg = event.getMessage();
                if (msg) {
                    this.panel.info.string = 'Updated file: ' + msg;
                    cc.log(event.getPercent().toFixed(2) + '% : ' + msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.panel.info.string = 'Fail to download manifest file, hot update skipped.';
                console.log("ERROR_DOWNLOAD_MANIFEST/ERROR_PARSE_MANIFEST of hotUpdate.js");
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log("ALREADY_UP_TO_DATE of of hotUpdate.js");
                this.panel.info.string = 'Already up to date with the latest remote version.';
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                console.log("UPDATE_FINISHED of of hotUpdate.js");
                this.panel.info.string = 'Update finished. ' + event.getMessage();
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                console.log("UPDATE_FAILED of of hotUpdate.js");
                this.panel.info.string = 'Update failed. ' + event.getMessage();
                // this.panel.retryBtn.active = true;
                this._updating = false;
                this._canRetry = true;
                failed = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                console.log("ERROR_UPDATING of hotUpdate.js");
                this.panel.info.string = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                //logUtil.printLog(this.panel.info.string, 1);
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.panel.info.string = event.getMessage();
                break;
            default:
                break;
        }

        if (failed) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            this._updating = false;
            this.panel.showTip();
            if (logUtil) {
                logUtil.printLog("hotupdate", null, "热更失败", this.panel.info.string);
            }
        }

        if (needRestart) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            // Prepend the manifest's search path
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            console.log('newPaths=' + newPaths, 'searchPaths' + searchPaths);
            Array.prototype.unshift(searchPaths, newPaths);
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            console.log('searchPaths=', searchPaths);
            jsb.fileUtils.setSearchPaths(searchPaths);
            cc.game.restart();
        }
    },

    //重新下载
    retry: function () {
        console.log("retry");
        var path = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'blackjack-remote-asset_temp');
        var path_1 = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'blackjack-remote-asset');
        var aa = jsb.fileUtils.removeDirectory(path);
        cc.game.restart();
    },

    //手动下载新包
    updatePackage_btn: function () {
        console.log("updatePackage.js");
        updatePackage.open();
    },

    loginScene: function () {
        cc.director.loadScene("login");
    },

    //进入旧版本
    enterOldVersion: function () {
        console.log("enterOldVersion");
        this.node.emit("enter_login_push", true);
    },

    checkUpdate: function () {
        console.log("checkUpdate()");
        if (this._updating) {
            this.panel.info.string = 'Checking or updating ...';
            return;
        }
        if (!this._am.getLocalManifest().isLoaded()) {
            this.panel.info.string = 'Failed to load local manifest ...';
            return;
        }
        this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
        cc.eventManager.addListener(this._checkListener, 1);

        this._am.checkUpdate();
        this._updating = true;
    },

    setScheduler: function () {
        console.log("enter scheduler");
        var scheduler = cc.director.getScheduler();
        scheduler.schedule(function (event) {
            if (this._isEnterUpdate) {
                this.hotUpdate();
            }
        }, this, 2, 2, 1, false);
    },

    hotUpdate: function () {
        console.log("enter hotUpdate");
        if (this._am && !this._updating) {
            this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
            cc.eventManager.addListener(this._updateListener, 1);

            this._failCount = 0;
            this._am.update();
            this.panel.updateBtn.active = false;
            this._updating = true;
        }

    },

    show: function () {
        if (this.updateUI.active === false) {
            this.updateUI.active = true;
        }
    },

    // use this for initialization
    onLoad: function () {
        console.log('onload of HotUpdate.js');
        if (logUtil) {
            logUtil.printLog("onLoad", null, "热更加载", "string .....");
        }
        this.init();
        if (!cc.sys.isNative) {
            return;
        }
        var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'blackjack-remote-asset');

        this._am = new jsb.AssetsManager(this.manifestUrl, storagePath);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.retain();
        }
        //版本对比函数
        this._am.setVersionCompareHandle(function (versionA, versionB) {
            cc.LAST_VERSION = "" + versionA;
            cc.REMOTE_VERSION = "" + versionB;
            cc.log("JS Custom Version Compare: local(本地) version A is " + versionA + ',remote(远程) version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                } else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            } else {
                return 0;
            }
        });

        var panel = this.panel;
        this.panel.initTip();
        this._am.setVerifyCallback(function (path, asset) {
            var compressed = asset.compressed;
            var expectedMD5 = asset.md5;
            var relativePath = asset.path;
            var size = asset.size;
            if (compressed) {
                panel.info.string = "Verification passed : " + relativePath;
                return true;
            } else {
                panel.info.string = "Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        });

        this.panel.info.string = 'Hot update is ready, please check or directly update.';

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this._am.setMaxConcurrentTask(2);
            this.panel.info.string = "Max concurrent tasks count have been limited to 2";
        }

        this.panel.fileProgress.progress = 0;
        this.panel.byteProgress.progress = 0;
        this.checkUpdate();
    },

    init: function () {
        var self = this;
        if (cc.sys.os === cc.sys.OS_ANDROID || cc.sys.os === cc.sys.OS_IOS) {} else {
            this.updateUI.active = false;
        }

        this.node.on("init_login_push", function (date) {});

        cc.HUHandler = this.node;
    },
    update: function (dt) {},

    onDestroy: function () {
        if (this._updateListener) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.release();
        }
    }
});