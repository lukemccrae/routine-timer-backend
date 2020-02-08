var router = require('express').Router();

router.post('/convert', (req, res, next) => {
    console.log(req.body);

    var tj = require('togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use xmldom
    DOMParser = require('xmldom').DOMParser;

    var kml = new DOMParser().parseFromString(fs.readFileSync(req.body, 'utf8'));

    var converted = tj.kml(kml);

    console.log(converted, 'hi');
    

    var convertedWithStyles = tj.kml(kml, { styles: true });
    
  })
  

module.exports = router;