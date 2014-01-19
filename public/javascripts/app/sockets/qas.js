define(['socket'], function (socket) {
  socket = io.connect('/qas');
  socket.on('login', function () {
    socket.emit('connectToRoom');
  });
  return socket;
});
