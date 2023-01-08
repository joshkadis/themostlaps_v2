const mongoose = require("mongoose");

const { model, Schema } = mongoose;

const streamsTestSchema = new Schema({
  activityId: Number,
  segmentEfforts: [Number],
  latlng: [Number],
  time: [Number],
  distance: [Number],
  testTime: [String],
});

const StreamTest = model("StreamTest", streamsTestSchema);

module.exports = StreamTest;
