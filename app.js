"use strict";
var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');

var app = express();
var server = require('http').Server(app);
//var io = require('socket.io')(server, {
//    origins: 'localhost:* http://localhost:*'
//});
var io = require('socket.io')(server);

var proto_object = require('./json/proto_object');
var proto_card = require('./json/proto_card');
var proto_item = require('./json/proto_item');

var g_clients = [];


var makeTexts = require('./lib/makeTexts');
var utils = require('./lib/utils.js');
var roomManager = require('./lib/roomManager.js')(makeTexts, utils, io);
var combat = require('./lib/combat.js')(makeTexts, roomManager);
var cmdProcessor = require('./lib/cmdProcessor.js')(roomManager, combat);
var userClass = require('./lib/user')(roomManager);
var dailyTimer = require('./lib/dailyTimer')(io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var sessionProto = session({resave: true, saveUninitialized: true, secret: 'sadfsadfuwotm8'});
app.use(sessionProto);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

var port = app.get('port') || 3000;

server.listen(port, function () {
    console.log("open " + port);
});

setInterval(function () {
    combat.worldTicker();
    roomManager.worldTicker();
    dailyTimer.worldTicker();
}, 3000);

io.use(function (socket, next) {
    sessionProto(socket.request, {}, next);
    // if (!socket.request.hasOwnProperty('session')) {
    //     next(new Error("Token unknown"));
    //     socket.disconnect();
    // }
});

// Socket.io
io.sockets.on('connection', function (socket) {

    if (typeof socket.request.session == 'undefined' ||
        typeof socket.request.session.passport == 'undefined' ||
        typeof socket.request.session.passport.user == 'undefined') {
        socket.disconnect();
        return;
    }

    socket.SendMsg = function (msg, showCursor) {
        this.emit('send:message', msg + (showCursor ? this.user.GetCursor() : ""));
    };

    socket.user = new userClass(socket);
    roomManager.Join(socket.user.GetRoomId(), socket);

    utils.RemoveFromList(g_clients, socket);
    g_clients.push(socket);

    socket.on('disconnect', function () {
        roomManager.Leave(this.user.GetRoomId(), this);
        combat.RemoveObj(this.user);
        utils.RemoveFromList(g_clients, this);
    });
    // Broadcast to room
    socket.on('send:message', function (data) {
        if (cmdProcessor.parser(this, data))
            this.emit('send:message', this.user.GetCursor());
    });
});

// var mysql = require('mysql');
// var pool  = mysql.createPool({
//     connectionLimit : 10,
//     host            : 'localhost',
//     user            : 'mud',
//     password        : 'sadfasdf',
//     database        : 'mud_dev'
// });
//
// pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//     if (error) throw error;
//     console.log('The solution is: ', results[0].solution);
// });
