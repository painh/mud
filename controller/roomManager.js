var maps = require('../json/map');
var objClass = require('./obj');
var g_makeTexts;
var g_utils;
var g_io;

var Room = function(protoData) {
    this.protoData = protoData;
    this.roomId = protoData.protoId;
    this.objects = [];
    for (var i in protoData['proto_objects']) {
        var protoId = protoData['proto_objects'][i]['protoId'];
        var obj = new objClass(protoId, this.roomId);
        this.objects.push(obj);
    }
}

Room.prototype.GetObjByName = function(displayName) {
    for (var i in this.objects) {
        var obj = this.objects[i];
        if (displayName == obj.displayName)
            return obj;
    }

    return false;
}

Room.prototype.Join = function(socket) {

    socket.join('room' + this.roomId);
    socket.obj.roomId = this.roomId;
    socket.sendMsg(g_makeTexts.MakeRoomPacket(this, socket));

    this.objects.push(socket.obj);
}

Room.prototype.RemoveFromList = function(obj) {
    g_utils.RemoveFromList(this.objects, obj);
}

Room.prototype.Leave = function(socket) {
    this.RemoveFromList(socket.obj);

    socket.leave('room' + this.roomId);
}

Room.prototype.SendMsg = function(msg) {
    g_io.sockets.in('room' + this.roomId).emit('send:message', msg);
}

Room.prototype.SendChat = function(obj, msg) {
    this.SendMsg(g_makeTexts.Talk(obj.displayName, msg));
}

var RoomManager = function() {
    this.list = {};
    for (var i in maps) {
        this.list[maps[i].protoId] = new Room(maps[i]);
    }
}

RoomManager.prototype.GetById = function(roomId) {
    if (!this.list[roomId])
        return false;

    return this.list[roomId];
}

RoomManager.prototype.Join = function(roomId, socket) {
    var prevRoomId = socket.obj.roomId;
    this.Leave(prevRoomId, socket);

    var room = this.GetById(roomId);
    if (!room)
        return;

    room.Join(socket);
}

RoomManager.prototype.Leave = function(roomId, socket) {
    var room = this.GetById(roomId);
    if (!room)
        return;

    room.Leave(socket);
}

RoomManager.prototype.sendMsgToRoom = function(roomId, msg) {
    var room = this.GetById(roomId);
    if (!room)
        return;

    room.SendMsg(msg);
}

RoomManager.prototype.OnObjDead = function(obj) {
    var room = this.GetById(obj.roomId);
    if (!room)
        return;

    room.RemoveFromList(obj);
}

module.exports = function(makeTexts, utils, io) {
    g_makeTexts = makeTexts;
    g_utils = utils;
    g_io = io;
    return new RoomManager();
};
