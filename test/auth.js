var assert = require('assert')
var config = require('config')
var http = require('http')
var bencode = require('bencode')

var loc = 'http://localhost:' + config.port + '/?chall='

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

console.log('AIA server must be running!')

describe('Authentication', function() {
    it('should authenticate user #1', function (done) {
        var chall = 'user1:pass1'
        var attrs = ['a', 'b', 'c']

        fetch(chall, function (res) {
            try {
                var obj = bencode.decode(res, 'utf8')
                var t = obj.attrs.pop()
                var u = t.substr(t.indexOf(',') + 1)

                assert.equal(u, 'time=' + Math.floor(Date.now() / 1000))

                var i = 0,
                    len = obj.attrs.length

                for (i = 0; i < len; i++) {
                    var comma = obj.attrs[i].indexOf(',')
                    var attr = obj.attrs[i].substr(comma + 1)

                    assert.deepEqual(attr, attrs[i])
                }

                done()
            } catch (err) {
                throw 'Was expecting bencode, but got error:  ' + err
            }
        })
    })

    it('should authenticate user #2', function (done) {
        var chall = 'user2:pass2'
        var attrs = ['b', 'd']

        fetch(chall, function (res) {
            try {
                var obj = bencode.decode(res, 'utf8')
                var t = obj.attrs.pop()
                var u = t.substr(t.indexOf(',') + 1)

                assert.equal(u, 'time=' + Math.floor(Date.now() / 1000))

                var i = 0,
                    len = obj.attrs.length

                for (i = 0; i < len; i++) {
                    var comma = obj.attrs[i].indexOf(',')
                    var attr = obj.attrs[i].substr(comma + 1)

                    assert.deepEqual(attr, attrs[i])
                }

                done()
            } catch (err) {
                throw 'Was expecting bencode, but got error:  ' + err
            }
        })
    })

    it('should fail to authenticate unkown user', function (done) {
        var chall = 'herp:derp'

        fetch(chall, function (res) {
            var test = res.toString()

            assert.equal(test, 'Permission denied.')

            done()
        })
    })

    it('should fail to authenticate bad syntax', function (done) {
        fetch('', function (res) {
            var test = res.toString()

            assert.equal(test, 'Permission denied.')

            done()
        })
    })
})
