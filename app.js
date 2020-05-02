// app.js


const express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mysql = require('mysql');



const production_environment = process.env.PRODUCTION;
console.log("Production="+production_environment);

var connection;

if ( process.env.PRODUCTION == "TRUE"){
    connection = mysql.createConnection({
        host: 'us-cdbr-east-06.cleardb.net',
        user: 'b22500485272d5',
        password: 'b511a945',
        database: 'heroku_66ec8100dd2a87c'
    });
}
else{
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'seantowne',
        password: 'password',
        database: 'Lab9'
    });
}
connection.connect();


app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



function buildStatement(firstname, lastname, keyword, catagory, sex){
    var stmt = "SELECT * FROM l9_author natural join l9_quotes";
    var searchTerms = [];
    
    console.log("First Name: " + firstname);
    if ( typeof firstname !== 'undefined' && firstname ){
        searchTerms.push(
            " l9_author.firstName='" + firstname + "'"  
        );
    }
    
    console.log("Last Name : " + lastname);
    if ( typeof lastname !== 'undefined' && lastname ){
        searchTerms.push(
            " l9_author.lastName='" + lastname + "'"  
        );
    }
    
    console.log("Keyword : " + keyword);
    if ( typeof keyword !== 'undefined' && keyword ){
        searchTerms.push(
            " l9_quotes.quote like '%" + keyword + "%'"  
        );
    }
    
    console.log("Catagory : " + catagory);
    if ( typeof catagory !== 'undefined' && catagory ){
        searchTerms.push(
            " l9_quotes.category='" + catagory + "'"  
        );
    }
    
    console.log("Sex : " + sex);
    if ( typeof sex !== 'undefined' && sex ){
        searchTerms.push(
            " l9_author.sex='" + sex + "'"  
        );
    }
    
    console.log("Search Terms Length: " + searchTerms.length.toString());
    
    if ( searchTerms.length > 0){
        stmt += " where";
        for(var i in searchTerms){
            stmt += searchTerms[i];
            if( i == searchTerms.length-1){
                break;
            }
            stmt += " and";
        }
    }
    
    return stmt+";";
}

function getCatagories(){
    stmt = "select distinct category from l9_quotes;"
    var data = {};
    connection.query(stmt, function(error, found){
        if ( error ) throw error;
        data = found;
    });
    return data;
}

app.get("/", function(req, res){
    console.log("/ : GET");
    firstname = req.query.firstname;
    lastname = req.query.lastname;
    keyword = req.query.keyword;
    catagory = req.query.catagory;
    sex = req.query.sex;
    
    stmt = buildStatement(firstname, lastname, keyword, catagory, sex);
    console.log(stmt);
    
    connection.query( stmt, function(error, found0){
        if ( error ) throw error;
        connection.query( "select distinct category from l9_quotes;", function(error, found1){
            if ( error ) throw error;
            res.render("home.ejs", { data : found0, cat : found1 })
        });
    });
});


app.get("/*", function(req, res){
    res.render("error.ejs");
});



app.listen(process.env.PORT || 3000 || 8080, function(){
    console.log("Server is running");
});