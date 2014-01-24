var mongoose = require('mongoose'),
  NotificationSchema  = require('../schemas/notification'),
  Notification        = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
