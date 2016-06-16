var path = require('path')

exports.isProd = process.env.NODE_ENV === 'production'

// exports.host = exports.isProd && '23.239.22.146'

exports.ports = {
  http: 9200,
  https: 9201
}

exports.rootPath = __dirname

exports.staticPath = path.join(__dirname, 'static')

exports.uploadsPath = path.join(__dirname, 'uploads')
