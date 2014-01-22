module.exports = function (socket) {
  socket.on('viewProfile', function (username) {
    socket.join('profile ' + username);
  });
};
