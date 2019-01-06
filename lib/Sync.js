var Factory = require('./Factory.js')
var error_stack = require('./Error.js')

var Sync = function(gen, _continue){

    if(this instanceof Sync === false) return new Sync(gen, _continue)
    var self = this

    var i = (function *init(){

        var factory = new Factory(i, { _continue : _continue })
        try { yield* gen.call(factory) } catch(err) {
            factory.emit('err', error_stack(err), err)
        }
        if(cb) cb()

    })()

    i.next()
    var cb = function(){ setImmediate(function(){ i.next() }) }
}

module.exports = Sync