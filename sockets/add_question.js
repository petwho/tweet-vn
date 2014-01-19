module.exports = function (socket) {
  socket.on('soketAddedQuestion', function (question) {
    var i;
    socket.emit('soketAddedQuestion', question);
    for (i = 0; i < question.topic_ids.length; i++) {
      if (typeof question.topic_ids[i] === 'object') {
        socket.broadcast.to('topic_id ' + question.topic_ids[i]._id).emit('soketAddedQuestion', question);
      } else {
        socket.broadcast.to('topic_id ' + question.topic_ids[i]).emit('soketAddedQuestion', question);
      }
    }
  });
};
