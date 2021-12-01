const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const CourseSchema = new mongoose.Schema({
  details: {
      type: Object,
      required: false,
      default: {
        goalHours: 1,
        goalMinutes: 30,
        calories: 200,
        mileTimes: [0],
        distance: 0,
        vert: 500,
        name: 'New Course',
        vertMod: 300,
        terrainMod: 1.1,
        startTime: "06:00"
      }
  },
  paceAdjust: [],
  stops  : {
    type: Array,
    default: [{
      name: "Start",
      cals: 400,
      miles: 0,
      id: 1,
      comments: ""
    }]
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
          name: "no route stored",
          distance: 0,
          vert: 0,
          vertInfo: {
            cumulativeGain: [],
            cumulativeLoss: []
          }
        },
        geometry: {
          coordinates: [],
          milePoints: []
        }
      },
    }
  }
});
module.exports = mongoose.model('Course', CourseSchema);
