module.exports = function (socket) {
  socket.on('soketAddedAnswer', function (answer) {
    var i;
    socket.emit('soketAddedAnswer', answer);
    for (i = 0; i < answer.topic_ids.length; i++) {
      if (typeof answer.topic_ids[i] === 'object') {
        socket.broadcast.to('topic_id ' + answer.topic_ids[i]._id).emit('soketAddedAnswer', answer);
      } else {
        socket.broadcast.to('topic_id ' + answer.topic_ids[i]).emit('soketAddedAnswer', answer);
      }
    }
  });
};
