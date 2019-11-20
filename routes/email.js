var express = require('express');
var router = express.Router();
const cors = require('cors');
var request = require('request');
const dotenv = require('dotenv/config');
var apigClientFactory = require('aws-api-gateway-client').default;
router.options('/send', cors())


const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

config = {invokeUrl:'https://6kqoehq7fj.execute-api.us-west-2.amazonaws.com/default/emailSender'}
var apigClient = apigClientFactory.newClient(config);


router.post('/send', function(req, res, next) {
    console.log(req.body);
    
  var pathParams = {
    //This is where path request params go. 
    userId: '1234',
};
// Template syntax follows url-template https://www.npmjs.com/package/url-template
var pathTemplate = '/users/{userID}/profile'
var method = 'POST';
var additionalParams = {
    //If there are query parameters or headers that need to be sent with the request you can add them here
    headers: {
        param0: '',
        param1: ''
    },
    queryParams: {
        param0: '',
        param1: ''
    }
};
var body = {
    //This is where you define the body of the request
};

apigClient.invokeApi(pathParams, pathTemplate, method, additionalParams, body)
    .then(function(result){
      console.log(result, 'success');
      
        //This is where you would put a success callback
    }).catch( function(result){
      console.log(result, 'fail');
      
        //This is where you would put an error callback
    });
})

module.exports = router;
