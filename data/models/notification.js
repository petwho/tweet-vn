var mongoose = require('mongoose'),
  NotificationSchema  = require('../schemas/log'),
  Notification        = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
