const { RESTDataSource } = require('apollo-datasource-rest');
const Course = require('./models/Course');
const fetch = require("node-fetch")

class RestAPI extends RESTDataSource {
    constructor() {
        super();

        //this is your endpoint to make rest calls against
        //just like Postman
        this.baseURL = "https://banana-crumble-42815.herokuapp.com/course"
    }


}

//couldnt figure out how to make it work like the tutorial
    //different GQL libraries are confusing
    //here im just writing my own methods to grab data from my routes

const baseUrl =  "https://banana-crumble-42815.herokuapp.com/course/";
const baseUrlDev = "http://localhost:3005/course/";
const CourseAPI = {
    getCourses: () => {
    },

    getCourseNamesIds: async (token) => { 
        console.log(token, "course-api")
        const response = await fetch(`${baseUrlDev}courseList?token=${token}`);
        const course = await response.json();
        return course;
    },

    getRoute: () => {

    }
}

module.exports = CourseAPI;