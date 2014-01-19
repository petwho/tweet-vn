define(['socket'], function (socket) {
  socket = io.connect('/open-questions');
  socket.on('login', function () {
    socket.emit('connectToRoom');
  });
  return socket;
});
