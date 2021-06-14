const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'New Group',
    required: true
  },
  details: {
      type: Object,
      required: false
  },
  stops  : {
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
  editOpen: {
    type: Boolean,
    default: false
  }
});
module.exports = mongoose.model('Course', CourseSchema);
