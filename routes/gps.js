var router = require('express').Router(),
    tj = require("@mapbox/togeojson"),
    DOMParser = require('xmldom').DOMParser
    fs = require('fs');
    xmlparser = require('express-xml-bodyparser');
    var togpx = require('togpx');

    function reverseArray(points) {
      let reversedPoints = [];
      for (let i = 0; i < points.length; i++) {
        let lng = points[i][0];
        points[i][0] = points[i][1];
        points[i][1] = lng;
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

    res.send({
      success: true,
      message: 'GPX converted to GeoJson succesfully.',
      geoJson: converted
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