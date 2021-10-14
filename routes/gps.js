var router = require('express').Router(),
    tj = require("@mapbox/togeojson"),
    DOMParser = require('xmldom').DOMParser
    fs = require('fs');
    xmlparser = require('express-xml-bodyparser');
    var togpx = require('togpx');
    var geojsonLength = require('geojson-length');
    const haversine = require('haversine')
    const normalize = require('@mapbox/geojson-normalize');

    var getElevationGain = function getElevationGain(geojson, numberOfPoints) {
      var coords = [];
    
      if (geojson.geometry) {
        coords = geojson.geometry.coordinates;
      } else {
        coords = geojson.coordinates;
      }
    
      var elevations = coords.map(function (x) {
        return x[2];
      });
      var smaElevations = sma(elevations, numberOfPoints, 2);
      return Math.round(smaElevations.reduce(computeElevationGain, 0));
    };

    var computeElevationGain = function computeElevationGain(accumulator, currentValue, index, array) {
      var previousValue = array[index - 1];
      var delta = currentValue - previousValue; // Take only positive value
    
      if (delta > 0) {
        accumulator += delta;
      }
    
      return accumulator;
    };

    function avg(arr, idx, range) {
      return sum(arr.slice(idx - range, idx)) / range;
    }
    /**
     * Calculate the sum of an array.
     * @param  {Array} `arr` Array
     * @return {Number} Sum
     */
    
    
    function sum(arr) {
      var len = arr.length;
      var num = 0;
    
      while (len--) {
        num += Number(arr[len]);
      }
    
      return num;
    }

    function round(value, decimals) {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    var sma = function sma(arr, range, precision) {
      if (!Array.isArray(arr)) {
        throw TypeError('expected first argument to be an array');
      }
    
      precision = precision || 2;
      var num = range || arr.length;
      var res = [];
      var len = arr.length + 1;
      var idx = num - 1;
    
      while (++idx < len) {
        var value = avg(arr, idx, num);
        res.push(round(value, precision));
      }
    
      return res;
    };


    function reverseArray(points) {
      let reversedPoints = [];
      let uphillDistance = 15;
      let maxGrade = 0;
      let grades = [];
      let maxGrades = [];
      let uphillCount = 0;
      let gain = [];
      let loss = [];
      let mile = 0;
      let milePoints = [[]];
      for (let i = 1; i < points.length; i++) {
        //reverse lat lng order
        let lng = points[i][0];
        points[i][0] = points[i][1];
        points[i][1] = lng;
        //change elevation from meters to feet
        points[i][2] = points[i][2] * 3.28084;

        let start = {
          latitude: points[i - 1][0],
          longitude: points[i - 1][1]
        }
        
        let end = {
          latitude: points[i][0],
          longitude: points[i][1]
        }

        //rise and run for distance between these two data points
        let feetBetweenPoints = haversine(start, end, {unit: 'mile'}) * 5280

        let rise = points[i][2] - points[i - 1][2];
        // console.log(feetBetweenPoints)

        //this conditional is for a weird large number occuring as a feetBetweenPoints variable
        if(feetBetweenPoints < 2000) {
          mile += feetBetweenPoints
        }

        let currentMile = Math.floor(mile / 5280)

        //push points into milePoints so we have the points split up per mile
        if(milePoints.length === currentMile) milePoints.push([])

        //is it gain or loss?
        if(rise > 0) {
          //gain
          if(gain[currentMile] === undefined) {
            if(rise < 100 && rise > -100) {
              gain.push(rise) 
            }
          } else if(rise < 100 && rise > -100) {
            gain[currentMile] = gain[currentMile] + rise
            // console.log(rise)
          }
        } else {
          //loss
          if(loss[currentMile] === undefined) {
            if(rise < 100 && rise > -100) {
              loss.push(rise) 
            }
          } else if(rise < 100 && rise > -100) {
            loss[currentMile] = loss[currentMile] + rise
            // console.log(rise)
          }
        }

        if(feetBetweenPoints != 0 && rise != 0) {
          grades.push(rise / feetBetweenPoints)
        }
        
        //if this is an uphill distance, increment uphillDistance to calculate uphill grade
        if(points[i][2] > points[i - 1][2] && feetBetweenPoints < 300) {
          uphillDistance += feetBetweenPoints;
          uphillCount++;
        }
        // reversedPoints.push(points[i])
        //reduce size of geoJSON coordinates
        if(i % 2 === 0) {
          // console.log(currentMile, milePoints.length)
          milePoints[currentMile].push(points[i])
          reversedPoints.push(points[i])
        }
        // reversedPoints.push(points[i])
      }

      //get top 2% of max grades 
      maxGrades = grades.sort().slice(grades.length * .98, grades.length - 1)

      //having error when gpx file comes in with all of the same elevation points
      //return error 
      if(maxGrades.length < 5) {
        throw "The elevation points in this file could not be processed. Try finding this same route from another source and try again.";
      }

      //add max grades and uphill feet (to be divided by user-inputted distance) into the returned array
      let vertInfo = {
        avgMaxGrade: Math.round((maxGrades.reduce((a, b) => (a + b)) / maxGrades.length) * 100),
        totalUphillFeet: Math.round(uphillDistance),
        cumulativeGain: gain,
        cumulativeLoss: loss
      }

      console.log(vertInfo)

      reversedPoints.push(vertInfo)
      reversedPoints.push(milePoints)
      
      return reversedPoints;
    };

router.post('/togeojson', (req, res, next) => {
    const gpx = new DOMParser().parseFromString(req.rawBody, "utf8");
    var converted = normalize(tj.gpx(gpx))
      //some GPX files come back with multiple coordinate arrays]
      //if this is the case, combine them
    if(converted.features.length > 1) {
      for (let i = 1; i < converted.features.length; i++) {
        converted.features[0].geometry.coordinates.concat(converted.features[i].geometry.coordinates)
      }
      converted.features = [converted.features[0]]
    }

    //if no elevation, get it (cant for now, need to figure out how to host this service)
    if(converted.features[0].geometry.coordinates[0].length < 3) {
      res.send({
        success: false,
        message: "This GPX file has no elevation points."
      })
      // fetch('http://localhost:3000/', {
      //   method: 'post',
      //   body:    JSON.stringify(converted),
      //   headers: { 'Content-Type': 'application/json' },
      // }).then(res => res.json())
      //   .then(json => {
      //     processCourse(json)
      //   });
    } else {
      try {
        processCourse(converted)
      } catch(error) {
        res.send({
          success: false,
          message: error
        })
      }
    }

    function processCourse(converted) {
      // console.log("converted", converted, converted.features[0].geometry.coordinates)
      let points = converted.features[0].geometry.coordinates;

      //reverse array points(need lat, lng --- not lng, lat)
      let routeData = reverseArray(points);

      //pop off mile points
      let milePoints = routeData.pop();

      //pop off vert grade info and store
      let vertInfo = routeData.pop();

      //add geoJson coordinates to returned object
      converted.features[0].geometry.coordinates = routeData;

      //add milePoints to returned object
      converted.features[0].geometry.milePoints = milePoints;

      //add vertInfo to returned object
      converted.features[0].properties.vertInfo = vertInfo;

      //add length of route and in miles
      //these datapoints are inaccurate but might be nice to to display estimates
      converted.features[0].properties.distance = geojsonLength(converted.features[0].geometry) * 0.00062137121212121
      converted.features[0].properties.vert = Math.round(getElevationGain(converted.features[0], 100))

      //if no name, give gpx a name
      if(converted.features[0].properties.name === "") {
        converted.features[0].properties.name = "unnamed_gpx"
      }
      
      res.send({
        success: true,
        message: 'GPX converted to GeoJson succesfully.',
        geoJson: converted,
        distance: geojsonLength(converted.features[0].geometry)
      })
    }
  })

  router.post('/togpx', (req, res, next) => {
    //incoming data is in lat/lng and togpx needs lng/lat
    let reverseMe = req.body.track.features[0].geometry.coordinates;
    let reversedArray = reverseArray(reverseMe);
    //assign reversed coordinates
    req.body.track.features[0].geometry.coordinates = reversedArray;
    
    res.send({
      success: true,
      message: 'GeoJson converted to GPX succesfully.',
      gpx: togpx(req.body.track)
    })
    
  })
  

module.exports = router;