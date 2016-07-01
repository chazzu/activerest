var restify = require('restify');

var server = restify.createServer({
	name: 'Mock',
});

server.listen(8484);

server.get('/pictures/1', function(req, res) {
	res.send({
		id: 1,
		name: 'some_photo',
		file: 'some_photo.jpg'
	});
});

server.get('/people/2', function(req, res) {
	res.send({
		id: 2,
		name: 'Dustin',
		title: 'developer'
	})
});