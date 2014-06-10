// WireDB Attribute Issuing Authority
// All of the cryptography is based on:
// http://bren2010.github.io/jekyll/update/2014/05/30/one-time-attribute-based-signatures.html

// Notes:
// 1.  This should be behind a TLS tunnel.
// 2.  User certificates are the preferred form of authentication.  The TLS
//     tunnel can pass them along as HTTP headers over a secure network.

var koa = require('koa')
var config = require('config')
var bencode = require('bencode')
var caesar = require('caesar')

var users = require('./users.' + config.database + '.js')
var time = require('./time.' + config.database + '.js')

// Load middleware.
var logger = require('koa-logger')

// Setup
var app = koa()
app.use(logger())
app.use(users.auth)

// Request Handlers
app.use(function *(next) {
    this.set('Content-Type', 'text/plain')

    // Generate the trustee's secret key.

    // Find their set of attributes.
    attrs = yield users.getAttributes

    this.body = bencode.encode(attrs)
})

// Start tracker.
app.listen(config.port)
console.log('AIA up at:  http://localhost:' + config.port + '/')
