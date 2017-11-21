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
```
Alternatively 
```javascript
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
```
or 
```javascript
Sync(function *(){
	this.on('err', function(err){ console.log(err) /*Error out!*/ }) 

	function asyncfunction(cb){
		setTimeout(function(){ return cb(Error('Error out!')) }, 100)
	}

	var response = yield this.sync(function(cb){ asyncfunction(cb) })
	//execution stops here, "err" event handler is executed 
})
```
Alternatively 
```javascript
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

As you may have noticed, any error that is an instance of the internal "Error" object in nodejs automatically stops the execution of the next line of code in gen-sync. You can go around this behavior by doing

```javascript
Sync(function *(){
	this.on('err', function(err){ console.log(err) /*Error out!*/ }) 

	function asyncfunction(cb){
		setTimeout(function(){ return cb(Error('Error out!')) }, 100)
	}

	var response = yield this.sync(function(cb){ asyncfunction(cb) }, true)
	//execution continues
	
	//Do Stuff

	console.log(response[0]) //'Error out!'

	//this.err also holds the latest error (if any) in the parent "Sync" scope
	console.log(this.err) //'Error out!' 

	if(response[0]) this.throw(response[0]) //can call this at anytime
	//execution stops here, "err" event handler is executed 
})
```

