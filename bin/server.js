#!/usr/local/bin/node

var fs = require('fs'),
    sys = require('sys'),
    http = require('http'),
    io = require('socket.io'),
    events = require('events');
    request = require('request');

// this will spit out events when new news arrives.
var news_emitter = new events.EventEmitter();

// how often to ask for more news from HN, in milliseconds.
var POLL_INTERVAL = 10000; 

// our news object that we'll diff against
var shared_news_obj = [];

// grabs news from unofficial HN API (http://api.ihackernews.com)
// and fires the 'new_news' event.
function get_news() {
    sys.puts("fetching news...");
    request({uri:'http://api.ihackernews.com/page'}, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            var news_obj = JSON.parse(data);
            if(news_obj.items && news_obj.items.length > 0) {
                // TODO: diff the two to see if anything new has shown up as
                // opposed to just firing the event blindly.
                
                sys.puts("found some news!");
                news_emitter.emit('new_news', news_obj.items);
            }
            else {
                sys.puts("couldn't find news :(");
            }
        }
    });
}

// Get an initial bunch of news and start the news poller.
get_news();
setInterval(get_news, POLL_INTERVAL);

/* 
 *  Service setup
 */ 
server = http.createServer(function(req, res){ 
    res.writeHeader(200, {'Content-Type': 'text/html'}); 
    res.write('<h1>I Speak Websocket!</h1>'); 
    res.finish();
});

server.listen(8080);

// Websocket via socket.io 
var socket = io.listen(server); 

socket.on('connection', function(client){
    
    // New news callback/listener. Send it when we see it.
    var handleNews = function(news) {
        //sys.puts("sending message...");
        
        // Give the message a type, so the FE can act on various different
        // messages should the need arise.
        message = { type: 'news',
                    news: news }
        
        client.send(message);
    }
    
    news_emitter.on('new_news', handleNews);
    
    client.on('disconnect', function() {
        sys.puts("client disconnected");
        news_emitter.removeListener('new_news', handleNews)
    });
});

sys.puts("Server running at http://localhost:8080/");
