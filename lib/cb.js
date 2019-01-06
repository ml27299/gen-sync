var error_stack = require('./Error.js')
module.exports = function(){
	
	var args = arguments
	var err = Object.keys(args).reduce(function(result, key){
		if(args[key] instanceof Error) result = error_stack(args[key])
		return result
	}, '')
	
	var results = Object.keys(args).map(function(key){ return args[key] })
	if(err) return this.throw(err, this._continue, results)
	
	return this.next(results)
}