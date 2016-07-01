var assert = require('assert'),
	rewire = require("rewire");

describe('ModelFactory', function() {
	describe('#ModelFactory', function() {
		var model,
			factory;

		it('loads properly', function() {
			factory = rewire('../lib/modelfactory');
		});

		it('returns model objects', function() {
			model = factory(null, null);
			assert(typeof model === 'function');
		});

		it('returns models that can be instantiated', function() {
			var instance = new model();
			assert(instance instanceof model);
		});
	});

});