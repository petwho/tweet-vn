module.exports = function (io) {
  io.sockets.on('connection', function (socket) {
    var hs = socket.handshake;

    socket.emit('login');

    require('./connect_to_room')(hs, socket);
    require('./add_question')(socket);
    require('./edit_question')(socket);
    require('./add_answer')(socket);
    require('./vote_answer')(socket);

    require('./connect_view_profile')(socket);
    require('./toggle_follow')(socket);
  });
};