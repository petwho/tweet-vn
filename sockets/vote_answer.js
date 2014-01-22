module.exports = function (socket) {
  socket.on('voteAnswer', function (options) {
    socket.emit('voteAnswer', options);
    socket.broadcast.emit('voteAnswer', options);
  });
};
