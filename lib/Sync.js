var util = require('util')
var event_emitter = require('events')

function error_stack(err){
    var stack = require('stack-trace').parse(err)

    var str = `${err} \n `
    stack.forEach(function(stack){
        str += '\n' +stack.fileName + ' on line ' + stack.lineNumber + ' column ' + stack.columnNumber + '\n'
    })

    return str
}

var temp = function(i){
            
    var self = this

    this.nextTick = function(){
        process.nextTick(function(){
            return self.next()
        })
    }
    
    this.next = function(params){ 
        setImmediate(function(){
            //self.err = null
            return i.next(params)
        }) 
    }

    this.throw = function(err, _continue, results){
       
        err = error_stack(err)
        setImmediate(function(){
            
            self.err = err

            if(_continue) {
                //self.emit('err', err)
                return i.next(results)
            }
            
            return i.throw(err) //throws error to try/catch 
        })       
    }

    this.sync = function(callback, _continue){
        
        callback(function(){
           
            var results = []
            var error_key = null
            for(var key in arguments){
                if(arguments[key] instanceof Error) {
                    error_key = key
                    arguments[key] = error_stack(arguments[key])
                }
                results.push(arguments[key])
            }

            if(error_key) return self.throw(arguments[error_key], _continue, results)
            else return self.next(results)
        })
    }

    this.async = {}
    this.async.each = function(array, func, _continue){
        if(!array) throw 'need to pass array into Sync -> async'
        if(!array.length) return self.next()
            
        if(func) self.on('data', func)

        var total = array.length
        var count = 0
        var cb = function(){

            count ++

            var results = []
            var error_key = null
            for(var key in arguments){
                if(arguments[key] instanceof Error) {
                    error_key = key
                    arguments[key] = error_stack(arguments[key])
                }
                results.push(arguments[key])
            }

            if(error_key) {
                
                if(func) self.removeListener('data', func)
                return self.throw(arguments[error_key], _continue, results) 

            }else self.emit('data', results, this.index)

            if(count === total) {

                self.emit('end')
                if(func) self.removeListener('data', func)
                
                return self.next()
            }
        }

        for(var _i = 0; _i < array.length; _i++){
            var _temp = function(){ return cb.bind(this) }
            _temp.prototype.index = _i
            array[_i](new _temp()) 
        }
    }
}

Function.prototype.sync = function(gen){
    var self = this
    return {
        run : function(obj){ 

            var callback = function(){

                var results = []
                for(var key in arguments){
                    if(arguments[key] instanceof Error) break
                    results.push(arguments[key])
                }

                if(arguments[key] instanceof Error) return gen.throw(arguments[key], _continue) 
                else return gen.next(results)
            }

            var args = []
            for (var i = 1; i < arguments.length; i++){
                args.push(arguments[i])
            }
            
            args.push(callback)
            self.apply(obj, args)
        }
    }
}

var Sync = function(callback){

    if(this instanceof Sync === false) return new Sync(callback)
    var self = this

    var i = (function *init(){

        util.inherits(temp, event_emitter)
        var Temp = new temp(i)
        
        try { yield* callback.call(Temp) } catch(err) {
            
            Temp.emit('err', error_stack(err), err)
            //console.log(str) 
        }
        if(cb) cb()

    })()

    i.next()
    var cb = function(){ setImmediate(function(){ i.next() }) }
}

module.exports = Sync