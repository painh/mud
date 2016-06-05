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

// Socket.io
io.sockets.on('connection', function(socket) {
    // Join Room
    socket.on('join:room', function(data) {
        if (data.roomId in maps) {
            socket.join('room' + data.roomId);
            this.emit('send:map', maps[data.roomId]);
            this.roomId = data.roomId;
        }
    });
    // Broadcast to room
    socket.on('send:message', function(data) {
        var msg = striptags(data.message); 
        io.sockets.in('room' + this.roomId).emit('send:message', msg);
    });
});
