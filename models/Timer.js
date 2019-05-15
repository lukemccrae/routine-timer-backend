const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const TimerSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'New Timer'
  },
  length: {
    type: Number,
    default: 60
  },
  user: {
    type: String,
    required: true
  }
});
module.exports = mongoose.model('Timer', TimerSchema);
