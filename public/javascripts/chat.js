$(function() {
  // Socket.io connection
  var socket = io.connect('http://localhost:10332'),
      roomId = '';
  // Join to room
  $('#joinButtonWrap').on('click', 'button', function() {
    roomId = $(this).data('id');
    $('#chat')
      .show()
      .find('h1').html('room' + roomId).end()
      .find('#log').html('');
    socket.emit('join:room', {roomId: roomId});
  });
  // Send a message
  $('#submit').on('click', function() {
    var msg = $('#message').val();
    if(!msg) return;
    socket.emit('send:message', {
      roomId: roomId,
      message: msg
    });
  });
  // Receive a message
  socket.on('send:message', function(data) {
    $('#chat').find('#log').append('<p>' + data + '</p>');
  });
});
