let constants = require('../json/constants.js');
let objClass = require('./obj');
let questManager = require('./questManager');
let g_combat;
let g_roomManager;

let User = function (socket) {
    let defaultRoomId = 'room_entry';
    this.obj = new objClass('player', defaultRoomId);
    this.obj.displayName = socket.request.session.passport.user.displayName;
    this.socket = socket;
    this.inputState = constants.INPUT_STATE_NORMAL;
    this.questManager = new questManager();
    this.lastScript = null;
    this.lastTalkObj = null;

    socket.SendMsg(socket.request.session.passport.user.displayName + "님 안녕하세요.");
};

User.prototype.Getcursor = function () {
    return this.obj.Getcursor();
};

User.prototype.GetRoomId = function () {
    return this.obj.GetRoomId();
};

User.prototype.GetObj = function () {
    return this.obj;
};

User.prototype.GetInputState = function () {
    return this.inputState;
};

User.prototype.SetRoomId = function (roomId) {
    this.obj.roomId = roomId;
};

User.prototype.GetCursor = function () {
    return this.obj.GetCursor();
};

User.prototype.OnTrigger = function (event) {
    switch (event) {
        case constants.ACTION_EVENT_ENTER_ROOM:
            g_questManager.OnTrigger(event);
            break;

        case constants.ACTION_EVENT_PICK_ITEM:
            break;
    }
};

User.prototype.ProcessTalk = function (roomObj) {
    if (!('scriptProtoId' in roomObj)) {
        return false;
    }

    const script = g_scriptManager.GetTalkScript(roomObj.scriptProtoId);
    if (script === false)
        return false;

    this.lastTalkObj = roomObj;

    return this.RunTalkScript(script);
};

User.prototype.RunTalkScript = function (script) {
    this.socket.SendMsg(script.script, true);

    this.lastScript = script;

    return true;
};

User.prototype.CheckTalkScriptKeyword = function (room, userInputKeyword) {
    if (this.lastTalkObj == null)
        return false;

    if (!('keyword' in this.lastScript))
        return false;

    let obj = room.GetObjByProtoId(this.lastTalkObj.protoId);
    if (obj === false)
        return false;

    console.log(obj);
    console.log(this.lastScript);

    for (var i in this.lastScript.keyword) {
        const keyword = this.lastScript.keyword[i];

        if (keyword.keyword == userInputKeyword) {
            const script = g_scriptManager.GetTalkScript(keyword.scriptProtoId);
            if (script === false)
                return false;

            return this.RunTalkScript(script);
        }
    }

    return false;
};

module.exports = function (roomManager, combat, scriptManager) {
    g_roomManager = roomManager;
    g_combat = combat;
    g_scriptManager = scriptManager;
    return User;
};