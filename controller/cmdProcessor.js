var makeTexts = require('./makeTexts');
var striptags = require('striptags');
var constants = require('../json/constants.js');
var g_roomManager;
var g_combat;

var CmdProcessor = function () {
};

CmdProcessor.prototype.processNormalInput = function (socket, data) {
    var msg = striptags(data.message);
    var split = msg.split(' ');
    var obj = socket.user.GetObj();

    var room = g_roomManager.GetById(obj.roomId);

    //        io.sockets.in('room' + this.roomId).emit('send:message', msg);

    if (split.length == 1) {
        if (obj.InCombat()) {
            if (split[0] >= "1" && split[0] <= constants.HANDS_MAX_CNT) {
                g_combat.CombatUserInput(obj, parseInt(split[0]) - 1);
            }
            return false;
        }

        switch (split[0]) {
            case '봐':
                socket.SendMsg(makeTexts.MakeRoomPacket(room, socket), true);
                return false;

            case '스':
            case '스킬':
            case '기술':
                socket.SendMsg(makeTexts.Skills(obj), true);
                return false;
        }
    } else {
        var roomObj = room.GetObjByName(split[0]);
        if (roomObj) {
            if (split.length >= 2 && split[1] == "쳐") {
                g_combat.Combat(socket.obj, roomObj);
                return true;
            }
        }
    }
    room.SendChat(socket.user.GetObj(), msg);
};

CmdProcessor.prototype.parser = function (socket, data) {
    switch(socket.user.GetInputState())
    {
        case constants.INPUT_STATE_NORMAL:
            return this.processNormalInput(socket, data);
    }

    return true;
};

module.exports = function (roomManager, combat) {
    g_roomManager = roomManager;
    g_combat = combat;
    return new CmdProcessor();
};