# Introduction
gen-sync is a simple library that allows you to call any asynchronous function in a synchronous way using generators introduced in nodejs 4.X.X and above. This library is lightweight, non blocking, and requires no changes to existing asynchronous functions to use.

Sync Reference
---

## sync([function exec], continue, context)

return the response of the asyncronous function

  - `[function exec]`: a function used to execute a target asyncronous function
  - `continue`: a boolean to determin if the whole Sync process should exit, default is false. When an error occurs an event is triggered, this is where the error is handled. This is the default behavior in gen-sync, if you'd like to overwrite this behavior, set this parameter to true
  - `context`: this is a class instance used to bind to the target asyncronous function (optional)

## async.each([[function async]], [function gather], continue)
  - `[[function async]]`: a list of asyncronous functions to run in parallel
  - `[function gather]`: a function that is executed when the results of one of the async functions returns (optional) 
  - `continue`: a boolean to determin if the whole Sync process should exit, default is false. When an error occurs an event is triggered, this is where the error is handled. This is the default behavior in gen-sync, if you'd like to overwrite this behavior, set this parameter to true


### Function extentions
This package extends the Function object within a process so that shortcuts can be made

## Function.run(arguments)
Returns a configured [function exec]

### Sync events
## .on('err', function(err){})
When an error occurs within an asyncronous function, the process is stopped and an error is emmitted to this event

### async.each events
## .on('data', function(data, index){})
When an asyncronous function results come in, this event is emitted

## .on('end', function(data, index){})
When all asyncronous functions are complted, this even is emitted


## Basic Usage
```javascript
var Sync = require('gen-sync')

Sync(function *(){
	this.on('err', function(err){ /*Handle error here*/ }) 

	function asyncfunction(cb){
		setTimeout(function(){ return cb(null, 'my response!') }, 100)
	}

	function asyncfunction2(param, cb){
		setTimeout(function(){ return cb(null, param) }, 100)
	}

	var response1 = yield this.sync(asyncfunction)
	console.log(response1[1]) // my response!

	var response2 = yield this.sync(asyncfunction2.run('my response!'))
	console.log(response2[1]) // my response!

	//OR
		var response2 = yield this.sync(function(cb){ asyncfunction2('my response!', cb) })
		console.log(response2[1]) // my response!

	//OR

	// Function.prototype.sync() - argument is gen-sync 'this', returns object { run : [function] }
	// Function.prototype.sync().run() - first argument is 'this' context

	var response1 = yield asyncfunction.sync(this).run()
	console.log(response1[1]) // my response!

	var response2 = yield asyncfunction2.sync(this).run(null, 'my response!')
	console.log(response2[1]) // my response!
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
### Error Handling

```javascript
Sync(function *(){
	this.on('err', function(err){ console.log(err) /*Error out! (plus error stack trace)*/ }) 

	function asyncfunction(cb){
		setTimeout(function(){ return cb('Error out!') }, 100)
	}

	var response = yield this.sync(asyncfunction)
	console.log(response[0]) // Error out! (plus error stack trace)

	if(response[0]) yield this.throw(response[0]) //can call this at anytime
	//execution stops here, "err" event listener is executed
})
```
or 
```javascript
Sync(function *(){
	this.on('err', function(err){ console.log(err) /*Error out! (plus error stack trace)*/ }) 

	function asyncfunction(cb){
		setTimeout(function(){ return cb(Error('Error out!')) }, 100)
	}

	var response = yield this.sync(asyncfunction)
	//execution stops here, "err" event listener is executed 
})
```
Alternatively 
```javascript
Sync(function *(){
	
	var sync = this
	this.on('err', function(err){ console.log(err) /*Error out! (plus error stack trace)*/ }) 

	function asyncfunction(){
		setTimeout(function(){ return sync.throw('Error out!') }, 100)
	}

	var response = yield asyncfunction()
	//execution stops here, "err" event listener is executed
})
```

As you may have noticed, any error that is an instance of the internal "Error" object in nodejs automatically stops the execution of the next line of code in gen-sync. You can go around this behavior by doing

```javascript
Sync(function *(){
	this.on('err', function(err){ console.log(err) /*Error out! (plus error stack trace)*/ }) 

	function asyncfunction(cb){
		setTimeout(function(){ return cb(Error('Error out!')) }, 100)
	}

	var response = yield this.sync(asyncfunction, true)
	//execution continues

	//Do Stuff

	console.log(response[0]) //'Error out!' (plus error stack trace)

	//this.err also holds the latest error (if any) in the parent "Sync" scope
	console.log(this.err) //'Error out!' 

	//when you continue on an error, the "err" event listener is not executed, if you would like to excute it do
	this.emit('err', response[0])

	if(response[0]) yield this.throw(response[0]) //can call this at anytime
	//execution stops here, "err" event listener is executed 
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


