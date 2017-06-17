var scripts = require('../json/script/script_0');
var scripts = require('../json/script/script_0');
var g_scriptManager = null;
var g_makeTexts = null;

var ScriptManager = function () {
    this.list = {};
    for (let i in scripts) {
        const script = scripts[i];
        if (i != script.protoId)
            console.error("protoId[" + i + "] not match[" + script.protoId + "]");
        script.script = g_makeTexts.ReplaceNLToBr(g_makeTexts.ReplaceKeyword(script.script + "\n"));
        this.list[script.protoId] = script;
    }
};

ScriptManager.prototype.GetTalkScript = function (scriptId) {
    if (!(scriptId in this.list)) {
        return false;
    }

    return this.list[scriptId];
};

module.exports = function (makeTexts) {
    g_makeTexts = makeTexts;

    if (g_scriptManager == null)
        g_scriptManager = new ScriptManager();

    return g_scriptManager;
};