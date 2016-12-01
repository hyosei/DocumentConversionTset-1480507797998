/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

var fs = require("fs");
var multer = require("multer");

var watson = require('watson-developer-cloud');

const document_conversion = watson.document_conversion({
  username: 'a51ca65e-776c-42e8-bb5b-4480d952e1c0',
  password: 'mlo67ua6vBXB',
  version: 'v1',
  version_date: '2015-12-15'
});

// custom configuration
var config = {
   html_to_answer_units: {
        selectors: [".course","div.professor","div.time","div.college","div.major","div.weight","div.credit","div.pnp","div.url","div.mileage","div.rating"]
    }
}

app.post("/simpleupload", multer({ dest: "./uploads"}).single("uploadedFile"), function(req,res){
	console.log(req.file);
	var originalFileName = req.file.originalname.split(".")[0];
	var uploadedFileName = req.file.filename;
	var fileExtension = req.file.originalname.split(".")[1];
	fs.exists("./uploads/" + uploadedFileName, /*@callback */ function(exists){
		fs.rename("./uploads/" + uploadedFileName, "./uploads/" + uploadedFileName + "." + fileExtension, function(err){
  			if(err) {
  				console.log(err);
  			} else {
				document_conversion.convert({
					file: fs.createReadStream("./uploads/" + uploadedFileName + "." + fileExtension),
					conversion_target: 'ANSWER_UNITS',
					// Use a custom configuration.
					config: config
					}, function (err, response) {
					if (err) {
						console.error(err);
					} else {
						res.json(JSON.stringify(response, null, 2));
					}
				});
  			}
  		});
	});
});
