# Introduction
gen-sync is a simple library that allows you to call any asynchronous function in synchronous way using generators introduced in nodejs 4.X.X and above

# Examples

## Basic Usage
```javascript
var Sync = require('gen-sync')

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
## Error Usage

```javascript
Sync(function *(){
	this.on('err', function(err){ /*Handle error here*/ }) 

	function asyncfunction(cb){
		setTimeout(function(){ return cb('Error out!') }, 100)
	}

	var response = yield this.sync(function(cb){ asyncfunction(cb) })
	console.log(response[0]) // Error out!
})

or 

Sync(function *(){
	this.on('err', function(err){ console.log(err) /*Error out!*/ }) 

	function asyncfunction(cb){
		setTimeout(function(){ return cb(Error('Error out!')) }, 100)
	}

	var response = yield this.sync(function(cb){ asyncfunction(cb) })
	//execution stops here, "err" event handler is executed 
})

Alternatively 

Sync(function *(){
	
	var sync = this
	this.on('err', function(err){ console.log(err) /*Error out!*/ }) 

	function asyncfunction(){
		setTimeout(function(){ return sync.throw('my response!') }, 100)
	}

	var response = yield asyncfunction()
	//execution stops here, "err" event handler is executed
})

```

