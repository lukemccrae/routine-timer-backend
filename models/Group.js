const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'New Group',
    required: true
  },
  timers: {
    type: Array,
    default: []
  },
  user: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  box: {
    type: Array,
    default: ['']
  },
  editOpen: {
    type: Boolean,
    default: false
  }
});
module.exports = mongoose.model('Group', GroupSchema);
