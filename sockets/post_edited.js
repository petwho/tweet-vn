module.exports = function (io) {
  io.sockets.on('connection', function (socket) {
    var hs = socket.handshake;

    socket.emit('login');

    socket.on('connectToRoom', function (content) {
      var i, topic_ids, user_ids, question_ids;

      if (hs.session.user) {
        topic_ids = hs.session.user.following.topic_ids;
        user_ids = hs.session.user.following.user_ids;
        question_ids = hs.session.user.following.question_ids;

        for (i = 0; i < topic_ids.length; i++) {
          socket.join('topic_id ' + topic_ids[i]);
        }

        for (i = 0; i < question_ids.length; i++) {
          socket.join('question_id ' + question_ids[i]);
        }

        for (i = 0; i < user_ids.length; i++) {
          socket.join('user_id ' + user_ids[i]);
        }
      }

    });

    socket.on('soketQuestionAdded', function (question) {
      var i;
      socket.emit('soketQuestionAdded', question);
      for (i = 0; i < question.topic_ids.length; i++) {
        if (typeof question.topic_ids[i] === 'object') {
          socket.broadcast.to('topic_id ' + question.topic_ids[i]._id).emit('soketQuestionAdded', question);
        } else {
          socket.broadcast.to('topic_id ' + question.topic_ids[i]).emit('soketQuestionAdded', question);
        }
      }
    });

    socket.on('soketAnswerAdded', function (answer) {
      var i;
      socket.emit('soketAnswerAdded', answer);
      for (i = 0; i < answer.topic_ids.length; i++) {
        if (typeof answer.topic_ids[i] === 'object') {
          socket.broadcast.to('topic_id ' + answer.topic_ids[i]._id).emit('soketAnswerAdded', answer);
        } else {
          socket.broadcast.to('topic_id ' + answer.topic_ids[i]).emit('soketAnswerAdded', answer);
        }
      }
    });
  });
};