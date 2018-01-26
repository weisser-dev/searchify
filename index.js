// required imports
var config = require("./config.json");
var message = require("./message.js");

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');

var https = require('https');

var pub = __dirname + '/public';
app.use(express.static(pub));

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send("Test");
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'GET_YOUR_FUCKING_OWN_TOKEN') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
})

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {   
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        message.sendText(sender,event);
       
        if (event.message && event.message.text) {
            text = event.message.text.toLowerCase();
            doSearch(sender, text, 1);
            break;
        }
    }
    res.sendStatus(200);
})

function doSearch(sender, query, index) {
    var url = config.searchUrl + encodeURI(query);
    if(index != null) {
        url = url + "&start=" + index;
    } else {
        index = 1;
    }

    request({ 
        url: url, 
        followRedirect: false,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if(body != null && body.items != null) {
                var searchResults = [];
                var results = body.items;
                for(var i = 0; i < results.length; i++) {
                    result = {};
                    result.title = results[i].title;
                    result.url = results[i].link;
                    result.subtitle = results[i].snippet;
                    if(results[i].pagemap != null && results[i].pagemap.cse_image != null) {
                        result.image_url = results[i].pagemap.cse_image[0].src;
                    } 
                    searchResults.push(result);
                }

                if(searchResults.length > 0) {
                    message.sendResultList(sender, searchResults, query, index);
                }
            }
        }
    });
}

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
})
