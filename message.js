module.exports = {
    sendText: function(sender, text) {
        messageData = {
            text:text
        }
        sendObj(sender, messageData);
    },

    //function to send button
    sendButton: function(sender, type, url, title) {
        messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "buttons":[{
                        "type":type,
                        "url":url,
                        "title":title
                      }
                    ]
                }
            }
        }
        sendObj(sender, messageData);
    },

    // function to echo back messages
    sendGeneric: function(sender) {
        messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "First card",
                        "subtitle": "Element #1 of an hscroll",
                        "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                        "buttons": [{
                            "type": "web_url",
                            "url": "https://www.messenger.com",
                            "title": "web url"
                        }, {
                            "type": "postback",
                            "title": "Postback",
                            "payload": "Payload for first element in a generic bubble",
                        }],
                    }, {
                        "title": "Second card",
                        "subtitle": "Element #2 of an hscroll",
                        "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                        "buttons": [{
                            "type": "postback",
                            "title": "Postback",
                            "payload": "Payload for second element in a generic bubble",
                        }],
                    }]
                }
            }
        }
        sendObj(sender, messageData);
    },

    sendJson: function(sender, jsonName) {
        var json = require("./" + jsonName);
        sendObj(sender, json);
    },

    sendResultList: function(sender, searchResults, query, index) {
        messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "compact",
                    "elements": [],
                     /*"buttons": [
                        {
                            "title": "View More",
                            "type": "postback",
                            "payload": "more:" + query + "~~" + (index + searchResults.length)                        
                        }
                    ]  */
                }
            }
        }
        for(var i = 0; i < searchResults.length; i++) {
            messageData.attachment.payload.elements.push({});
            messageData.attachment.payload.elements[i].title = searchResults[i].title;
            messageData.attachment.payload.elements[i].image_url = searchResults[i].image_url;
            messageData.attachment.payload.elements[i].subtitle = searchResults[i].subtitle;
            messageData.attachment.payload.elements[i].default_action = {};
            messageData.attachment.payload.elements[i].default_action.type= "web_url";
            messageData.attachment.payload.elements[i].default_action.url= searchResults[i].url;
           // messageData.attachment.payload.elements[i].default_action.messenger_extensions = true;
            messageData.attachment.payload.elements[i].default_action.webview_height_ratio = "full";

            //messageData.attachment.payload.elements[i].buttons = [];
            //messageData.attachment.payload.elements[i].buttons.push(newUrlButton(config.productUrl + productArr[i].id, "Zum Produkt"));
            //if(productArr[i].similarId != null) {
            //    messageData.attachment.payload.elements[i].buttons.push(newPostBackButton("Ähnliche Produkte", "similar_products:" + productArr[i].similarId));
            //}
        }
    sendObj(sender, messageData);
    }
}

var request = require('request');
var config = require("./config.json");

function sendObj(sender, messageData) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:config.token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    })
    // for local testing - if sender == 0, print messageData to console
    if(sender === 0) {
        console.log(messageData);
    }
}

function newUrlButton(url, title) {
    button = {
        "type": "web_url",
        "url": url,
        "title": title
    }
    return button;
}

function newPostBackButton(title, payload) {
    button = {
        "type": "postback",
        "title": title,
        "payload": payload
    }
    return button;
}

