var Sync = require('../lib/Sync.js')
var expect  = require('chai').expect

it('default error handling', function(done) { 
	function asyncFunc(cb){
		setTimeout(function(){ return cb(Error('some error!')) }, 100)
	}

	Sync(function *(){

		this.on('err', function(err){ 
			expect(~err.indexOf('some error!') != 0).to.equal(true)
			done()
		})

		yield asyncFunc(this.cb)
		expect(false).to.equal(true) //used to make sure no further execution happened
	})
})

it('NOT instance of Error object error handling', function(done) { 
	function asyncFunc(cb){
		setTimeout(function(){ return cb('some error!') }, 100)
	}

	Sync(function *(){

		this.on('err', function(err){ 
			expect(~err.indexOf('some error!') != 0).to.equal(true)
			done()
		})

		var response = yield asyncFunc(this.cb)
		expect(~response[0].indexOf('some error!') != 0).to.equal(true)
		if(response[0]) yield this.throw(response[0])

		expect(false).to.equal(true) //used to make sure no further execution happened
	})
})

it('NOT instance of Error object AND continue error handling', function(done) { 
	function asyncFunc(cb){
		setTimeout(function(){ return cb('some error!') }, 100)
	}

	Sync(function *(){

		this.on('err', function(err){ 
			expect(~err.indexOf('some error!') != 0).to.equal(true)
		})

		var response = yield asyncFunc(this.cb)
		if(response[0]) this.throw(response[0], true)

		done()
	})
})

it('override to continue error handling', function(done) { 
	function asyncFunc(cb){
		setTimeout(function(){ return cb(Error('some error!')) }, 100)
	}

	Sync(function *(){

		this.on('err', function(err){ expect(~err.indexOf('some error!') != 0).to.equal(true) })

		var response = yield asyncFunc(this.cb)
		expect(~response[0].stack.indexOf('some error!') != 0).to.equal(true)
		expect(~this.err.indexOf('some error!') != 0).to.equal(true)

		done()

	}, true)
})

it('alternate override to continue error handling', function(done) { 
	function asyncFunc(cb){
		setTimeout(function(){ return cb(Error('some error!')) }, 100)
	}

	Sync(function *(){

		this.on('err', function(err){ expect(~err.indexOf('some error!') != 0).to.equal(true) })

		var response = yield this.sync(asyncFunc, true)
		expect(~response[0].stack.indexOf('some error!') != 0).to.equal(true)
		expect(~this.err.indexOf('some error!') != 0).to.equal(true)

		done()

	}, true)
})

it('override the override to continue error handling', function(done) { 
	function asyncFunc(cb){
		setTimeout(function(){ return cb(Error('some error!')) }, 100)
	}

	Sync(function *(){

		var response = yield asyncFunc(this.cb)
		expect(~response[0].stack.indexOf('some error!') != 0).to.equal(true)
		expect(~this.err.indexOf('some error!') != 0).to.equal(true)

		this.on('err', function(err){ 
			expect(~err.indexOf('some error!') != 0).to.equal(true) 
			done()
		})
		
		if(response[0]) yield this.throw(response[0])
		expect(false).to.equal(true) //used to make sure no further execution happened

	}, true)
})