var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

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
app.use('/users', users);

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

function makeRoomPacket(roomId) {
    var room = maps[roomId];
    var description = "=== " + room.displayName + "===<br/>" +
        room.description + "<br/>";

    for (var i in room.objects) {
        var obj = room.objects[i];
        description += obj.displayName + "가 서 있습니다." + "<br/>";
    }

    return description;
}

function sendMsg(socket, msg) {
    socket.emit('send:message', msg);
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
function worldTicker() {
    console.log(g_clients.length);

    for(var i in g_clients)
    {
        var client = g_clients[i];
    }
}

function combat(src, desc)
{
    src.combatTargets
}

function sendMsgToRoom(socket, msg)
{
    io.sockets.in('room' + socket.roomId).emit('send:message', msg);
}

function sendChat(socket, msg)
{
    sendMsgToRoom(socket, socket.obj.displayName + "(이)가 [" + msg + ']라고 말 합니다.</br>');
}

// Socket.io
io.sockets.on('connection', function(socket) {
    var user = {
        displayName: "플레이어" + socket.id,
        hp: 100,
        ap: 10,
    };
    socket.obj = user;

    g_clients.push(socket);

    socket.on('disconnect', function() {
        g_clients.splice(g_clients.indexOf(socket), 1);
        console.log('out');
    });
    // Join Room
    socket.on('join:room', function(data) {
        if (data.roomId in maps) {
            this.join('room' + data.roomId);
            this.roomId = data.roomId;
            sendMsg(this, makeRoomPacket(this.roomId));
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
                    sendMsg(this, makeRoomPacket(this.roomId));
                    return;

            }
        } else {
            var obj = findObj(this.roomId, split[0])
            if (obj) {
                if (split.length > 2 && split[1] == "쳐") {
                    combat(this.user, obj);
                    return;
                }
            } 
        }
        console.log("sdf");
        sendChat(this, msg);
    });
});
