var async = require('async');

function ModelFactory(api, definition) {

	function Model(values) {
		var properties = {};

		properties['delete'] = _prop_obj(del.bind(this));
		properties['save'] = _prop_obj(save.bind(this));
		properties['refresh'] = _prop_obj(refresh.bind(this));
		properties['__values'] = _prop_obj(__values.bind(this));

		Object.defineProperties(this, properties);

		if (typeof values === 'object') {
			for (var name in values) {
				Object.defineProperty(this, name, {
					enumerable: true,
					configurable: false,
					get: get_prop.bind(this, name),
					set: set_prop.bind(this, name)
				});
			};
		}

		function get_prop(name) {
			return values[name];
		};

		function set_prop(name, value) {
			values[name] = value;
		};

		function __values() {
			return values;
		};
	};

	var create = function(values, cb) {

	};

	var del = function(cb) {
		build_request({
			api: api, 
			definition: definition,
			method: 'del',
			model: this
		}, function(req) {
			api.connection.request(req, cb);
		});
	};

	var get = function(id, cb) {
		build_request({
			api: api, 
			definition: definition,
			method: 'get',
			id: id
		}, function(req) {
			api.connection.request(req, function(err, res) {
				if (err)
					return cb(err);

				cb(null, new Model(JSON.parse(res.body)));
			});
		});
	};

	var get_url = function() {
		return definition.get_url(api.connection.get_url());
	};

	var find = function(query, cb) {
		build_request({
			api: api, 
			definition: definition,
			method: 'get',
			query: query
		}, function(req) {
			api.connection.request(req, cb);
		});
	};

	var save = function(cb) {
	};

	var refresh = function(cb) {
	};

	// For all intents and purposes, these are static methods
	Model.create = create;
	Model.get = get;
	Model.find = find;
	Model.query = find;

	return Model;
}

function build_request(params, cb) {
	var req = {},
		conn = params.api.connection,
		def = params.definition;

	var idProp = def.idProperty ? def.idProperty : conn.idProperty,
		method = params.method + 'Property';

	req.uri = def.url ? def.url : conn.url;
	req.uri += '/' + params.definition.path + '/';

	if (params.id)
		req.uri += params.id;
	else if (params.model) 
		req.uri += model[idProp];

	req.method = def[method] ? def[method] : conn[method];

	if (params.model)
		req.json = params.model.__values();

	req.headers = {};

	if (typeof conn.headers === 'object' && conn.headers !== null)
		req.headers = conn.headers;
	if (typeof def.headers === 'object' && def.headers !== null)
		req.headers = def.headers;
	if (typeof conn.headers === 'function')
		conn.headers(req);
	if (typeof def.headers === 'function')
		def.headers(req);

	var stack = [];
	if (typeof conn.transform === 'function')
		stack.push(conn.transform.bind(null, req));
	if (typeof def.transform === 'function')
		stack.push(def.transform.bind(null, req));

	if (stack.length)
		async.series(stack, function(err) {
			if (err)
				throw err;
			cb(req);
		});
	else
		cb(req);
};

function _prop_obj(value) {
	return {
		enumerable: false,
		configurable: false,
		writable: false,
		value: value
	};
};

module.exports = ModelFactory;