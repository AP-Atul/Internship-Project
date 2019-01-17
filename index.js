var   session        = require('express-session');
const passwordHash   = require('password-hash');
const express        = require('express');
const path			     = require('path');
const bodyParser     = require('body-parser');
//express app created
const app            = express();
//use it for routing
const mysql 		     = require('mysql');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.set('view engine', 'ejs');

//Routing to further dir
app.use(express.static('./views/'));

// register the session with it's secret ID
app.use(session({secret: 'ijuststoredthesession'}));



//Database Connection
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "priish"
});

con.connect(function (err) {
  if (err) console.log(err);
  console.log("Database Connected");
});

//Routing to MainEngine
require('./engine')(app, con);


//Server Details
const port = 8000;
var server = app.listen(port, function () {
   console.log(port);
})