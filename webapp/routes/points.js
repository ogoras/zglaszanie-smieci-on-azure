var express = require('express');
var router = express.Router();
var sqlcontroller = require('../sqlcontroller');

/* GET home page. */
router.get('/', function(req, res, next) {
    sqlcontroller.getAllReports((pointslist) => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(pointslist));
        res.end();
    })
});

router.post('/', function(req, res) {
    var coordinates = req.body.coordinates;
    var state = req.body.state;
    console.log("Coordinates are:" + coordinates);
    console.log("State is:" + state);
    sqlcontroller.addReport(coordinates, (id) => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(id));
        res.end();
    },
    state);
});

module.exports = router;