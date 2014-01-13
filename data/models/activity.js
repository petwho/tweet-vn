var mongoose = require('mongoose'),
  ActivitySchema = require('../schemas/activity'),
  Activity = mongoose.model('Activity', ActivitySchema);

module.exports = Activity;
