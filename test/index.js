var assert = require('assert'),
	rewire = require("rewire");

require('./definition.test.js');
require('./modelfactory.test.js');
require('./connection.test.js');

describe('ActiveRest', function() {
	var API = rewire('../index.js');

	describe('#constructor', function() {
		var api;

		it('should return an instance of API', function() {
			api = new API({
				url: 'http://www.google.com'
			}, ['picture', 'person']);

			assert(api instanceof API);
		});

		it('should have a models property', function() {
			assert('picture' in api.models);
		});

		it('should have the model as a property', function() {
			assert('picture' in api);
		});

		it('should have a definition property for the given model', function() {
			assert('picture' in api.definitions)
		});
	});

	require('./mocks/server.mock.js');

	describe('retrieving data', function() {
		var api = new API({
			url: 'http://localhost:8484'
		}, [ 'picture', 'person' ]);

		describe('#get', function() {
			it('should retrieve a picture by id', function(done) {
				api.picture.get(1, function(err, picture) {
					assert(picture.id === 1);
					done();
				});
			});

			it('should retrieve a person by id', function(done) {
				api.person.get(2, function(err, person) {
					assert(person.id === 2);
					done();
				});
			});
		});
	});
});