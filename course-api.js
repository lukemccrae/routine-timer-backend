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
    async getCourseNamesIds(token) {
        const { data } = await this.get(`${this.baseURL}/courseList?token=${token}`)       
    }


}

//couldnt figure out how to make it work like the tutorial
    //different GQL libraries are confusing
    //here im just writing my own methods to grab data from my routes

// const baseUrl =  "https://banana-crumble-42815.herokuapp.com/course";
const baseUrl = "http://localhost:3005/course";
const CourseAPI = {
    getCourses: () => {
    },

    getCourseNamesIds: async (token) => { 
        const response = await fetch(`${baseUrl}/courseList?token=${token}`);
        const courseList = await response.json();
        return courseList;
    },
    getMileTimesInfo: async (token, courseId) => {
        const response = await fetch(`${baseUrl}/course?token=${token}&id=${courseId}`)
        const course = await response.json();
        return course;
    },

    getCourseInfo: async (token, courseId) => {
        const response = await fetch(`${baseUrl}?token=${token}&id=${courseId}`)
        const course = await response.json();
        console.log(course.route.geoJSON)
    }
}

module.exports = CourseAPI;