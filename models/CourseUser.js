const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const CourseUserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

CourseUserSchema.methods.generateHash = function(password, userInfo) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

CourseUserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}
module.exports = mongoose.model('CourseUser', CourseUserSchema);
