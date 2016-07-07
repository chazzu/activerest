var assert = require('assert'),
	rewire = require("rewire");

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

	var api = new API({
		url: 'http://localhost:8484'
	}, [{
		name: 'picture',
		children: [{
			name: 'exif',
			path: 'exif'
		}]
	}, 'person' ]);

	describe('#get', function() {
		it('should retrieve a picture by id', function(done) {
			api.picture.get(1, function(err, pic) {
				assert(err === null);
				assert(pic.id === 1);
				done();
			});
		});

		it('should retrieve a person by id', function(done) {
			api.person.get(2, function(err, person) {
				assert(err === null);
				assert(person.id === 2);
				done();
			});
		});
	});

	describe('#find', function() {
		it('should query people using query string built from an object', function(done) {
			api.person.find({
				name: 'obj'
			}, function(err, people) {
				assert(err === null);
				assert(Array.isArray(people));
				assert(people[0].id === 3);
				assert(people[1].id === 4);
				done();
			});
		});

		it('should query people using a query string provided as string', function(done) {
			api.person.find('name=string', function(err, people) {
				assert(err === null);
				assert(Array.isArray(people));
				assert(people[0].id === 3);
				assert(people[1].id === 4);
				done();
			});
		});

		it('should retrieve exif by id, using the parent uri', function(done) {
			api.picture.get(1, function(err, picture) {
				picture.exif.find(function(err, result) {
					assert(Array.isArray(result));
					assert(result[0].id === 1);
					assert(result[0].name === 'location');
					assert(result[0].value === 'somewhere');
					done();
				});
			});
		});	
	});

	describe('#del', function() {
		it('should send a DELETE request', function(done) {
			var person = new api.person({ id: 1 });
			person.del(function(err, res) {
				assert(err === null);
				assert(res === '"deleted"');
				done();
			});
		});
	});

	describe('#save', function() {
		it('should send a POST request when saving a new object', function(done) {
			var person = new api.person({ 'name': 'Dustin' });
			person.save(function(err, res) {
				assert(res === 'created');
				done();
			});
		});

		it('should send a PUT request when saving an existing object', function(done) {
			api.person.get(2, function(err, person) {
				assert(err === null);
				person.name = 'Test';
				person.save(function(err, result) {
					assert(result === 'updated');
					done();
				});
			});
		});
	});
});