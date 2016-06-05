$(function() {
    // Socket.io connection
    var socket=io.connect('http://localhost:10332'), roomId='';
    // Join to room
    function join(roomId) {
        $('#chat') .show() .find('h1').html('room' + roomId).end() .find('#log').html('');
        socket.emit('join:room', {
            roomId: roomId
        }
        );
    }

    socket.on('connect',
    function() {
        join('entry');
    }
    );
    // Receive a message
    socket.on('send:message',
    function(data) {
        $('#chat').find('#log').append('<p>' + data +'</p>');
    }
    );
    function print(data) {
        $('#chat').find('#log').append('<p>' + data +'</p>');
    }
    socket.on('send:map',
    function(data) {
        print("===" + data.displayName +"===");
        print(data.description);
    }
    );
    $("#message").focus();
    $("#message").keyup(function(event) {
        if(event.keyCode != 13) 
            return;

        var msg=$('#message').val();
        if (!msg) 
            return;

        $('#message').val('');
        socket.emit('send:message', { roomId: roomId, message: msg }); 
    });
}
);
