var assert = require('assert')
var config = require('config')
var http = require('http')
var bencode = require('bencode')

var caesar = {
    kts: require('./../caesar/kts'),
    tree: require('./../caesar/tree')
}
var sjcl = require('./../sjcl')

var loc = 'http://localhost:' + config.port + '/?chall=user1:pass1'

var fetch = function(query, done) {
    http.get(loc + query, function (res) {
        var buff = new Buffer(0)

        res.on('data', function(data) {
            buff = Buffer.concat([buff, data])
        })

        res.on('end', function() {
            done(buff)
        })
    })
}

var c = sjcl.ecc.curves[config.key.curve]
var bits = sjcl.codec.hex.toBits(config.key.pub)
var pubKey = new sjcl.ecc.ecdsa.publicKey(c, bits)

it('Verifying cryptography', function (done) {
    fetch('', function (res) {
        var obj = bencode.decode(res, 'utf8')

        var c = Math.pow(2, Math.ceil(Math.log(obj.attrs.length) / Math.log(2)))
        c = c - obj.attrs.length

        if (c === 0) { obj.attrs.push('0000000000') }

        var tree = new caesar.tree.Committer(obj.attrs, 'sha1')
        var signer = new caesar.kts.Signer(1, obj.seed)

        tree.vals[tree.vals.length - 1] = signer.getPublicKey()

        var head = sjcl.codec.hex.toBits(tree.getCommit())
        var sig = sjcl.codec.base64.toBits(obj.sig)

        pubKey.verify(head, sig)

        done()
    })
})
