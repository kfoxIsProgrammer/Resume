
var compression = require('compression');
var express = require('express');
var app = express();

app.use(compression());
app.use(express.static(__dirname + '/Resume'));

app.get('/', function(req, res) {
    res.render('index.html');
});

app.listen(3000, () => console.log('Started Server on port 3000'));
