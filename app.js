// app.js


const express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mysql = require('mysql');



const production_environment = process.env.PRODUCTION;
console.log("Production="+production_environment);

var dbConfig;
if ( process.env.PRODUCTION == "TRUE"){
    dbConfig = {
        host: 'us-cdbr-east-06.cleardb.net',
        user: 'b22500485272d5',
        password: 'b511a945',
        database: 'heroku_66ec8100dd2a87c',
        port: 3306
    };
}
else{
    dbConfig = {
        host: 'localhost',
        user: 'seantowne',
        password: 'password',
        database: 'Lab9',
        port: 3306
    };
}

var connection;
function handleDisconnect() {
    connection = mysql.createConnection(dbConfig);  // Recreate the connection, since the old one cannot be reused.
    connection.connect( function onConnect(err) {   // The server is either down
        if (err) {                                  // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 10000);    // We introduce a delay before attempting to reconnect,
        }                                           // to avoid a hot loop, and to allow our node script to
    });                                             // process asynchronous requests in the meantime.
                                                    // If you're also serving http, display a 503 error.
    connection.on('error', function onError(err) {
        console.log('db error', err);
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {   // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                        // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}
handleDisconnect();


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