/**
* An example data layer for peers.  Just stores the information in memory.
*/
var config = require('config')
var Q      = require('q')

module.db = {}

/**
* Authentication middleware.
*/
module.exports.auth = function *(next) {
    yield next
}

/**
* Attribute-fetching middleware.
*/
module.exports.getAttributes = function () {
    return Q(['hello', 'goodbye', 'balls'])
}
