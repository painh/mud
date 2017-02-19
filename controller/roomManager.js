var maps = require('../json/zones/zone_0');
var objClass = require('./obj');
var g_makeTexts;
var g_utils;
var g_io;

var Room = function (protoData) {
    this.protoData = protoData;
    this.roomId = protoData.protoId;
    this.objects = [];
    this.removedList = [];

    for (var i in protoData['proto_objects']) {
        var protoId = protoData['proto_objects'][i]['protoId'];
        this.Spawn(protoId);
    }
};

Room.prototype.Spawn = function (protoId) {
    var obj = new objClass(protoId, this.roomId);
    this.objects.push(obj);

    this.SendMsg(g_makeTexts.Spawn(obj));
    return obj;
};

Room.prototype.GetObjByName = function (displayName) {
    for (var i in this.objects) {
        var obj = this.objects[i];
        if (displayName == obj.displayName)
            return obj;
    }

    return false;
};

Room.prototype.Join = function (socket) {
    socket.join('room' + this.roomId);
    socket.user.SetRoomId(this.roomId);
    socket.SendMsg(g_makeTexts.MakeRoomPacket(this, socket), true);

    this.objects.push(socket.obj);
};

Room.prototype.RemoveFromList = function (obj) {
    g_utils.RemoveFromList(this.objects, obj);


    var now = g_utils.NowSec();

    if (!(obj.protoId in this.protoData.proto_objects)) {
        return;
    }

    this.removedList.push({
        protoId: obj.protoId,
        removedTS: now
    });
};

Room.prototype.Leave = function (socket) {
    this.RemoveFromList(socket.user.GetObj());

    socket.leave('room' + this.roomId);
};

Room.prototype.SendMsg = function (msg) {
    g_io.sockets.in('room' + this.roomId).emit('send:message', msg);
};

Room.prototype.SendChat = function (obj, msg) {
    this.SendMsg(g_makeTexts.Talk(obj.displayName, msg));
};

Room.prototype.Update = function () {
    return false;
};

Room.prototype.UpdateDone = function (now) {
    var removeList = [];

    for (var obj of this.removedList) {
        //        console.log(obj);
        //        console.log(this.protoData.proto_objects);
        if (now - obj.removedTS > this.protoData.proto_objects[obj.protoId].respawnSec) {
            this.Spawn(obj.protoId);
            removeList.push(obj);
        }
    }

    for (var obj of removeList)
        g_utils.RemoveFromList(this.removedList, obj);

    return this.removedList.length == 0;
};

var RoomManager = function () {
    this.list = {};
    for (var i in maps) {
        this.list[maps[i].protoId] = new Room(maps[i]);
    }

    this.updateList = [];
};

RoomManager.prototype.GetById = function (roomId) {
    if (!this.list[roomId])
        return false;

    return this.list[roomId];
};

RoomManager.prototype.Join = function (roomId, socket) {
    var prevRoomId = socket.user.GetRoomId();
    this.Leave(prevRoomId, socket);

    var room = this.GetById(roomId);
    if (!room)
        return;

    room.Join(socket);
};

RoomManager.prototype.Leave = function (roomId, socket) {
    var room = this.GetById(roomId);
    if (!room)
        return;

    room.Leave(socket);
};

RoomManager.prototype.SendMsgToRoom = function (roomId, msg) {
    var room = this.GetById(roomId);
    if (!room)
        return;

    room.SendMsg(msg);
};

RoomManager.prototype.OnObjDead = function (obj) {
    var room = this.GetById(obj.roomId);
    if (!room)
        return;

    room.RemoveFromList(obj);
    g_utils.ArraySet(this.updateList, room);
};

RoomManager.prototype.worldTicker = function () {
    var removeList = [];
    var now = g_utils.NowSec();

    for (var room of this.updateList) {
        room.Update(now);
        if (room.UpdateDone(now))
            removeList.push(room);
    }

    for (room of removeList)
        g_utils.RemoveFromList(this.updateList, room);
};

module.exports = function (makeTexts, utils, io) {
    g_makeTexts = makeTexts;
    g_utils = utils;
    g_io = io;
    return new RoomManager();
};
