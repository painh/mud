var maps = require('../json/zones/zone_0');
var quests = require('../json/quest/quest_0');
var items = require('../json/proto_item');
var constants = require('../json/constants.js');
var objClass = require('./obj');
var g_makeTexts;
var g_utils;
var g_io;

var Room = function (protoData) {
    this.protoData = protoData;
    this.roomId = protoData.protoId;
    this.objects = [];
    this.items = [];
    this.removedList = [];
    this.playerCnt = 0;

    let i;
    for (i in protoData['proto_objects']) {
        let protoId = protoData['proto_objects'][i]['protoId'];
        this.Spawn(protoId);
    }

    let startTime = g_utils.NowSec();

    if (this.protoData.items) {
        for (i in this.protoData.items) {
            this.items[i] = g_utils.Clone(this.protoData.items[i]);
            var item = this.items[i];
            item.startTime = startTime;
            item.state = constants.ROOM_ITEM_STATE_NOT_YET_GEN;
            item.proto = items[item.id];
            item.inListId = i;
        }
    }
};

Room.prototype.RefreshExits = function () {
    let list = [];
    for (i in  this.protoData.exits) {
        let exit = this.protoData.exits[i];
        if (exit.visible == false)
            continue;

        list.push(exit.key);
    }

    this.exitDesc = '[' + list.join(',') + ']<br/>';
};

Room.prototype.Spawn = function (protoId) {
    let obj = new objClass(protoId, this.roomId);
    this.objects.push(obj);

    this.SendMsg(g_makeTexts.Spawn(obj));
    return obj;
};

Room.prototype.GetObjByProtoId = function (protoId) {
    for (let i in this.objects) {
        let obj = this.objects[i];
        if (protoId == obj.protoId)
            return obj;
    }

    return false;
};

Room.prototype.GetObjByName = function (displayName) {
    for (let i in this.objects) {
        let obj = this.objects[i];
        if (displayName == obj.displayName)
            return obj;
    }

    return false;
};

Room.prototype.GetItemByName = function (displayName) {
    for (let i in this.items) {
        let item = this.items[i];
        if (displayName == item.proto.displayName)
            return item;
    }

    return false;
};

Room.prototype.Join = function (socket) {
    socket.join('room' + this.roomId);
    socket.user.SetRoomId(this.roomId);
    socket.SendMsg(g_makeTexts.MakeRoomPacket(this, socket), true);

    this.objects.push(socket.user.GetObj());
    this.playerCnt++;
};

Room.prototype.RemoveFromObjList = function (obj) {
    if (!g_utils.RemoveFromList(this.objects, obj))
        return false;

    let now = g_utils.NowSec();

    if (!(obj.protoId in this.protoData.proto_objects)) {
        return;
    }

    this.removedList.push({
        protoId: obj.protoId,
        removedTS: now
    });
};

Room.prototype.RemoveFromItemList = function (item) {
    this.items[item.inListId].state = constants.ROOM_ITEM_STATE_NOT_YET_GEN;
    this.items[item.inListId].startTime = g_utils.NowSec();
};

Room.prototype.Leave = function (socket) {
    if (!this.RemoveFromObjList(socket.user.GetObj()))
        return false;

    socket.leave('room' + this.roomId);
    this.playerCnt--;

    return true;
};

Room.prototype.SendMsg = function (msg) {
    g_io.sockets.in('room' + this.roomId).emit('send:message', msg);
};

Room.prototype.SendChat = function (obj, msg) {
    this.SendMsg(g_makeTexts.Talk(obj.displayName, msg));
};

Room.prototype.Update = function () {
    let now = g_utils.NowSec();

    for (let item of this.items) {
        switch (item.state) {
            case constants.ROOM_ITEM_STATE_NOT_YET_GEN:
                if (now - item.startTime > item.genDeplySec) {
                    item.state = constants.ROOM_ITEM_STATE_GEN;
                }
                break;

            case constants.ROOM_ITEM_STATE_GEN:
                break;
        }
    }

    return false;
};

Room.prototype.UpdateDone = function (now) {
    let removeList = [];

    for (let obj of this.removedList) {
        //        console.log(obj);
        //        console.log(this.protoData.proto_objects);
        if (now - obj.removedTS > this.protoData.proto_objects[obj.protoId].respawnSec) {
            this.Spawn(obj.protoId);
            removeList.push(obj);
        }
    }

    for (let obj of removeList)
        g_utils.RemoveFromList(this.removedList, obj);

    // if(this.removedList.length == 0)
    //     return true;

    if (this.playerCnt == 0)
        return true;

    return false;
};

Room.prototype.CheckExits = function (msg) {
    for (let i in this.protoData.exits) {
        let exit = this.protoData.exits[i];
        if (exit.key === msg) {
            return exit.protoId;
        }
    }
    return false;
};

Room.prototype.GetPlayerCnt = function () {
    return this.playerCnt;
};


var RoomManager = function () {
    this.list = {};
    this.coordinateMap = {};

    for (let i in maps) {
        let room = maps[i];
        this.list[room.protoId] = new Room(room);

        if (!('y' in room))
            continue;

        if (!(room.y in this.coordinateMap))
            this.coordinateMap[room.y] = {};

        this.coordinateMap[room.y][room.x] = room;
    }

    for (let i in this.list) {
        let room = this.list[i];
        let roomProto = room.protoData;

        if (!('y' in roomProto))
            continue;

        this.AddExit(roomProto, 1, 0, [{key: '동', visible: true}, {key: 'e', visible: false}, {
            key: 'ㄷ', visible: false
        }]);
        this.AddExit(roomProto, -1, 0, [{key: '서', visible: true}, {key: 'w', visible: false}, {
            key: 'ㅅ', visible: false
        }]);
        this.AddExit(roomProto, 0, 1, [{key: '남', visible: true}, {key: 's', visible: false}, {
            key: 'ㄴ', visible: false
        }]);
        this.AddExit(roomProto, 0, -1, [{key: '북', visible: true}, {key: 'n', visible: false}, {
            key: 'ㅂ', visible: false
        }]);
        room.RefreshExits();
    }

    this.updateList = [];
};

RoomManager.prototype.AddExit = function (roomProto, x, y, keywords) {
    let newRoom = this.GetByCoordinate(roomProto.x + x, roomProto.y + y);
    if (newRoom === false)
        return;

    for (let i in keywords) {
        let keyword = keywords[i];

        if (keyword in roomProto.exits)
            continue;

        roomProto.exits[keyword.key] = {key: keyword.key, visible: keyword.visible, protoId: newRoom.protoId};
    }
};

RoomManager.prototype.GetByCoordinate = function (x, y) {
    if ((y in this.coordinateMap) && (x in this.coordinateMap[y])) {
        return this.coordinateMap[y][x];
    }

    return false;
};

RoomManager.prototype.GetById = function (roomId) {
    if (!this.list[roomId])
        return false;

    return this.list[roomId];
};

RoomManager.prototype.Join = function (roomId, socket) {
    let prevRoomId = socket.user.GetRoomId();
    this.Leave(prevRoomId, socket);

    let room = this.GetById(roomId);
    if (!room)
        return;

    room.Join(socket);
    g_utils.ArraySet(this.updateList, room);
};

RoomManager.prototype.Leave = function (roomId, socket) {
    let room = this.GetById(roomId);
    if (!room)
        return;

    room.Leave(socket);
    if (room.GetPlayerCnt() == 0) {

    }
};

RoomManager.prototype.SendMsgToRoom = function (roomId, msg) {
    let room = this.GetById(roomId);
    if (!room)
        return;

    room.SendMsg(msg);
};

RoomManager.prototype.OnObjDead = function (obj) {
    let room = this.GetById(obj.roomId);
    if (!room)
        return;

    room.RemoveFromObjList(obj);
    g_utils.ArraySet(this.updateList, room);
};

RoomManager.prototype.worldTicker = function () {
    let removeList = [];
    let now = g_utils.NowSec();

    for (let room of this.updateList) {
        room.Update(now);
        if (room.UpdateDone(now))
            removeList.push(room);
    }

    for (let room of removeList)
        g_utils.RemoveFromList(this.updateList, room);
};

RoomManager.prototype.GetMapText = function (room) {
    return g_makeTexts.GetMapText(this.coordinateMap, room);
};

module.exports = function (makeTexts, utils, io) {
    g_makeTexts = makeTexts;
    g_utils = utils;
    g_io = io;
    return new RoomManager();
};