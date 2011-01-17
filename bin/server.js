#!/usr/local/bin/node

var fs = require('fs'),
    sys = require('sys'),
    http = require('http'),
    io = require('socket.io'),
    events = require('events');
    request = require('request');
    //express = require('express');

// this will spit out events when new news arrives.
var news_emitter = new events.EventEmitter();

// how often to ask for more news from HN, in milliseconds.
var POLL_INTERVAL = 10000; 

// our news object that we'll diff against
var shared_news_obj = [];

function get_news() {
    sys.puts("fetching news...");
    
    request({uri:'http://api.ihackernews.com/page'}, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            
            //sys.puts("response:");
            //sys.puts(data);
            
            var news_obj = JSON.parse(data);
            if(news_obj.items && news_obj.items.length > 0) {
                // diff the two to see if anything new has shown up.
                
                sys.puts("found some news! (" + news_obj.items.length + ")");
                news_emitter.emit('new_news', news_obj.items);
                
                
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
    news_emitter.on('new_news', function(news) {
        sys.puts("sending message...");
        
        // Give the message a type, so the FE can act on various different
        // messages should the need arise.
        message = { type: 'news',
                    news: news }
        
        client.send(message);
    });
});

sys.puts("Server running at http://localhost:8080/");
