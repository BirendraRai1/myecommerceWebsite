var express=require('express');
var app=express();
var mongoose=require('mongoose');
var session=require('express-session');
var logger=require('morgan');
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var path=require('path');


app.use(logger('dev'));
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());


app.use(session({
	name             :'ecommerceCookie',
	secret           :'myAppsecret',
	resave           :true,
	httpOnly         :true,
	saveUninitialized :true,
	cookie            :{secure:false}
}));


app.set('view engine','jade');
app.set('views',path.join(__dirname+'/app/views'));

var dbPath="mongodb://localhost/flipkart"
db=mongoose.connect(dbPath);
mongoose.connection.once('open',function(){
	console.log("database connection open success");
});

var fs=require('fs');

fs.readdirSync('./app/models').forEach(function(file){
	if(file.indexOf('.js')){
		require('./app/models/'+file);
	}
});


fs.readdirSync('./app/controllers').forEach(function(file){
	if(file.indexOf('.js')){
		var route=require('./app/controllers/'+file);
		route.controllerFunction(app);
	}
});

app.listen(3000,function(){
	console.log("app listening on port 3000");
});