var rewire = require("rewire");
var definition = rewire('../lib/definition.js');
var assert = require('assert');

describe('Definitions', function() {
	describe('#generate_path', function() {
		var fn = definition.__get__('generate_path');
		it('should return puppies when given puppy', function() {
			assert.equal('puppies', fn({ name: 'puppy' }));
		});
		it('should return pictures when given picture', function() {
			assert.equal('pictures', fn({ name: 'picture' }));
		});
		it('should return people when given person', function() {
			assert.equal('people', fn({ name: 'person' }));
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

		it('should return a Definition object given a valid definition object', function() {
			def = new definition({
				name: 'test',
				idProperty: 'ID'
			});

			assert(def instanceof definition);
		});

		it('should use the given idProperty', function() {
			assert(def.idProperty === 'ID');
		});

		it('should return a Definition object given a string name', function() {
			def = new definition('test');
		});

		it('should have a name property', function() {
			assert('name' in def);
		});

		it('should have a plural path', function() {
			assert(def.path === 'tests');
		});

		it('should not allow changes to the name', function() {
			def.name = "testing";

			assert.equal(def.name, 'test');
		});

		it('should create children definitions', function() {
			def = new definition({
				name: 'picture',
				children: [{
					name: 'exif',
					path: 'exif'
				}]
			});

			assert(typeof def.children === 'object');
			assert(def.children.exif.name === 'exif');
		});
	});
});