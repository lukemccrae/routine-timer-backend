const { RESTDataSource } = require('apollo-datasource-rest');
const Course = require('./models/Course');
const fetch = require("node-fetch");
const {deleteHelper} = require('./helpers/delete-course');


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
    getRouteInfo: async (token, courseId) => {
        const response = await fetch(`${baseUrl}/course?token=${token}&id=${courseId}`)
        const course = await response.json();
        return course.course[0].route;
    },

    getCourseInfo: async (token, courseId) => {
        const response = await fetch(`${baseUrl}?token=${token}&id=${courseId}`)
        const course = await response.json();
    },

    getStopsInfo: async (token, courseId) => {
        const response = await fetch(`${baseUrl}?token=${token}&id=${courseId}`)
        const course = await response.json();
        return course.course[0];
    },
    getCourseInfo: async (token, courseId) => {
        const response = await fetch(`${baseUrl}?token=${token}&id=${courseId}`)
        const course = await response.json();
        return course.course[0].details;
    },
    deleteCourse: async (token, courseId) => {
        console.log(token, courseId)
        // const response = await deleteHelper(token, courseId);
        const response = await fetch(`${baseUrl}?token=${token}&courseId=${courseId}`, {
            method: "DELETE"
        })
        const courseList = await response.json();
        return courseList;
    },
    addNewCourse: async (token) => {
        console.log(token, "token course api")
        const request = await fetch(`${baseUrl}?token=${token}`, {
            method: "POST"
        })
        const response = await request.json();
        return response;
        
    },
    saveCourse: async (token, courseId, tempCourse) => {
        const request = await fetch(`${baseUrl}?token=${token}&courseId=${courseId}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'origin': 'https://corsa.run'
              },
            body: JSON.stringify({
                tempCourse
            })
        })
        const response = await request.json();
        return response;
    }

}

module.exports = CourseAPI;