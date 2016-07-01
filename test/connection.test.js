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

		it('should have accessible newMethod', function() {
			conn = new Connection({ url: 'http://localhost', newMethod: 'TEST' });
			assert(conn.newMethod === 'TEST');
		});

		it('should have accessible delMethod', function() {
			conn = new Connection({ url: 'http://localhost', delMethod: 'TEST' });
			assert(conn.delMethod === 'TEST');
		});

		it('should have accessible getMethod', function() {
			conn = new Connection({ url: 'http://localhost', getMethod: 'TEST' });
			assert(conn.getMethod === 'TEST');
		});

		it('should have accessible updateMethod', function() {
			conn = new Connection({ url: 'http://localhost', updateMethod: 'TEST' });
			assert(conn.updateMethod === 'TEST');
		});

		it('should have accessible findMethod', function() {
			conn = new Connection({ url: 'http://localhost', findMethod: 'TEST' });
			assert(conn.findMethod === 'TEST');
		});
	});
});