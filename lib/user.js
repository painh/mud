var constants = require('../json/constants.js');
var objClass = require('./obj');
var g_combat;
var g_roomManager;

var User = function (socket) {
    var defaultRoomId = 'entry';
    this.obj =new objClass('player', defaultRoomId);
    this.obj.displayName = socket.request.session.passport.user.displayName;
    this.socket = socket;
    this.inputState = constants.INPUT_STATE_NORMAL;

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


module.exports = function (roomManager, combat) {
    g_roomManager = roomManager;
    g_combat = combat;
    return User;
};