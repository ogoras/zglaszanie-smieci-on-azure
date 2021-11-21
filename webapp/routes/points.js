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

router.delete('/:id', function(req, res) {
    sqlcontroller.removeReport(req.params.id);
    res.send({ message: 'Point removed.' });
});

router.put('/:id', function(req,res) {
    var coordinates = req.body.coordinates;
    var state = req.body.state;
    var id = req.params.id;
    sqlcontroller.updateReport(id, state, coordinates);
    res.send({ message: 'Point updated.' });
})

module.exports = router;