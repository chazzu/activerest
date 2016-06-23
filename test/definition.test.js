var rewire = require("rewire");
var definition = rewire('../lib/definition.js');
var assert = require('assert');

describe('#generate_path', function() {
	var fn = definition.__get__('generate_path');
	it('should return puppies when given puppy', function() {
		assert.equal('puppies', fn({ name: 'puppy' }));
	});
	it('should return pictures when given picture', function() {
		assert.equal('pictures', fn({ name: 'picture' }));
	});
});

describe('#validate', function() {
	var fn = definition.__get__('validate');

	it('should throw a TypeError when name property is empty', function() {
		assert.throws(fn.bind(null, 'name', null), TypeError);
	});

	it('should accept a valid name', function() {
		assert.doesNotThrow(fn.bind(null, 'name', 'test'), TypeError);
	});

	it('should not accept an array for headers', function() {
		assert.throws(fn.bind(null, 'headers', []), TypeError);
	});
});

describe('#constructor', function() {
	var def;

	it('should return a Definition object', function() {
		def = new definition({
			name: 'test'
		});

		assert(def instanceof definition);
	});

	it('should have a name property', function() {
		assert('name' in def);
	});

	it('should not allow changes to the name', function() {
		def.name = "testing";

		assert.equal(def.name, 'test');
	});
});