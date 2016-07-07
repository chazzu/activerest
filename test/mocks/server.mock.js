var restify = require('restify');

var server = restify.createServer({
	name: 'Mock',
});

server.listen(8484);
server.use(restify.queryParser());

server.get('/people', function(req, res) {

	var response = [{
		id: 3,
		name: 'Dustin'
	}, {
		id: 4,
		name: 'Tester'
	}];

	if (req.params.name === 'obj') {

		res.send(response);

	} else if (req.params.name === 'string') {

		res.send(response);

	}
});

server.post('/people', function(req, res) {
	res.send('created');
});

server.del('/people/1', function(req, res) {
	res.send('deleted');
});

server.get('/people/2', function(req, res) {
	res.send({
		id: 2,
		name: 'Dustin',
		title: 'developer'
	})
});

server.put('/people/2', function(req, res) {
	res.send('updated');
});

server.get('/pictures/1', function(req, res) {
	res.send({
		id: 1,
		name: 'some_photo',
		file: 'some_photo.jpg'
	});
});

server.get('/pictures/1/exif', function(req, res) {
	res.send([{
		id: 1,
		name: 'location',
		value: 'somewhere'
	}]);
});
