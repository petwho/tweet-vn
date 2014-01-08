var mongoose = require('mongoose'),
  LogSchema  = require('../schemas/log'),
  Log        = mongoose.model('Log', LogSchema);

module.exports = Log;
