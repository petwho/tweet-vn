module.exports = function (socket) {
  socket.on('newFollow', function (activity) {
    socket.emit('newFollow', activity);
    socket.broadcast.to('profile ' + activity.followed.user_id.username).emit('newFollow', activity);
    socket.broadcast.to('profile ' + activity.user_id.username).emit('followed', activity);
  });

  socket.on('unFollowed', function (activity) {
    console.log(activity)
    socket.emit('unFollowed', activity);
    socket.broadcast.to('profile ' + activity.followed.user_id.username).emit('unFollowed', activity);
    socket.broadcast.to('profile ' + activity.user_id.username).emit('unFollowedUser', activity);
  });
};
