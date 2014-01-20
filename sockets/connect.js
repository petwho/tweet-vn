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

    require('./add_question')(socket);
    require('./edit_question')(socket);
    require('./add_answer')(socket);
  });
};