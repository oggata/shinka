var Storage = cc.Class.extend(
{
    ctor : function () 
    {
        this.creatureData = new Object();
        this.playerName = "xxxxx";
        this.totalGameScore = 0;
        this.totalCoinAmount = 0;
        this.maxGameScore = 0;
        this.bgmVolume = 10;
        this.seVolume = 10;
        this.lastUpdatedTime = parseInt( new Date() /1000 );
    },

    init : function () { },

    createCreatureDataToStorage : function()
    {

    },

    saveCreatureDataToStorage : function(enemy) 
    {
        //すでにある場合は、設定値の変更
        var savedData = this.creatureData;
        var _updateCnt = 0;
        for (var savedDataKey in savedData) {
            if (savedData.hasOwnProperty(savedDataKey)) {
                var savedDataValue = savedData[savedDataKey];
                var inputCreatureId= "ID_" + enemy.id;
                if(savedDataKey == inputCreatureId)
                {
                    //cc.log("update data.");
                    //_lastUpdatedTime = parseInt( new Date() /1000 );
                    //var _amount = savedDataObj['amount'] + amount;
                    //if(savedDataValue == NaN) return;
                    cc.log(savedDataValue);
                    var savedDataObj = JSON.parse(savedDataValue);
                    var _txt = 
                        '{"id":' + Math.floor(enemy.id) + 
                        ',"creatureId":' + Math.floor(enemy.creatureId) + 
                        ',"status":"' + enemy.status + '"'+ 
                        ',"age":' + Math.floor(enemy.age) + 
                        ',"foodCnt":' + Math.floor(enemy.foodCnt) + 
                        ',"generation":' + Math.floor(enemy.generation) + 
                        ',"x":' + Math.floor(enemy.getPosition().x) + 
                        ',"y":' + Math.floor(enemy.getPosition().y) + 
                        ',"statusHash":"' + enemy.statusHash + '"' + 
                        ',"deadTime":' + Math.floor(enemy.deadTime) + 
                        ',"targetTime":' + Math.floor(enemy.targetTime) + 
                        ',"lastUpdatedTime":' + Math.floor(enemy.lastUpdatedTime) + 
                        '}'
                    ;
                    this.creatureData["ID_" + enemy.id] = _txt;
                    _updateCnt+=1;
                }
            }
        }

        if(_updateCnt == 0)
        {
            cc.log("insert data.");
            enemy.id = this.getRandNumberFromRange(1,9999999999);
            var _txt = 
                '{"id":' + Math.floor(enemy.id) + 
                ',"creatureId":' + Math.floor(enemy.creatureId) + 
                ',"status":"' + enemy.status + '"'+ 
                ',"age":' + Math.floor(enemy.age) + 
                ',"foodCnt":' + Math.floor(enemy.foodCnt) + 
                ',"generation":' + Math.floor(enemy.generation) + 
                ',"x":' + Math.floor(enemy.getPosition().x) + 
                ',"y":' + Math.floor(enemy.getPosition().y) + 
                ',"statusHash":"' + enemy.statusHash + '"'+ 
                ',"deadTime":' + Math.floor(enemy.deadTime) + 
                ',"targetTime":' + Math.floor(enemy.targetTime) + 
                ',"lastUpdatedTime":' + Math.floor(enemy.lastUpdatedTime) + 
                '}'
            ;
            this.creatureData["ID_" + enemy.id] = _txt;
        }

        var _getData = this.getDataFromStorage();
        cc.sys.localStorage.setItem("gameStorage",_getData);
        //cc.log(_getData);
    },

    getRandNumberFromRange: function(min, max) {
        var rand = min + Math.floor(Math.random() * (max - min));
        return rand;
    },

    getPastSecond : function() {
        var diffSecond = parseInt( new Date() / 1000 ) - this.lastUpdatedTime;
        //cc.log(diffSecond);
        return diffSecond;
    },

    saveCurrentData : function()
    {
        var _getData = this.getDataFromStorage();
        cc.sys.localStorage.setItem("gameStorage",_getData);
    },

    saveLastUpdateTime : function()
    {
        this.lastUpdatedTime = parseInt( new Date() /1000 );
        var _getData = this.getDataFromStorage();
        cc.sys.localStorage.setItem("gameStorage",_getData);
    },

    getDataFromStorage : function ()
    {
        var _creatureData = '';
        var stData = this.creatureData;
        var keyCnt = Object.keys(stData).length;
        var incKeyCnt = 1;
        for (var key in stData) {
            if (stData.hasOwnProperty(key)) {
                var value = stData[key];
                _creatureData += '"' + key + '":' + JSON.stringify(value);
                if(incKeyCnt != keyCnt)
                {
                    _creatureData += ',';
                }
                incKeyCnt++;
            }
        }

        //return '{"saveData" : true, "creatureData":{"111":{"id":1,"score":123},"222":{"id":1,"score":123},"333":{"id":1,"score":123}}}';
        var rtn = '{';
        rtn += '"saveData" : true,';
        rtn += '"creatureData":{' + _creatureData + '},';
        rtn += '"playerName" :"' + this.playerName + '",';
        rtn += '"totalGameScore" :' + this.totalGameScore + ',';
        rtn += '"maxGameScore" :' + this.maxGameScore + ',';
        rtn += '"bgmVolume" :' + this.bgmVolume + ',';
        rtn += '"seVolume" :' + this.seVolume + ',';
        rtn += '"totalCoinAmount" :' + this.totalCoinAmount + ',';
        rtn += '"lastUpdatedTime" :' + this.lastUpdatedTime + '';
        rtn += '}';
        /*
        cc.log("------------------------>");
        cc.log(rtn);
        cc.log('{"saveData" : true, "creatureData":{"111":{"id":1,"score":123},"222":{"id":1,"score":123},"333":{"id":1,"score":123}}}');
        cc.log("------------------------>");
        */
        return rtn;
    },

    setDataToStorage : function (getData)
    {
        this.creatureData = new Object();
        var stData = getData['creatureData'];
        for (var key in stData) {
            if (stData.hasOwnProperty(key)) {
                var value = stData[key];
                this.creatureData[key] = value;
            }
        }
        this.playerName       = getData["playerName"];
        this.totalGameScore   = getData["totalGameScore"];
        this.totalCoinAmount  = getData["totalCoinAmount"];
        this.maxGameScore     = getData["maxGameScore"];
        this.bgmVolume        = getData["bgmVolume"];
        this.seVolume         = getData["seVolume"];
        this.lastUpdatedTime  = getData["lastUpdatedTime"];
    },

    initSDK : function() 
    {
        if ("undefined" == typeof(sdkbox)) {
            console.log("sdkbox is not exist")
            return
        }

        if ("undefined" != typeof(sdkbox.PluginShare)) {
            var plugin = sdkbox.PluginShare
            plugin.setListener({
              onShareState: function(response) {
                console.log("PluginShare onSharestate:" + response.state + " error:" + response.error)
                if (response.state == sdkbox.PluginShare.ShareState.ShareStateSuccess) {
                    console.log("post success")
                }
            }
            })
            plugin.init()
            //plugin.logout()
            console.log('Share plugin initialized')
        } else {
            console.log("no plugin init")
        }
    },

    invokeSDK : function() 
    {
        if ("undefined" == typeof(sdkbox)) {
            console.log("sdkbox is not exist")
            return
        }

        if ("undefined" != typeof(sdkbox.PluginShare)) {
            console.log('share post')
            var plugin = sdkbox.PluginShare
            plugin.share( {text : "iPhoneアプリ『ネコダン』でにゃんこ大量発生注意報！! https://itunes.apple.com/us/app/id1058265886"} );
        } else {
            console.log("no plugin invoked")
        }
    },

    invokeSDK2 : function() 
    {
        if ("undefined" == typeof(sdkbox)) {
            console.log("sdkbox is not exist")
            return
        }

        if ("undefined" != typeof(sdkbox.PluginShare)) {
            console.log('share post')
            var plugin = sdkbox.PluginShare;
            if(this.totalGameScore == 0)
            {
                plugin.share( {text : "iPhoneアプリ『ネコダン』を始めたニャ！! https://itunes.apple.com/us/app/id1084127955"} );
            }else{
                plugin.share( {text : "iPhoneアプリ『ネコダン』で" + this.totalGameScore + "匹集めたニャ！! https://itunes.apple.com/us/app/id1084127955"} );
            }
        } else {
            console.log("no plugin invoked")
        }
    }
});

var saveData = function (storage)
{
    //3:android 4:iphone 5:ipad 100:mobile_web 101:pc_web
    var platform = cc.Application.getInstance().getTargetPlatform();
    this.storage = new Storage();
    if (platform == 100 || platform == 101)
    {
        var toObjString = storage.getJson();
        var toObj = JSON.parse(toObjString);
        window.localStorage.setItem("gameStorage", JSON.stringify(toObj));
    }
};

var changeLoadingImage = function ()
{
    //3:android 4:iphone 5:ipad 100:mobile_web 101:pc_web
    var platform = cc.Application.getInstance().getTargetPlatform();
    if (platform == 100 || platform == 101)
    {
        //ローディング画像を変更
        var loaderScene = new cc.LoaderScene();
        loaderScene.init();
        loaderScene._logoTexture.src = "res/loading.png";
        loaderScene._logoTexture.width = 104;
        loaderScene._logoTexture.height = 215;
        cc.LoaderScene._instance = loaderScene;
    }
};