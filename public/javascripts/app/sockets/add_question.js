define(['socket'], function (socket) {
  qas = io.connect('/qas');
  qas.on('login', function () {
    qas.emit('connectToRoom');
  });

  open_questions = io.connect('/open-questions');
  open_questions.on('login', function () {
    open_questions.emit('connectToRoom');
  });
  return {
    qas: qas,
    open_questions: open_questions
  };
});
