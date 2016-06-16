var compress = require('compression')
var cors = require('cors')
var debug = require('debug')('instant')
var downgrade = require('downgrade')
var express = require('express')
var fs = require('fs')
var http = require('http')
var https = require('https')
var parallel = require('run-parallel')
var path = require('path')
var pug = require('pug')
var pump = require('pump')
var unlimited = require('unlimited')
var url = require('url')

var config = require('../config')

var secret, secretKey, secretCert
try {
  secret = require('../secret')
  secretKey = fs.readFileSync(path.join(config.rootPath, 'secret/peerdb.io.key'))
  secretCert = fs.readFileSync(path.join(config.rootPath, 'secret/peerdb.io.chained.crt'))
  console.log(secret)
} catch (err) {}

var app = express()
var httpServer = http.createServer(app)
var httpsServer
if (secretKey && secretCert) {
  httpsServer = https.createServer({ key: secretKey, cert: secretCert }, app)
}

unlimited()

// Templating
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.set('x-powered-by', false)
app.engine('pug', pug.renderFile)

app.use(compress())

app.use(function (req, res, next) {
  // Force SSL TODO
  // if (config.isProd && req.protocol !== 'https') {
  //   return res.redirect('https://' + (req.hostname || 'peerdb.io') + req.url)
  // }

  // Redirect www to non-www
  if (config.isProd && req.hostname === 'www.peerdb.io') {
    return res.redirect('https://peerdb.io' + req.url)
  }

  // Use HTTP Strict Transport Security TODO
  // Lasts 1 year, incl. subdomains, allow browser preload list
  // if (config.isProd) {
  //   res.header(
  //     'Strict-Transport-Security',
  //     'max-age=31536000; includeSubDomains; preload'
  //   )
  // }

  // Add cross-domain header for fonts, required by spec, Firefox, and IE.
  var extname = path.extname(url.parse(req.url).pathname)
  if (['.eot', '.ttf', '.otf', '.woff', '.woff2'].indexOf(extname) >= 0) {
    res.header('Access-Control-Allow-Origin', '*')
  }

  // Prevents IE and Chrome from MIME-sniffing a response. Reduces exposure to
  // drive-by download attacks on sites serving user uploaded content.
  res.header('X-Content-Type-Options', 'nosniff')

  // Prevent rendering of site within a frame.
  res.header('X-Frame-Options', 'DENY')

  // Enable the XSS filter built into most recent web browsers. It's usually
  // enabled by default anyway, so role of this headers is to re-enable for this
  // particular website if it was disabled by the user.
  res.header('X-XSS-Protection', '1; mode=block')

  // Force IE to use latest rendering engine or Chrome Frame
  res.header('X-UA-Compatible', 'IE=Edge,chrome=1')

  next()
})

// TODO: secure user uploads folder
//  - set header that renders the file inert
//  - content disposition
app.use('/uploads', cors(), express.static(config.uploadsPath))

app.use(express.static(config.staticPath))

app.get('/', function (req, res) {
  res.render('index', {
    title: 'PeerDB - TODO'
  })
})

app.post('/uploads', function (req, res) {
  var key = req.query.key
  if (key.includes('.') || key.length !== 40) {
    return res.status(400).end('Bad data')
  }

  var filePath = path.join(config.uploadsPath, key)

  var isTorrent = Boolean(req.query.torrent)
  if (isTorrent) {
    filePath += '.torrent'
  }

  var file = fs.createWriteStream(filePath)

  pump(req, file, function (err) {
    if (err) {
      error(err)
      res.status(500)
    } else {
      res.status(200)
    }
    res.end()
  })
})

app.get('*', function (req, res) {
  res.status(404).render('error', {
    title: '404 Page Not Found - PeerDB',
    message: '404 Not Found'
  })
})

// error handling middleware
app.use(function (err, req, res, next) {
  error(err)
  res.status(500).render('error', {
    title: '500 Server Error - PeerDB',
    message: err.message || err
  })
})

var tasks = [
  function (cb) {
    httpServer.listen(config.ports.http, config.host, cb)
  }
]

if (httpsServer) {
  tasks.push(function (cb) {
    httpsServer.listen(config.ports.https, config.host, cb)
  })
}

parallel(tasks, function (err) {
  if (err) throw err
  debug('listening on port %s', JSON.stringify(config.ports))
  downgrade()
})

function error (err) {
  console.error(err.stack || err.message || err)
}
