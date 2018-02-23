# peerdb-www [![travis][travis-image]][travis-url]

[![Greenkeeper badge](https://badges.greenkeeper.io/feross/peerdb-www.svg)](https://greenkeeper.io/)

[travis-image]: https://img.shields.io/travis/feross/peerdb-www/master.svg
[travis-url]: https://travis-ci.org/feross/peerdb-www

### TODO -- WORK IN PROGRESS

Download/upload files using the [WebTorrent](http://webtorrent.io) protocol (BitTorrent
over WebRTC). This is a beta.

Powered by [WebTorrent](http://webtorrent.io), the first torrent client that works in the
browser without plugins. WebTorrent is powered by JavaScript and WebRTC. Supports Chrome,
Firefox, Opera (desktop and Android). Run <code>localStorage.debug = '*'</code> in the
console and refresh to get detailed log output.

## Install

If you just want to do file transfer on your site, or fetch/seed files over WebTorrent, then there's no need to run a copy of peerdb-www on your own server. Just use the WebTorrent script directly. You can learn more at https://webtorrent.io.

The client-side code that peerdb-www uses is [here](https://github.com/feross/peerdb-www/blob/master/client/index.js).

### Run a copy of this site on your own server

To get a clone of https://peerdb-www running on your own server, follow these instructions.

Get the code:

```
git clone https://github.com/feross/peerdb-www
cd peerdb-www
npm install
```

Modify the configuration options in [`config.js`](https://github.com/feross/peerdb-www/blob/master/config.js) to set the IP/port you want the server to listen on.

Copy [`secret/index-sample.js`](https://github.com/feross/peerdb-www/blob/master/secret/index-sample.js) to `secret/index.js` and set the Twilio API key if you want a [NAT traversal service](https://www.twilio.com/stun-turn) (to help peers connect when behind a firewall).

To start the server, run `npm start`. That should be it!

## License

MIT. Copyright (c) [WebTorrent, LLC](https://webtorrent.io).

