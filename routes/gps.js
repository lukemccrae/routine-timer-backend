var router = require('express').Router(),
    tj = require("@mapbox/togeojson"),
    DOMParser = require('xmldom').DOMParser
    fs = require('fs');
    xmlparser = require('express-xml-bodyparser');
    var togpx = require('togpx');
    var geojsonLength = require('geojson-length');

    function calcVert(arr) {
      let result = 0;
      for (let i = 1; i < arr.length; i++) {
        let diff = arr[i][2] - arr[i - 1][2] > 0 ? arr[i][2] - arr[i - 1][2] : 0;
        result += diff;
      }
      return result;
    }

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
      for (let i = 0; i < points.length; i++) {
        let lng = points[i][0];
        points[i][0] = points[i][1];
        points[i][1] = lng;
        points[i][2] = points[i][2] * 3.28084;
        reversedPoints.push(points[i])
      }
      return reversedPoints;
    };

router.post('/togeojson', (req, res, next) => {
    const gpx = new DOMParser().parseFromString(req.rawBody, "utf8");
    var converted = tj.gpx(gpx);
    let points = converted.features[0].geometry.coordinates;

    //tj.gpx inverts lat/lng points so they need to be reversed
    converted.features[0].geometry.coordinates = reverseArray(points);

    //add length of route in miles
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