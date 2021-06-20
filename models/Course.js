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
      required: false,
      default: {
        pace: 10,
        calories: 2000
      }
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
  },
  route: {
    type: Object,
    required: true,
    default: {
      geoJSON: {
        properties: {
          name: "no route stored"
        }
      },
      vert: 1
    }
  }
});
module.exports = mongoose.model('Course', CourseSchema);
