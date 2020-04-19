// app.js


const express = require("express");
var bodyParser = require("body-parser");
var app = express();







// set the template engine to ejs
app.set('view engine', 'ejs');

// Tells node to look in public/ for styles
app.use(express.static(__dirname + "/public"));

// Middleware
// accept json
app.use(bodyParser.json());

// makes data that comes to the server from the client a json object
app.use(bodyParser.urlencoded({extended: true}));



// route to base domain
app.get("/", function(req, res){
    res.render("home.ejs");
});

// route to base domain
app.get("/home", function(req, res){
    res.render("home.ejs");
});







// anything that hasn't matched a defined route is caught here
app.get("/*", function(req, res){
    res.render("error.ejs");
});


// listens for http requests
// port 3000 is for C9, port 8080 is for Heroku
app.listen(process.env.PORT || 3000 || 8080, function(){
    console.log("Server is running");
});