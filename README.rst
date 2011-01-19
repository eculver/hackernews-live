Hackernews Live
===============

This is just a little toy project that uses `Node.js <http://nodejs.org/>`_,
`Socket.IO <http://socket.io/>`_, and `node-scraper 
<https://github.com/mape/node-scraper/>`_ to generate a live view of the
`hackernews homepage <http://news.ycombinator.com/>`_. The look and feel was
inspired by the `Comfy Hacker News <https://comfy-helvetica.jottit.com/>`_ 
Hackernews stylesheet.

A live demo can be seen at http://hnlive.evanculver.com/.

Running the site yourself
=========================

I developed the code against:

Node.js v0.2.6

Socket.IO v0.6.8

scraper v0.0.6

It'll probably work against older versions, but this is just what I had
installed at the time of development.

Make sure you have `Node.js <http://nodejs.org/>`_ and `npm 
<http://npmjs.org/>`_ installed. If you don't, see `this gist 
<https://gist.github.com/661852>`_ on getting up and running quickly.

Installing dependencies
-----------------------

Once you have node and npm installed, the only other dependencies are request
and Socket.IO::

    npm install scraper socket.io


Running the code
----------------

1. Pull the code down::

        git clone https://github.com/eculver/hackernews-live.git

2. Start the Node.js server::

        cd hackernews-live
        node bin/server.js

3. Visit the static markup in a browser:

    file:///path/to/hackernews-live/index.html

You should see an HN-like site, that updates itself automagically.