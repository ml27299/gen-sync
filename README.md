# Introduction
gen-sync is a simple library that allows you to call any asynchronous function in a synchronous way using generators introduced in nodejs 4.X.X and above. This library is lightweight, non blocking, and requires no changes to existing asynchronous functions to use.

Sync Reference
---

## sync([function run], continue, context)
return the response of the asyncronous function

  - `[function run]`: a function used to execute a target asyncronous function
  - `continue`: a boolean to determin if the whole Sync process should exit, default is false. When an error occurs an event is triggered, this is where the error is handled. This is the default behavior in gen-sync, if you'd like to overwrite this behavior, set this parameter to true
  - `context`: this is a class instance used to bind to the target asyncronous function (optional)

## async.each([[function async]], [function gather], continue)
  - `[[function async]]`: a list of asyncronous functions to run in parallel
  - `[function gather]`: a function that is executed when the results of one of the async functions returns (optional) 
  - `continue`: a boolean to determin if the whole Sync process should exit, default is false. When an error occurs an event is triggered, this is where the error is handled. This is the default behavior in gen-sync, if you'd like to overwrite this behavior, set this parameter to true

## cb 
A generic callback you can use in any target asyncronous function, its tied to the current gen-sync instance (see example below)

## throw(err, _continue)
used to manually emit an error (see examples below)

 - `err`: a string or Error instance represtending the error
 - `continue`: a boolean to determin if the whole Sync process should exit, default is false. When an error occurs an event is triggered, this is where the error is handled. This is the default behavior in gen-sync, if you'd like to overwrite this behavior, set this parameter to true

## next(response)
used to manually trigger the next yield execution (see examples below)

Function extentions
This package extends the Function object within a process so that shortcuts can be made

## Function.run(arguments)
returns a configured [function run]

  - `arguments`: arguments for the asyncronous function

## [function run] (see examples)
yield to and execute this function, params can be placed in any order

  - `callback`: a function used to determine the target callback in the target asyncronous function (optional)
  - `_continue`:  a boolean to determin if the whole Sync process should exit, default is false. When an error occurs an event is triggered, this is where the error is handled. This is the default behavior in gen-sync, if you'd like to overwrite this behavior, set this parameter to true
  - `context`: this is a class instance used to bind to the target asyncronous function (optional)

### Sync events
## .on('err', function(err){})
When an error occurs within an asyncronous function, the process is stopped and an error is emmitted to this event

### async.each events
## .on('data', function(data, index){})
When an asyncronous function results come in, this event is emitted

## .on('end', function(data, index){})
When all asyncronous functions are complted, this even is emitted

##

## Basic Usage (Review Error Handeling before getting started)

```javascript
var Sync = require('gen-sync')
```

### asyncfunction1.js
```javascript
function asyncfunction1(cb){
	setTimeout(function(){ return cb(null, 'my response!') }, 100)
}
```

### index.js
```javascript
Sync(funciton *(){

	//since the only argument is the callback, gen-sync will handle it behind the scenes
	var response = yield asyncfunction1.run()()
	response = response[1]

	console.log(response) //my response!
	

	//An alternative way of doing the same thing can look like this
	var response = yield this.sync(asyncfunction1)
	response = response[1]

	console.log(response) //my response!
})
```

### asyncfunction2.js
```javascript
function asyncfunction2(param, cb){
	setTimeout(function(){ return cb(null, param) }, 100)
}
```

### index.js
```javascript
Sync(funciton *(){

	//since the last argument is the callback, gen-sync will handle it behind the scenes
	var response = yield asyncfunction2.run('my response!')()
	response = response[1]

	console.log(response) //my response!
	

	//An alternative way of doing the same thing can look like this
	var response = yield this.sync(asyncfunction2.run('my response!'))
	response = response[1]

	console.log(response) //my response!


	//An alternative way of doing the same thing can look like this
	var response = yield this.sync(function(cb){ asyncfunction2('my response!', cb) })
	response = response[1]

	console.log(response) //my response!
})
```

### asyncfunction3.js
```javascript
function asyncfunction2(param1, cb, param2){
	setTimeout(function(){ return cb(null, param1, param2()) }, 100)
}
```

### index.js
```javascript
Sync(funciton *(){

	//the this.cb is utilized in this example, it should be the callback of the async function
	var some_function = function(){ return 'some value!' }
	var response = yield asyncfunction3.run('my response!', this.cb, some_function)()

	console.log(response[1]) //my response!
	console.log(response[2]) //some value!
	
	//NOTE: within some_function, the "this" parameter has "this._continue", since gen-sync binds another class to all functions passed in the async function. If you'd like to overwrite this behavior pass in the "this.cb" as a parameter when executing the .run function, this will allow gen-sync to figure out what parameter is the real callback, see below

	var some_function = function(){ return 'some value!' }
	var response = yield asyncfunction3.run('my response!', this.cb, some_function)(this.cb)

	console.log(response[1]) //my response!
	console.log(response[2]) //some value!


	//An alternative way of doing the same thing can look like this
	var some_function = function(){ return 'some value!' }
	var response = yield this.sync(asyncfunction3.run('my response!', this.cb, some_function))
	response = response[1]

	console.log(response[1]) //my response!


	//An alternative way of doing the same thing can look like this
	var response = yield this.sync(function(cb){ asyncfunction3('my response!', cb, some_function) })
	response = response[1]

	console.log(response) //my response!
})
```

### Class.js
```javascript
function Class(){
	if(this instanceof Class == false) new Class()
	this.foo = 'bar'
}
Class.prototype.method = function(cb){
	setTimeout(function(){ return cb(null, this.foo) }, 100)
}
```

```javascript
Sync(funciton *(){

	//.run messes with inheritance, so pass in the context when needed
	var c = new Class()
	var response = yield c.method.run()(c)
	response = response[1]

	console.log(response) //bar
	

	//An alternative way of doing the same thing can look like this
	var c = new Class()
	var response = yield this.sync(asyncfunction2.run(), c)
	response = response[1]

	console.log(response) //my response!


	//An alternative way of doing the same thing can look like this
	var response = yield this.sync(asyncfunction2, c)
	response = response[1]

	console.log(response) //my response!
})
```

Manually handle async function with "Sync.next"
```javascript
Sync(funciton *(){
	
	var sync = this
	function asyncfunction(cb){
		setTimeout(function(){ return sync.next('my response!') }, 100)
	}

	//since the only argument is the callback, gen-sync will handle it behind the scenes
	var response = yield asyncfunction
	console.log(response) //my response!
})
```

## Error Handeling

Errors are handled in multiple ways in gen-sync, the default behavior is to emit the error and stop any further execution of code within the Sync process. The library knows if an error occured if one of the arguments returned from an async function is an instance of the internal "Error" class within nodejs. 

There are ways to overwrite this default behavior to suit ones needs, see below

```javascript
Sync(function *(){

	this.on('err', function(err){ console.log(err) //my error! })

	function asyncfunction(cb){
		setTimeout(function(){ return cb(Error('my error!')) }, 100)
	}

	var response = yield this.sync(asyncfunction) //this Sync instance exits right here, nothing below this line gets executed
	response = response[1]
})
```

To override
```javascript
Sync(function *(){

	this.on('err', function(err){ console.log(err) //my error! }) //dont need the event handler, but the error still is emmitted

	function asyncfunction(cb){
		setTimeout(function(){ return cb(Error('my error!')) }, 100)
	}

	var response = yield this.sync(asyncfunction, true)
	/*continues*/

	console.log(response[0]) //my error!

	//An alternative way of doing the same thing can look like this
	var response = yield asyncfunction.run()(true)
	/*continues*/

	console.log(response[0]) //my error!
})
```

Becarefull if the the error returned is not an instance of the Error class in nodejs, gen-sync wont know an error happened and will continue
```javascript
Sync(function *(){

	this.on('err', function(err){ console.log(err) }) //wont be triggered

	function asyncfunction(cb){
		setTimeout(function(){ return cb('my error!') }, 100)
	}

	var response = yield this.sync(asyncfunction)
	/*continues*/

	console.log(response[0]) //my error!
})
```

Manually handle errors with "Sync.throw" example 1
```javascript
Sync(function *(){

	this.on('err', function(err){ console.log(err) //my error! })

	var sync = this
	function asyncfunction(cb){
		setTimeout(function(){ return sync.throw('my error!') }, 100)
	}

	//since the only parameter is the callback and using this.throw
	var response = yield asyncfunction //this Sync instance exits right here, nothing below this line gets executed
})
```

Manually handle errors with "Sync.throw" example 2
```javascript
Sync(function *(){

	this.on('err', function(err){ console.log(err) //my error! })

	var sync = this
	function asyncfunction(cb){
		setTimeout(function(){ return sync.throw('my error!', true) }, 100)
	}

	//since the only parameter is the callback and using this.throw
	var response = yield asyncfunction
	/*continues*/

	console.log(response[0]) //my error!
})
```

## Advanced Usage

### Conditional loops
"Yield" is only available in a generator scope, keep this in mind when using in conjuction with conditional loops

This will crash the script
```javascript
Sync(function *(){
	
	var self = this
	this.on('err', function(err){ /*Handle error here*/ }) 

	function asyncfunction(item, cb){
		db.collection.findOne(item).exec(cb)
	}

	var ids = [{ _id : 0 }, { _id : 1 }, { _id : 2 }]
	ids.forEach(function(item){
		var response = yield asyncfunction.sync(self).run(null, item)
	})
})
```

instead do 
```javascript
Sync(function *(){
	this.on('err', function(err){ /*Handle error here*/ }) 

	function asyncfunction(item, cb){
		db.collection.findOne(item).exec(cb)
	}

	var ids = [{ _id : 0 }, { _id : 1 }, { _id : 2 }]
	for(var i = 0; i < ids.legth; i++){
		var response = yield asyncfunction.sync(this).run(null, ids[i])
	}
})
```

### Async in Sync
Making things synchronous is awesome and can make code much more readable, but what's so great about javascript is it's asynchronous nature, sometimes we want to run multiple asynchronous functions at the same time, because we don't care what async function finishes first, we just care when a group of async functions are done executing.

```javascript
Sync(function *(){
	this.on('err', function(err){ /*Handle error here*/ }) 

	var result0, result1, result2
	function gather(data, index){
		if(index == 0) result0 = data[1]
		if(index == 1) result1 = data[1]
		if(index == 2) result2 = data[1]
	}

	yield this.async.each([
		db.collection0.find().exec, 
		db.collection1.find().exec, 
		db.collection2.find().exec
	], gather)

	console.log(result0) //results from collection0
	console.log(result1) //results from collection1
	console.log(result2) //results from collection2
})
```
Alternatively
```javascript
Sync(function *(){
	this.on('err', function(err){ /*Handle error here*/ }) 

	var result0, result1, result2
	this.on('data', function(data, index){
		if(index == 0) result0 = data[1]
		if(index == 1) result1 = data[1]
		if(index == 2) result2 = data[1]
	})

	yield this.async.each([
		db.collection0.find().exec, 
		db.collection1.find().exec, 
		db.collection2.find().exec
	])

	console.log(result0) //results from collection0
	console.log(result1) //results from collection1
	console.log(result2) //results from collection2
})
```
### process.nextTick
```javascript
Sync(function *(){
	yield this.nextTick()
})
```

https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/


