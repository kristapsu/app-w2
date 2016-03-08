var express = require('express');

var app = express();

var bodyParser = require('body-parser');


// cors- express server addon 
var cors = require('cors');

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var _statuses = [];

app.use(express.static('app'));

app.get('/statuses', function(req, res) {
  res.json(_statuses);
});

app.post('/statuses', function(req, res) {
  var newStatus = req.body;
  newStatus.id = _statuses.length;

  console.log('Adding new status:');
  console.log(newStatus);

  _statuses.push(newStatus);
  res.status(201).json(newStatus);
});

app.listen(8080, function(){
  console.log('Server up and running');
});
