Hackernews Live
===============

This is just a little toy project that uses `Node.js <http://nodejs.org/>`_, 
`Socket.IO <http://socket.io/>`_ and the `unofficial Hacker News API 
<http://api.ihackernews.com/>`_ with some look and feel inspiration from 
`Comfy Hacker News <https://comfy-helvetica.jottit.com/>`_ to generate a 
live view of the `hackernews homepage <http://news.ycombinator.com>`_.

The live demo can be seen at http://hnlive.evanculver.com/.

Running the site yourself
=========================

I developed the code against:

Node.js v0.3.1

Socket.IO v0.6.8

request v0.10.0

It'll probably work against older versions, but this is just what I had
installed at the time of development.

Make sure you have `Node.js <http://nodejs.org/>`_ and `npm 
<http://npmjs.org/>`_ installed. If you don't, see `this gist 
<https://gist.github.com/661852>`_ on getting up and running quckly.

Installing dependencies
-----------------------

Once you have node and npm installed, the only other dependencies are request
and Socket.io::

    npm install request socket.io


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