module.exports = function (socket) {
  socket.on('voteTweet', function (options) {
    socket.emit('voteTweet', options);
    socket.broadcast.emit('voteTweet', options);
  });
};
