var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();
var server = require('http').Server(app);
//var io = require('socket.io')(server, {
//    origins: 'localhost:* http://localhost:*'
//});
var io = require('socket.io')(server);
var striptags = require('striptags');

var maps = require('./map');
var proto_object = require('./proto_object');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

var port = app.get('port') || 10332;

server.listen(port, function() {
    console.log("open " + port);
});

function makeRoomPacket(socket) {
    var room = maps[socket.obj.roomId];
    var description = "=== " + room.displayName + "===<br/>" +
        room.description + "<br/>";

    for (var i in room.objects) {
        var obj = room.objects[i];
        if (obj == socket.obj)
            continue;

        description += obj.displayName + "(이)가 서 있습니다." + "<br/>";
    }

    return description;
}

function makeCursor(socket) {
    return "[" + socket.obj.hp + "]<br/>";
}

function sendMsg(socket, msg) {
    socket.emit('send:message', msg);
    socket.emit('send:message', makeCursor(socket));
}

function sendMsgToRoom(roomId, msg) {
    io.sockets.in('room' + roomId).emit('send:message', msg);
}

function findObj(roomId, displayName) {
    var room = maps[roomId];
    for (var i in room.objects) {
        var obj = room.objects[i];
        if (displayName == obj.displayName)
            return obj;
    }

    return false;
}

setInterval(worldTicker, 3000);

var g_clients = [];

function attack(obj) {
    var targetList = obj.combatTargets;
    if (targetList.length == 0)
        return;

    var target = targetList[0];
    target.hp -= obj.ap;
    var str = obj.displayName + "(이)가 " + target.displayName + "(을)를 공격하였습니다. [-" + obj.ap + "]";
    sendMsgToRoom(target.roomId, str);
}

function worldTicker() {
    //TODO combatlist를 만들어서 속도 기분으로 소팅하는 식으로 선빵을 만들어야함...
    for (var i in g_clients) {
        var client = g_clients[i];
        attack(client.obj);
    }
}

function combat(src, desc) {
    if (src.combatTargets.indexOf(desc) == -1) {
        src.combatTargets.push(desc);
    }

    if (desc.combatTargets.indexOf(src) == -1) {
        desc.combatTargets.push(src);
    }

    console.log(src, desc);
}


function sendChat(socket, msg) {
    sendMsgToRoom(socket.obj.roomId, socket.obj.displayName + "(이)가 [" + msg + ']라고 말 합니다.</br>');
}

function roomJoin(roomId, socket) {
    roomLeave(socket);

    var room = maps[roomId]; 
    socket.join('room' + roomId);
    socket.obj.roomId = roomId;
    sendMsg(socket, makeRoomPacket(socket));

    room.objects.push(socket.obj);
}

function removeFromList(list, obj)
{
    var idx = list.indexOf(obj);
    if(idx == -1)
        return;

    list.splice(idx, 1);
}

function roomLeave(socket) {
    var roomId = socket.obj.roomId;
    if (!maps[roomId])
        return;

    var room = maps[roomId];
    removeFromList(room.objects, socket.obj);
    socket.leave('room' + socket.obj.roomId);
}

// Socket.io
io.sockets.on('connection', function(socket) {
    var user = {
        displayName: "플레이어" + socket.id,
        hp: 100,
        ap: 10,
        combatTargets: [],
        roomId : "entry"
    };
    socket.obj = user;

    g_clients.push(socket);

    socket.on('disconnect', function() {
        roomLeave(socket);
        removeFromList(g_clients, socket);
    });
    // Join Room
    socket.on('join:room', function(data) {
        if (data.roomId in maps) {
            roomJoin(data.roomId, socket);
        }
    });
    // Broadcast to room
    socket.on('send:message', function(data) {
        var msg = striptags(data.message);
        var split = msg.split(' ');

        //        io.sockets.in('room' + this.roomId).emit('send:message', msg);

        if (split.length == 1) {
            switch (split[0]) {
                case '봐':
                    sendMsg(this, makeRoomPacket(this));
                    return;

            }
        } else {
            var obj = findObj(this.obj.roomId, split[0])
            if (obj) {
                if (split.length >= 2 && split[1] == "쳐") {
                    combat(this.obj, obj);
                    return;
                }
            }
        }
        sendChat(this, msg);
    });
});
