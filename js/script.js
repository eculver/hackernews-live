/*
 *  File: script.js
 *  Created On: 01/15/11
 *  Created By: Evan Culver
 *  Details: Sets up socket
 */

// For socket.io flash fallback
WEB_SOCKET_SWF_LOCATION = 'swf/WebSocketMain.swf';

// Define Array.forEach if it doesn't exist (for convenience)
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn){
        for ( var i = 0; i < this.length; i++ ) {
            fn( this[i], i, this );
        }
    };
}

// Mustache.js templates
var templates = {
    // template for news list item
    news_item: "<li id='news-item-{{id}}'>\
                    <a href='{{url}}' title='{{title}}' class='news-item-title'>{{title}}</a>\
                    <div class='news-details'>\
                        <span class='points'>{{points}} points by</span>\
                        <span class='posted-by'><a href='http://news.ycombinator.com/user?id={{postedBy}}'>{{postedBy}}</a></span>\
                        <span class='posted-on'>{{postedAgo}}</span> |\
                        <span class='comment-count'>\
                            <a href='http://news.ycombinator.com/item?id={{id}}'>\
                                {{commentCount}} comments\
                            </a>\
                        </span>\
                    </div>\
                </li>"
}


/*
 *  Socket.io setup and execution
 */
var socket = new io.Socket('localhost', {port: 8080, rememberTransport: false});
socket.connect();

// fired on client connect.
socket.on('connect', function(){
    //console.log('connected');
});

// fired when client recieves a message.
socket.on('message', function(message){
    //console.log('message');
    
    // handle new news.
    if(message.type == 'news' && message.news && message.news.length > 0) {
        // reset the messages container.
        $('#messages').html('');
        
        // iterate over news items.
        message.news.forEach(function(item, idx, a) {
            // use Mustache to generate the markup to append.
            $('#messages').append(Mustache.to_html(templates.news_item, item));
        });
    }
});

// fired on client disconnect.
socket.on('disconnect', function(){
    //console.log('disconnected');
});





















