var Sync = require('../lib/Sync.js')
var expect  = require('chai').expect

function async1(cb){
	setTimeout(function(){ return cb(null, 'data from async1') }, 100)
}

function async2(param1, cb){
	setTimeout(function(){ return cb(null, param1) }, 100)
}

function async3(cb){
	setTimeout(function(){ return cb(null, 'data from async3') }, 100)
}

it('async each with no custom gatherer', function(done) {
	Sync(function *(){

		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened
		
		var async1_data, async2_data, async3_data
		this.on('data', function(data, index){
			if(index == 0) async1_data = data[1]
			if(index == 1) async2_data = data[1]
			if(index == 2) async3_data = data[1]
		})

		yield this.async.each([
			async1,
			function(callback){ async2('data from async2', callback) },
			async3
		])

		expect(async1_data).to.equal('data from async1')
		expect(async2_data).to.equal('data from async2')
		expect(async3_data).to.equal('data from async3')

		done()
	})
})


it('async each with custom gatherer', function(done) {
	Sync(function *(){

		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened
		
		var async1_data, async2_data, async3_data
		function gather(data, index){
			if(index == 0) async1_data = data[1]
			if(index == 1) async2_data = data[1]
			if(index == 2) async3_data = data[1]
		}

		yield this.async.each([
			async1,
			function(callback){ async2('data from async2', callback) },
			async3
		], gather)

		expect(async1_data).to.equal('data from async1')
		expect(async2_data).to.equal('data from async2')
		expect(async3_data).to.equal('data from async3')

		done()
	})
})


it('async each with empty array', function(done) {
	Sync(function *(){

		this.on('err', function(err){ expect(false).to.equal(true) }) //makes sure that no error happened
		
		var async1_data, async2_data, async3_data
		this.on('data', function(data, index){
			if(index == 0) async1_data = data[1]
			if(index == 1) async2_data = data[1]
			if(index == 2) async3_data = data[1]
		})

		yield this.async.each([])

		expect(async1_data).to.equal(undefined)
		expect(async2_data).to.equal(undefined)
		expect(async3_data).to.equal(undefined)

		done()
	})
})