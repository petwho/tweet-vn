define(['socket'], function (socket) {
  socket = io.connect();
  socket.on('login', function () {
    socket.emit('connectToRoom');
  });
  return socket;
});
