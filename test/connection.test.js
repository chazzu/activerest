var assert = require('assert'),
	rewire = require("rewire");

describe('Connection', function() {
	var Connection = rewire('../lib/connection');
	var Definition = require('../lib/definition');

	var def = new Definition('picture'),
		conn;

	describe('#constructor', function() {
		it('should create a connection object given a string url', function() {
			conn = new Connection('http://localhost');

			assert(conn instanceof Connection);
		});

		it('should create a connection object given a configuration object', function() {
			conn = new Connection({
				idProperty: 'ID',
				url: 'http://localhost',
				headers: {
					'Authorization': 'Basic SomeKey'
				}
			});

			assert(conn instanceof Connection);
		});
	});
});