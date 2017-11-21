# Introduction
gen-sync is a simple library that allows you to call any asynchronous function in synchronous way using generators introduced in nodejs 4.X.X and above

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
		setTimeout(function(){ return sync.throw('Error out!') }, 100)
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

## Advanced Usage

### Conditional loops
"Yield" is only available in a generator scope, keep this in mind when using in conjuction with conditional loops

This will crash the script
```javascript
Sync(function *(){
	this.on('err', function(err){ console.log(err) /*Error out!*/ }) 

	function asyncfunction(item, cb){
		db.collection.findOne(item).exec(cb)
	}

	var ids = [{ _id : 0 }, { _id : 1 }, { _id : 2 }]
	ids.forEach(function(item){
		var response = yield this.sync(function(cb){ asyncfunction(item, cb) })
	})
})
```

instead do 
```javascript
Sync(function *(){
	this.on('err', function(err){ console.log(err) /*Error out!*/ }) 

	function asyncfunction(item, cb){
		db.collection.findOne(item).exec(cb)
	}

	var ids = [{ _id : 0 }, { _id : 1 }, { _id : 2 }]
	for(var i = 0; i < items.legth; i++){
		var response = yield this.sync(function(cb){ asyncfunction(items[i], cb) })
	}
})
```

### Async in Sync
Making things syncronous is awesome and can make code much more readable, but whats so great about javascript is it asyncronous nature, sometimes we want to run multiple asyncronous functions at the same time, because we don't care what async function finishes first, we just care about when a group of async functions are done executing.

```javascript
Sync(function *(){
	this.on('err', function(err){ console.log(err) /*Error out!*/ }) 

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

### process.nextTick
```javascript
Sync(function *(){
	yield this.nextTick()
})
```

https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/


