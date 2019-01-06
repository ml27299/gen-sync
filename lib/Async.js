module.exports = function(context){
	return {
	each : function(array, func, _continue){

		if(!array) throw 'need to pass array into Sync -> async'
		if(!array.length) return context.next()

		if(func) context.on('data', func)
		if(context._continue) _continue = true

		var total = array.length
	    var count = 0

	    function callback(){
	    	count ++
	    
	    	var args = arguments
	    	var err = Object.keys(args).reduce(function(result, key){
				if(args[key] instanceof Error) result = error_stack(args[key])
				return result
			}, '')
	    	var results = Object.keys(args).map(function(key){ return args[key] })

			if(err && func) context.removeListener('data', func)
	        if(err) return context.throw(args[error_key], _continue, results)

	        context.emit('data', results, this.index)

	    	if(count === total) context.emit('end')
	    	if(count === total && func) context.removeListener('data', func)
	    	if(count === total) return context.next()
	    }

	    for(var i = 0; i < array.length; i++){

	    	var extend = function(){}
	    	extend.prototype.index = i

	    	array[i](callback.bind(new extend()))
	    }
	}
	}
}