const { RESTDataSource } = require('apollo-datasource-rest');

class CourseAPI extends RESTDataSource {
    constructor() {
        super();

        //this is your endpoint to make rest calls against
        //just like Postman
        this.baseURL = "https://banana-crumble-42815.herokuapp.com/course"
    }

    getCourses() {
        return this.get();
    }

    getCourseNamesIds(userId, token) { 
        console.log("courses")
        return this.get(`courseList?id=${userId}&token=${token}`);
    }

    getRoute() {

    }
}