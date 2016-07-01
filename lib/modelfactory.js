var async = require('async'),
	querystring = require('querystring'),
	URL = require('url');

function ModelFactory(api, definition) {

	function Model(values) {
		var properties = {};

		properties['del'] = _prop_obj(del.bind(this));
		properties['save'] = _prop_obj(save.bind(this));
		properties['__dirty'] = _prop_obj(__dirty.bind(this));
		properties['__values'] = _prop_obj(__values.bind(this));

		Object.defineProperties(this, properties);

		if (typeof values === 'object') {
			for (var name in values) {
				Object.defineProperty(this, name, {
					enumerable: true,
					configurable: false,
					value: values[name]
				});
			};
		}

		function __dirty() {
			for (var idx in this) {
				if (idx in values === false || values[idx] !== this[idx])
					return true;				
			}
			for (var idx in values) {
				if (idx in this === false || values[idx] !== this[idx])
					return true;				
			}

			return false;
		};

		function __values() {
			var values = {};

			for (var idx in this) {
				values[idx] = this[idx];
			}

			return values;
		};
	};

	var create = function(values, cb) {
		if (typeof cb !== 'function')
			cb = dummy_cb;

		var model = new Model(values);
		model.save(cb);
	};

	var del = function(cb) {
		if (typeof cb !== 'function')
			cb = dummy_cb;

		build_request({
			api: api,
			definition: definition,
			method: 'del',
			model: this
		}, function(req) {
			api.connection.request(req, function(err, res) {
				if (err)
					return cb(err);

				cb(null, res.body);
			});
		});
	};

	var get = function(id, cb) {
		if (typeof cb !== 'function')
			cb = dummy_cb;

		build_request({
			api: api, 
			definition: definition,
			method: 'get',
			id: id
		}, function(req) {
			api.connection.request(req, function(err, res) {
				if (err)
					return cb(err);

				cb(null, create_models(res.body));
			});
		});
	};

	var get_url = function() {
		return definition.get_url(api.connection.get_url());
	};

	var find = function(query, cb) {
		if (typeof cb !== 'function')
			cb = dummy_cb;

		build_request({
			api: api, 
			definition: definition,
			method: 'get',
			query: query
		}, function(req) {
			api.connection.request(req, function(err, res) {
				if (err)
					return cb(err);

				cb(null, create_models(res.body));
			});
		});
	};

	var save = function(cb) {
		if (typeof cb !== 'function')
			cb = dummy_cb;

		build_request({
			api: api,
			definition: definition,
			method: 'save',
			model: this
		}, function(req) {
			api.connection.request(req, function(err, res) {
				if (err)
					return cb(err);

				cb(null, res.body);
			});
		});
	};

	function create_models(objects) {
		if (typeof objects === 'string') {
			try {
				objects = JSON.parse(objects);
			} catch (e) {
				return false;
			}
		}

		if (Array.isArray(objects)) {
			var retVal = [];

			for (var idx in objects) {
				retVal.push(new Model(objects[idx]));
			}

			return retVal;
		} else {
			return new Model(objects);
		}
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

	var idProp = def.idProperty ? def.idProperty : conn.idProperty;

	req.uri = def.url ? def.url : conn.url;
	req.uri += '/' + params.definition.path + '/';

	if (params.id)
		req.uri += params.id;
	else if (params.model && params.model[idProp]) {

		req.uri += params.model[idProp];

		if (params.method === 'save')
			params.method = 'update';

	} else if (params.method === 'save') {
		params.method = 'new';
	}

	var method = params.method + 'Method';
	req.method = def[method] ? def[method] : conn[method];

	if (params.model && params.method !== 'del')
		req.json = params.model.__values();

	if (params.query) {
		if (typeof params.query === 'string')
			req.uri += '?' + params.query;
		if (typeof params.query === 'object')
			req.uri += '?' + querystring.stringify(params.query);
	}

	req.uri = format_uri(req.uri);

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

function dummy_cb(){}

function format_uri(uri) {
	uri = URL.parse(uri);
	uri.pathname = uri.pathname
		.replace(/\/+/g, '/')	// replace consecutive slashes with a single slash
		.replace(/\/+$/, '');	// remove trailing slash

	return URL.format(uri);
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