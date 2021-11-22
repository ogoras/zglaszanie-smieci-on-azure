var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  fs.readFile('subscription_key.txt', (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.send("Subscription key not found");
    } 
    console.log(data.toString());
    res.render('index', { title: 'Express', subscriptionKey: data.toString().trim() });
  });
});

module.exports = router;
