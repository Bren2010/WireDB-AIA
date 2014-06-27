var assert = require('assert')
var config = require('config')
var http = require('http')
var bencode = require('bencode')

var loc = 'http://localhost:' + config.port + '/?chall='

console.log('AIA server must be running!')

describe('Authentication', function() {
    it('should authenticate user #1', function (done) {
        var chall = 'user1:pass1'
        var attrs = ['a', 'b', 'c']

        http.get(loc + chall, function (res) {
            var buff = new Buffer(0)

            res.on('data', function(data) {
                buff = Buffer.concat([buff, data])
            })

            res.on('end', function() {
                try {
                    var obj = bencode.decode(buff, 'utf8')
                    var t = obj.attrs.pop()

                    assert.deepEqual(obj.attrs, attrs)
                    assert.equal(t, 'time=' + Math.floor(Date.now() / 1000))

                    done()
                } catch (err) {
                    throw 'Was expecting bencode, but got error:  ' + err
                }
            })
        })
    })

    it('should authenticate user #2', function (done) {
        var chall = 'user2:pass2'
        var attrs = ['b', 'd']

        http.get(loc + chall, function (res) {
            var buff = new Buffer(0)

            res.on('data', function(data) {
                buff = Buffer.concat([buff, data])
            })

            res.on('end', function() {
                try {
                    var obj = bencode.decode(buff, 'utf8')
                    var t = obj.attrs.pop()

                    assert.deepEqual(obj.attrs, attrs)
                    assert.equal(t, 'time=' + Math.floor(Date.now() / 1000))

                    done()
                } catch (err) {
                    throw 'Was expecting bencode, but got error:  ' + err
                }
            })
        })
    })

    it('should fail to authenticate unkown user', function (done) {
        var chall = 'herp:derp'

        http.get(loc + chall, function (res) {
            var buff = new Buffer(0)

            res.on('data', function(data) {
                buff = Buffer.concat([buff, data])
            })

            res.on('end', function() {
                var test = buff.toString()

                assert.equal(test, 'Permission denied.')

                done()
            })
        })
    })

    it('should fail to authenticate bad syntax', function (done) {
        http.get(loc, function (res) {
            var buff = new Buffer(0)

            res.on('data', function(data) {
                buff = Buffer.concat([buff, data])
            })

            res.on('end', function() {
                var test = buff.toString()

                assert.equal(test, 'Permission denied.')

                done()
            })
        })
    })
})
