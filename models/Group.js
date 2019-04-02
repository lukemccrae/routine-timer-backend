const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'New Group'
  },
  timers: {
    type: Array,
    default: []
  },
  user: {
    type: String,
    required: true
  }
});
module.exports = mongoose.model('Group', GroupSchema);
