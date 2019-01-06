var Sync = require('../lib/Sync.js')
var expect  = require('chai').expect

it('no parameter', function(done) {
	function asyncFunc(cb){
		setTimeout(function(){ return cb(null, 'my response!') }, 100)
	}

	Sync(function *(){
		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened

		var response = yield asyncFunc(this.cb)
		response = response[1]

		expect(response).to.equal('my response!')
		done()
	})
})

it('no parameter alternate 1', function(done) { 
	function asyncFunc(cb){
		setTimeout(function(){ return cb(null, 'my response!') }, 100)
	}

	Sync(function *(){
		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened

		var response = yield this.sync(asyncFunc)
		response = response[1]

		expect(response).to.equal('my response!')
		done()
	})
})

it('no parameter alternate 2', function(done) { 
	function asyncFunc(cb){
		setTimeout(function(){ return cb(null, 'my response!') }, 100)
	}

	Sync(function *(){
		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened

		var response = yield this.sync(function(cb){ asyncFunc(cb) })
		response = response[1]

		expect(response).to.equal('my response!')
		done()
	})
})




it('with parameter', function(done) { 
	function asyncFunc(param1, cb){
		setTimeout(function(){ return cb(null, param1) }, 100)
	}

	Sync(function *(){
		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened

		var response = yield asyncFunc('some value!', this.cb)
		response = response[1]

		expect(response).to.equal('some value!')
		done()
	})
})

it('with parameter alternate 1', function(done) { 
	function asyncFunc(param1, cb){
		setTimeout(function(){ return cb(null, param1) }, 100)
	}

	Sync(function *(){
		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened

		var response = yield this.sync(function(cb){ asyncFunc('some value!', cb) })
		response = response[1]

		expect(response).to.equal('some value!')
		done()
	})
})




it('with class', function(done) { 
	function Class(){
		this.foo = 'bar'
	}
	Class.prototype.method = function(cb) {
		var self = this
		setTimeout(function(){ cb(null, self.foo) }, 100)
	}

	Sync(function *(){
		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened

		var c = new Class()
		var response = yield c.method(this.cb)
		response = response[1]

		expect(response).to.equal('bar')
		done()
	})
})

it('with class alternate 1', function(done) { 
	function Class(){
		this.foo = 'bar'
	}
	Class.prototype.method = function(cb) {
		var self = this
		setTimeout(function(){ cb(null, self.foo) }, 100)
	}

	Sync(function *(){
		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened

		var c = new Class()
		var response = yield this.sync(function(cb){ c.method(cb) })
		response = response[1]

		expect(response).to.equal('bar')
		done()
	})
})

it('with class alternate 2', function(done) { 
	function Class(){
		this.foo = 'bar'
	}
	Class.prototype.method = function(cb) {
		var self = this
		setTimeout(function(){ cb(null, self.foo) }, 100)
	}

	Sync(function *(){
		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened

		var c = new Class()
		var response = yield this.sync(c.method, c)
		response = response[1]

		expect(response).to.equal('bar')
		done()
	})
})



it('raw', function(done) { 
	Sync(function *(){
		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened

		var sync = this
		function asyncFunc(param1, cb){
			setTimeout(function(){ sync.next(param1) }, 100)
		}

		var response = yield asyncFunc('some value!')
		expect(response).to.equal('some value!')

		done()
	})
})

