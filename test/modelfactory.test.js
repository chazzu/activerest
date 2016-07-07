var assert = require('assert'),
	rewire = require('rewire');

describe('ModelFactory', function() {
	describe('#ModelFactory', function() {
		var model,
			factory;

		it('loads properly', function() {
			factory = rewire('../lib/modelfactory');
		});

		it('returns model objects', function() {
			model = factory({}, {});
			assert(typeof model === 'function');
		});

		it('returns models that can be instantiated', function() {
			var instance = new model();
			assert(instance instanceof model);
		});
	});

	describe('#build_request_uri', function() {
		var factory = rewire('../lib/modelfactory');

		it('should return a valid URI', function() {
			var uri = factory.__get__('build_request_uri')({
				path: 'pictures'
			}, {
				idProperty: 'id',
				url: 'http://localhost'
			}, {
			});

			assert(uri === 'http://localhost/pictures');
		});

		it('should return a valid URI with query string', function() {
			var uri = factory.__get__('build_request_uri')({
				path: 'pictures'
			}, {
				idProperty: 'id',
				url: 'http://localhost'
			}, {
				query: {
					param: 'value'
				}
			});

			assert(uri === 'http://localhost/pictures?param=value');
		});

		it('should return a valid URI when given a model with child', function() {
			var uri = factory.__get__('build_request_uri')({
				path: 'exif'
			}, {
				idProperty: 'id',
				url: 'http://localhost'
			}, {
				model: {
					id: 1
				},
				parent: {
					id: 3,
					__definition: {
						path: 'pictures'
					}
				}
			});

			assert(uri === 'http://localhost/pictures/3/exif/1');
		});
	});
});