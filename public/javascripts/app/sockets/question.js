define(['socket'], function (socket) {
  socket = io.connect('/question');
  socket.on('login', function () {
    socket.emit('connectToRoom');
  });
  return socket;
});
