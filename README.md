# Introduction
gensync is a simple library that allows you to call any asynchronous function in synchronous way using generators introduced in nodejs 4.X.X and above

# Examples
```javascript
var Sync = require('gensync')

Sync(function *(){
	this.on('err', function(err){ /*Handle error here*/ }) 

	function asyncfunction(cb){
		setTimeout(function(){ return cb(null, 'my response!') }, 100)
	}

	var response = yield this.sync(function(cb){ asyncfunction(cb) })
	console.log(response[1]) // my response!
})

Alternatively 

Sync(function *(){
	
	var sync = this
	this.on('err', function(err){ /*Handle error here*/ }) 

	function asyncfunction(){
		setTimeout(function(){ return sync.next('my response!') }, 100)
	}

	var response = yield asyncfunction()
	console.log(response) // my response!
})
```