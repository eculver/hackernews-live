#!/usr/local/bin/node

var fs = require('fs'),
    sys = require('sys'),
    http = require('http'),
    io = require('socket.io'),
    events = require('events'),
    scraper = require('scraper');

// this will spit out events when new news arrives.
var newsEmitter = new events.EventEmitter();

// how often to ask for more news from HN, in milliseconds.
var POLL_INTERVAL = 3000;

// our news object that we'll diff against.
var sharedNewsObj = {
    items: [],
    dirty: []
};

// grabs news from unofficial HN API (http://api.ihackernews.com)
// and fires the 'new_news' event.
function getNews() {
    sys.puts("fetching news...");
    
    //request({uri:'http://news.ycombinator.com'}, function(error, response, data) {
    scraper('http://news.ycombinator.com', function(error, $) {
        //if (!error && response.statusCode == 200) {
        if(!error) {
            
            // parse document to extract what we need.
            var titles_e = $('table table:eq(1) td.title a');
            var titles = [];
            titles_e.each(function() {
                var url = $(this).attr('href');
                var title = $(this).text();
                titles.push({
                    url: url,
                    title: title
                });
            });
            
            // remove last item
            titles.splice(titles.length - 1, 1);
            
            var details_e = $('table table:eq(1) td.subtext');
            var details = [];
            details_e.each(function() {
                var detailsTokens = $(this).text().split(' ');
                if(detailsTokens.length > 9) {
                    var id = $(this).find('a:eq(1)').attr('href').replace('item?id=', '');
                    var points = detailsTokens[0];
                    var postedBy = detailsTokens[3];
                    var postedAgo = detailsTokens[4] + ' ' + detailsTokens[5] + ' ' + detailsTokens[6];
                    
                    // comment count is 0 when only 10 tokens present
                    var commentCount = detailsTokens.length == 10 ? 0 : detailsTokens[9];
                    
                    details.push({
                        id: id,
                        points: points,
                        postedBy: postedBy,
                        postedAgo: postedAgo,
                        commentCount: commentCount
                    });
                }
                
                else {
                    sys.puts("could not parse details :(");
                }
            });
            
            
            // merge the two (titles and details into one final object)
            newsObj = { items: [] }
            if(titles.length == details.length) {
                for(var i=0; i<titles.length; i++) {
                    newsObj.items.push({
                        id: details[i].id,
                        url: titles[i].url,
                        title: titles[i].title,
                        points: details[i].points,
                        postedBy: details[i].postedBy,
                        postedAgo: details[i].postedAgo,
                        commentCount: details[i].commentCount
                    });
                }
            }
            
            
            //sys.puts("titles: " + titles.length);
            //sys.puts("details: " + details.length);
            
            /*
            var window = jsdom.jsdom(data).createWindow();
            jsdom.jQueryify(window, '../js/lib/jquery-1.4.4.js', function() {
                // jquery is now loaded on the jsdom window created from 'data'
                var itemTable = window.$('table table tr');
                //sys.puts("rows: " + itemTable.length);
            });
            */
            //var newsObj = JSON.parse(data);
            if(newsObj.items && newsObj.items.length > 0) {
                sys.puts("found some news!");
                
                // first time fetching news
                if(sharedNewsObj.items.length == 0) {
                    sys.puts("emitting 'new_news' on initial data seek'");
                    sharedNewsObj = newsObj;
                    sharedNewsObj.dirty = [];
                    newsEmitter.emit('new_news', sharedNewsObj);
                }
                
                else {
                    // for testing diff and animation
                    //shared_news_obj.items[0].commentCount = 25;
                    //shared_news_obj.dirty[0] = 5; // fifth list element will be animated.
                    
                    // iterate over items to see if a descrpancy exists.
                    sharedNewsObj.items.forEach(function(v, idx, a) {
                        // handle descrepancy.
                        // important fields: id, points, postedAgo, commentCount
                        if(v.id != newsObj.items[idx].id ||
                           v.points != newsObj.items[idx].points ||
                           v.postedAgo != newsObj.items[idx].postedAgo ||
                           v.commentCount != newsObj.items[idx].commentCount) {
                            sharedNewsObj.items[idx] = newsObj.items[idx];
                            sharedNewsObj.dirty.push(idx);
                        }
                    });
                    
                    // only emit an event when the list is 'dirty'
                    if(sharedNewsObj.dirty.length > 0) {
                        sys.puts("emitting 'new_news' due to dirty list");
                        newsEmitter.emit('new_news', sharedNewsObj);
                        sharedNewsObj.dirty = [];
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
getNews();
setInterval(getNews, POLL_INTERVAL);

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
    if(sharedNewsObj.items.length > 0) {
        message = { type: 'news',
                    news: sharedNewsObj }
                    
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
    
    newsEmitter.on('new_news', handleNews);
    
    client.on('disconnect', function() {
        sys.puts("client disconnected");
        newsEmitter.removeListener('new_news', handleNews)
    });
});

sys.puts("Server running at http://localhost:8080/");
