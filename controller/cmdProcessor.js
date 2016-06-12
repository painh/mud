var makeTexts = require('./makeTexts');
var striptags = require('striptags');
var g_roomManager;
var g_combat;

var CmdProcessor = function()
{
}

CmdProcessor.prototype.parser = function(socket, data)
{ 
        var msg = striptags(data.message);
        var split = msg.split(' ');
        var room = g_roomManager.GetById(socket.obj.roomId);

        //        io.sockets.in('room' + this.roomId).emit('send:message', msg);

        if (split.length == 1) {
            switch (split[0]) {
                case '봐':
                    sendMsg(socket, makeTexts.MakeRoomPacket(socket));
                    return;

            }
        } else {
            var obj = room.GetObjByName(split[0]);
            if (obj) {
                if (split.length >= 2 && split[1] == "쳐") {
                    g_combat.Combat(socket.obj, obj);
                    return;
                }
            }
        }
        room.SendChat(socket.obj, msg);
}

module.exports = function(roomManager, combat)
{ 
    g_roomManager = roomManager;
    g_combat = combat;
    return new CmdProcessor();
}
