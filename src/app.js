var express = require('express');
var app = express();
app.use(express.static('assets'));

app.use(function(req, res){
    res.sendStatus(404);
});

app.listen(3002, function () {
  console.log('Roobottom.com running at localhost:3002');
});

//routes
app.get('/', function (req, res) {

}