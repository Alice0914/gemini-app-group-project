const express = require('express');

const app = express();
var  path = require('path');

app.listen(5080, function(){

    console.log('Server is running on port 5080');
});


app.get('/', function(req, res) {
    // res.send('Hello World');
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(path.join(__dirname, '/')));