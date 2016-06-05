$(function() {
    // Socket.io connection
    var socket = io.connect('http://localhost:10332'),
        roomId = '';
    // Join to room
    function join(roomId) {
        socket.emit('join:room', {
            roomId: roomId
        });
    }

    socket.on('connect', function() {
        join('entry');
    });

    function print(data) {
        $('#log').append('<p>' + data + '</p>');
        var wtf    = $('#content');
        var height = wtf[0].scrollHeight;
        wtf.scrollTop(height);
    }

    socket.on('send:message', function(data) {
        print(data);
    });

    socket.on('send:map', function(data) {
        print("===" + data.displayName + "===");
        print(data.description);
    });

    $("#message").focus();
    $("#message").keyup(function(event) {
        if (event.keyCode != 13)
            return;

        var msg = $('#message').val();
        if (!msg)
            return;

        $('#message').val('');
        socket.emit('send:message', {
            roomId: roomId,
            message: msg
        });
    });
});