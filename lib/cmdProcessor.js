var makeTexts = require('./makeTexts');
var striptags = require('striptags');
var constants = require('../json/constants.js');
var g_roomManager;
var g_combat;

var CmdProcessor = function () {
};

CmdProcessor.prototype.processNormalInput = function (socket, data) {
    let msg = striptags(data.message);
    let userObj = socket.user.GetObj();
    let room = g_roomManager.GetById(userObj.roomId);

    if(socket.user.CheckTalkScriptKeyword(room, msg))
        return true;

    let split = msg.split(' ');
    //        io.sockets.in('room' + this.roomId).emit('send:message', msg);

    if (split.length == 1) {
        if (userObj.InCombat()) {
            if (split[0] >= "1" && split[0] <= constants.HANDS_MAX_CNT) {
                g_combat.CombatUserInput(userObj, parseInt(split[0]) - 1);
                return false;
            }
        }

        switch (split[0]) {
            case '봐':
                socket.SendMsg(makeTexts.MakeRoomPacket(room, socket), true);
                return false;

            case '스':
            case '스킬':
            case '기술':
                socket.SendMsg(makeTexts.Skills(userObj), true);
                return false;
        }

        if (userObj.InCombat()) {
            socket.SendMsg(makeTexts.InvalidCmdInCombat(), true);
            return false;
        }
    } else {
        var roomObj = room.GetObjByName(split[0]);
        if (roomObj && split.length >= 2) {
            switch (split[1]) {
                case '쳐':
                    g_combat.Combat(userObj, roomObj);
                    return true;

                case '대화':
                    return socket.user.ProcessTalk(roomObj);
            }
        }

        var roomItem = room.GetItemByName(split[0]);
        if (roomItem && split.length >= 2) {
            switch (split[1]) {
                case '봐':
                    socket.SendMsg(makeTexts.ItemDescript(roomItem), true);
                    return true;
            }
        }

        if (userObj.InCombat()) {
            socket.SendMsg(makeTexts.InvalidCmdInCombat(), true);
            return false;
        }

        if (roomItem && split.length >= 2) {
            switch (split[1]) {
                case '가져':
                    room.RemoveFromItemList(roomItem);
                    room.SendMsg(makeTexts.ItemGet(userObj, roomItem));
                    return true;
            }
        }
    }

    var ret = room.CheckExits(msg);

    if (ret !== false) {
        if (userObj.InCombat()) {
            socket.SendMsg(makeTexts.InvalidCmdInCombat(), true);
            return false;
        }

        g_roomManager.Join(ret, socket);
    }
    else {
        room.SendChat(userObj, msg);
    }

};

CmdProcessor.prototype.parser = function (socket, data) {
    switch (socket.user.GetInputState()) {
        case constants.INPUT_STATE_NORMAL:
            return this.processNormalInput(socket, data);
    }

    return true;
};

module.exports = function (roomManager, combat, scriptManager) {
    g_roomManager = roomManager;
    g_combat = combat;
    g_scriptManager = scriptManager;
    return new CmdProcessor();
};