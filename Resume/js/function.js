





	
	

 var updateView = function()  {
			var mysql = require('mysql');
		var con = mysql.createConnection({
	host: "localhost",
	user: "ubuntu",
	password: "kevinAdmin",
	database: "views"
	});
var sql = "update set viewnumber = viewnumber + 1 where id = 1";		
		
	con.connect(function(err){
		if (err) throw err;
		console.log("Connected!");
		con.query(sql, function (err, result,fields) {
		if (err) throw err;
		console.log("Result: " + result);
		
    });
  });
 }
	

     var getView = function(){
		  return 5;
//var mysql = require('mysql');		  
		/*  var con = mysql.createConnection({
	host: "localhost",
	user: "ubuntu",
	password: "kevinAdmin",
	database: "views"
	});
var selected = "select viewnumber from views where id = 1";	
	con.connect(function(err){
   if (err) throw err;
		console.log("Connected!");
		con.query(selected, function (err, result,fields) {
		if (err) throw err;
		console.log(result[0].viewnumber);
		return result[0].viewnumbers;
    });
  });
  */
	}
	
	module.exports = {
		updateView: updateView,
		getView: getView
	}
		



