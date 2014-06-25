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
var crypto = require('crypto')
var caesar = {
    kts: require('./caesar/kts'),
    tree: require('./caesar/tree')
}
var sjcl = require('./sjcl')

var users = require('./users.' + config.database + '.js')

// Load middleware.
var logger = require('koa-logger')

// Parse secret key.
var c = sjcl.ecc.curves[config.key.curve]
var secKey = new sjcl.ecc.ecdsa.secretKey(c, new sjcl.bn(config.key.sec))

// Setup
var app = koa()
app.use(logger())
app.use(users.auth)

// Request Handlers
app.use(function *(next) {
    this.set('Content-Type', 'text/plain')

    // Generate the trustee's secret key.

    // 1.0.  Make sure attrs.length isn't a power of two.
    var tmp = Object.create(this.attrs)
    var c = Math.pow(2, Math.ceil(Math.log(tmp.length) / Math.log(2)))
    c = c - tmp.length // Stolen from caesar.tree

    if (c === 0) { tmp.push('0000000000') }

    // 1.1.  Create tree.
    var tree = new caesar.tree.Committer(tmp, 'sha1')

    // 2.  Choose random value.
    var seed = crypto.randomBytes(20).toString('hex')

    // 3.  Calculate the public key of the random private key.
    var signer = new caesar.kts.Signer(1, seed)

    // 4.0.  Add pubKey to set of values to commit to.
    tree.vals[tree.vals.length - 1] = signer.getPublicKey()

    // 4.1.  Compute head.
    var head = tree.getCommit()

    // 5.  Compute signature.
    var sig = sjcl.codec.base64.fromBits(
        secKey.sign(sjcl.codec.hex.toBits(head))
    )

    this.body = bencode.encode({
        attrs: this.attrs,
        seed: seed,
        sig: sig
    })
})

// Start tracker.
app.listen(config.port)
console.log('AIA up at:  http://localhost:' + config.port + '/')
