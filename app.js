"use strict";
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

var proto_object = require('./json/proto_object');


var g_clients = [];

var objClass = require('./controller/obj');
var makeTexts = require('./controller/makeTexts');
var utils = require('./controller/utils.js');
var roomManager = require('./controller/roomManager.js')(makeTexts, utils, io);
var combat = require('./controller/combat.js')(g_clients, makeTexts, roomManager);
var cmdProcessor = require('./controller/cmdProcessor.js')(roomManager, combat);

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

setInterval(combat.worldTicker, 3000);


// Socket.io
io.sockets.on('connection', function(socket) {
    socket.obj = new objClass('player', 'entry');
    socket.sendMsg = function(msg) {
        this.emit('send:message', msg + this.obj.GetCursor());
    }

    utils.RemoveFromList(g_clients, socket);
    g_clients.push(socket);

    socket.on('disconnect', function() {
        roomManager.Leave(socket);
        combat.RemoveObj(socket.obj);
        utils.RemoveFromList(g_clients, socket);
    });
    // Join Room
    socket.on('join:room', function(data) {
        roomManager.Join(data.roomId, socket);
    });
    // Broadcast to room
    socket.on('send:message', function(data) {
        cmdProcessor.parser(this, data);
    });
});
