#!/usr/local/bin/node

var fs = require('fs'),
    sys = require('sys'),
    http = require('http'),
    io = require('socket.io'),
    events = require('events'),
    request = require('request');

// this will spit out events when new news arrives.
var news_emitter = new events.EventEmitter();

// how often to ask for more news from HN, in milliseconds.
var POLL_INTERVAL = 3000;

// our news object that we'll diff against.
var shared_news_obj = {
    items: [],
    dirty: []
};

// grabs news from unofficial HN API (http://api.ihackernews.com)
// and fires the 'new_news' event.
function get_news() {
    sys.puts("fetching news...");
    request({uri:'http://api.ihackernews.com/page'}, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            var news_obj = JSON.parse(data);
            if(news_obj.items && news_obj.items.length > 0) {
                sys.puts("found some news!");
                
                // first time fetching news
                if(shared_news_obj.items.length == 0) {
                    sys.puts("emitting 'new_news' on initial data seek'");
                    shared_news_obj = news_obj;
                    shared_news_obj.dirty = [];
                    news_emitter.emit('new_news', shared_news_obj);
                }
                
                else {
                    // for testing diff and animation
                    //shared_news_obj.items[0].commentCount = 25;
                    //shared_news_obj.dirty[0] = 5; // fifth list element will be animated.
                    
                    // iterate over items to see if a descrpancy exists.
                    shared_news_obj.items.forEach(function(v, idx, a) {
                        // handle descrepancy.
                        // important fields: id, points, postedAgo, commentCount
                        if(v.id != news_obj.items[idx].id ||
                           v.points != news_obj.items[idx].points ||
                           v.postedAgo != news_obj.items[idx].postedAgo ||
                           v.commentCount != news_obj.items[idx].commentCount) {
                            shared_news_obj.items[idx] = news_obj.items[idx];
                            shared_news_obj.dirty.push(idx);
                        }
                    });
                    
                    // only emit an event when the list is 'dirty'
                    if(shared_news_obj.dirty.length > 0) {
                        sys.puts("emitting 'new_news' due to dirty list");
                        news_emitter.emit('new_news', shared_news_obj);
                        shared_news_obj.dirty = [];
                    }
                }
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
    res.close();
});

server.listen(8080);

// Websocket via socket.io 
var socket = io.listen(server); 

socket.on('connection', function(client){
    
    // if we have some news to give already, send it along immediately upon
    // connection instantiation.
    if(shared_news_obj.items.length > 0) {
        message = { type: 'news',
                    news: shared_news_obj }
                    
        client.send(message);
    }
    
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
