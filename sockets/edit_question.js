module.exports = function (socket) {
  socket.on('socketEditQuestionTopics', function (question) {
    var i;
    socket.emit('socketEditQuestionTopics', question);
    socket.broadcast.emit('socketEditQuestionTopics', question);
  });

  socket.on('socketEditQuestionTitle', function (question) {
    var i;
    socket.emit('socketEditQuestionTitle', question);
    socket.broadcast.emit('socketEditQuestionTitle', question);
  });
};
