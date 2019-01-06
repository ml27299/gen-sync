var isBoolean = function(a){ return Object.prototype.toString.call(a) !== '[object Boolean]' ? false : true; }
var error_stack = require('./Error.js')
var Async = require('./Async.js')
var cb = require('./cb.js')

var util = require('util')
var event_emitter = require('events')

var Factory = function(i, options){
	if(this instanceof Factory === false) return new Factory(i, options)

	var self = this
    this.i = i
    this._continue = options._continue
}

Factory.prototype.next = function(params){
	var self = this
 	setImmediate(function(){
    	return self.i.next(params)
    }) 
}

Factory.prototype.throw = function(err, _continue, results){

	this.err = error_stack(err)
	var self = this
	
	setImmediate(function(){
		if(_continue) {
			self.emit('err', self.err, err)
			return self.i.next(results)
		}

		return self.i.throw(self.err)
	})
}

Factory.prototype.sync = function(callback, _continue, context){
	for(var i = 0; i < arguments.length; i++){

        var value = arguments[i]
        delete arguments[i]

        if(isBoolean(value)) arguments[1] = value
        else arguments[2] = value
    }
	
	var self = this
	_continue = arguments[1]
	context = arguments[2]
		
	if(this._continue) _continue = true

    var extend = function(){}
    extend.prototype._continue = _continue
   
    callback.call(context, this.cb.bind(new extend()))
}

Object.defineProperty(Factory.prototype, "async", {
	get : function(){ return Async(this) } 
})

Object.defineProperty(Factory.prototype, "cb", {
	get : function(){ return cb.bind(this) } 
})

util.inherits(Factory, event_emitter)
module.exports = Factory