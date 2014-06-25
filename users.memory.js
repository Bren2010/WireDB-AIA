/**
* An example data layer for peers.  Just stores the information in memory.
*/
var config = require('config')
var qs     = require('querystring')
var Q      = require('q')

module.db = {
    'user1:pass1' : ['a', 'b', 'c'],
    'user2:pass2' : ['b', 'd'],
}

/**
* Authentication middleware.
*/
module.exports.auth = function *(next) {
    var query = qs.parse(this.request.querystring)
    var ok = 1

    ok &= typeof query.chall !== "undefined" && query.chall !== null
    if (ok) {
        ok &= typeof module.db[query.chall] === "object"
        ok &= module.db[query.chall] instanceof Array
    }

    if (ok === 1) {
        this.attrs = module.db[query.chall]
        yield next;
    } else {
        this.body = 'Permission denied.'
    }
}
