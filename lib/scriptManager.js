var scripts = require('../json/script/script_0');
var scripts = require('../json/script/script_0');
var g_scriptManager = null;
var g_makeTexts = null;

var ScriptManager = function () {
    this.list = {};
    for (var i in scripts) {
        var script = scripts[i];
        if (i != script.protoId)
            console.error("protoId[" + i + "] not match[" + script.protoId + "]");
        console.log(script.script);
        script.script = g_makeTexts.ReplaceNLToBr(g_makeTexts.ReplaceKeyword(script.script + "\n"));
        this.list[script.protoId] = script;
    }
};

ScriptManager.prototype.RoomObjectTalk = function (socket, userObj, roomObj) {
    if (!('script' in roomObj)) {
        return false;
    }

    if (!(roomObj.script in this.list)) {
        return false;
    }

    var script = this.list[roomObj.script];
    socket.SendMsg(script.script, true);
};

module.exports = function (makeTexts) {
    g_makeTexts = makeTexts;

    if (g_scriptManager == null)
        g_scriptManager = new ScriptManager();

    return g_scriptManager;
};