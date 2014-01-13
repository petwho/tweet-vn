var Schema        = require('mongoose').Schema;

var NewsFeedSchema = new Schema({
  user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
  activity_ids: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
});

module.exports = NewsFeedSchema;
