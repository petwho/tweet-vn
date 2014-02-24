module.exports = function (socket) {
  socket.on('soketAddedTweet', function (tweet) {
    var i;
    socket.emit('soketAddedTweet', tweet);
    for (i = 0; i < tweet.topic_ids.length; i++) {
      if (typeof tweet.topic_ids[i] === 'object') {
        socket.broadcast.to('topic_id ' + tweet.topic_ids[i]._id).emit('soketAddedTweet', tweet);
      } else {
        socket.broadcast.to('topic_id ' + tweet.topic_ids[i]).emit('soketAddedTweet', tweet);
      }
    }
  });
};
