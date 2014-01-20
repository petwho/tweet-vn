module.exports = function (socket) {
  socket.on('socketEditQuestionTopics', function (question) {
    var i;
    socket.emit('socketEditQuestionTopics', question);
    socket.broadcast.emit('socketEditQuestionTopics', question);
  });
};
