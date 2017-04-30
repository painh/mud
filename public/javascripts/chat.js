var g_textHistory = [];
var g_textHistoryIndex = 0;

$(function () {
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

    socket.on('connect', function () {
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

    socket.on('send:message', function (data) {
        print(data);
    });

    var inpMsg = $('#message');

    inpMsg.focus();

    inpMsg.keyup(function (event) {
        if (event.which == 38) {
            if (g_textHistoryIndex > 0)
                g_textHistoryIndex--;

            inpMsg.val(g_textHistory[g_textHistoryIndex]);
        }

        if (event.which == 40) {
            if (g_textHistoryIndex < g_textHistory.length - 1)
                g_textHistoryIndex++;

            inpMsg.val(g_textHistory[g_textHistoryIndex]);
        }

        if (event.keyCode != 13)
            return;

        var msg = inpMsg.val();
        if (!msg)
            return;

        inpMsg.val('');
        socket.emit('send:message', {
            roomId: roomId,
            message: msg
        });

        g_textHistory.push(msg);
        g_textHistoryIndex = g_textHistory.length;

        print('> ' + msg +'<br/>');

    });

    $('body').resize(function () {
        scroll();
    });


    for (var i = 0; i < 100; ++i)
        print('<br/>');
});
