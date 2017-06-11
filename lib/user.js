var constants = require('../json/constants.js');
var objClass = require('./obj');
var questManager = require('./questManager');
var g_combat;
var g_roomManager;

var User = function (socket) {
    var defaultRoomId = 'room_entry';
    this.obj =new objClass('player', defaultRoomId);
    this.obj.displayName = socket.request.session.passport.user.displayName;
    this.socket = socket;
    this.inputState = constants.INPUT_STATE_NORMAL;
    this.questManager = new questManager();

    socket.SendMsg(socket.request.session.passport.user.displayName + "님 안녕하세요.");
};

User.prototype.Getcursor = function () {
    return this.obj.Getcursor();
};

User.prototype.GetRoomId = function () {
    return this.obj.GetRoomId();
};

User.prototype.GetObj = function(){
    return this.obj;
};

User.prototype.GetInputState = function(){
    return this.inputState;
};

User.prototype.SetRoomId = function(roomId) {
    this.obj.roomId = roomId;
};

User.prototype.GetCursor = function(){
    return this.obj.GetCursor();
};

User.prototype.OnTrigger = function(event)
{
    switch(event)
    {
        case constants.ACTION_EVENT_ENTER_ROOM:
            g_questManager.OnTrigger(event);
            break;

        case constants.ACTION_EVENT_PICK_ITEM:
            break;
    }
};

module.exports = function (roomManager, combat) {
    g_roomManager = roomManager;
    g_combat = combat;
    return User;
};