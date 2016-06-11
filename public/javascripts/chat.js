$(function() {
    // Socket.io connection
    var hostname = local_data.hostname;
    var socket = io.connect(hostname),
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

    function scroll() {
        var wtf = $('#content');
        var height = wtf[0].scrollHeight;
        wtf.scrollTop(height);
    }

    function print(data) {
        $('#log').append('<p>' + data + '</p>');
        scroll();
    }

    socket.on('send:message', function(data) {
        print(data);
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

    $('body').resize(function() {
        scroll();
    });


    for (var i = 0; i < 100; ++i)
        print('<br/>');


});
