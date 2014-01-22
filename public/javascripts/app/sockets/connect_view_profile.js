// this socket uses on user profile page only
define(['socket'], function (socket) {
  var username = $('#user-profile').data('username');
  socket = io.connect();
  socket.emit('viewProfile', username);
  return socket;
});
