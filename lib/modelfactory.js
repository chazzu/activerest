var async = require('async'),
	querystring = require('querystring'),
	URL = require('url');

function ModelFactory(api, definition, parent) {

	function Model(values) {
		var properties = {};

		properties['del'] = _prop_obj(del.bind(this));
		properties['save'] = _prop_obj(save.bind(this));
		properties['__api'] = _prop_obj(api);
		properties['__build_request'] = _prop_obj(build_request);
		properties['__build_request_uri'] = _prop_obj(build_request_uri.bind(this));
		properties['__definition'] = _prop_obj(definition);
		properties['__dirty'] = _prop_obj(__dirty.bind(this));
		properties['__parent'] = _prop_obj(parent);
		properties['__values'] = _prop_obj(__values.bind(this));


		for (var idx in api.connection.properties)
			properties[idx] = _prepare_property(api.connection.properties[idx], this);

		for (var idx in definition.properties)
			properties[idx] = _prepare_property(definition.properties[idx], this);

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

		if (
			definition.children !== null 
			&& typeof definition.children === 'object'
		)  {
			for (var name in definition.children) {
				Object.defineProperty(this, name, {
					enumerable: false,
					configurable: false,
					value: ModelFactory(api, definition.children[name], this)
				});
			}
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

	var create = function(values, cb, transform) {
		if (typeof cb !== 'function')
			cb = dummy_cb;

		var model = new Model(values);
		model.save(cb, transform);
	};

	var del = function(cb, transform) {
		if (typeof cb !== 'function')
			cb = dummy_cb;
		if (typeof transform !== 'function')
			transform = handle_request;

		build_request({
			api: api,
			definition: definition,
			method: 'del',
			model: this,
			parent: parent
		}, transform.bind(this, api.connection.request, cb));
	};

	var get = function(id, cb, transform) {
		if (typeof cb !== 'function')
			cb = dummy_cb;

		if (typeof transform !== 'function')
			transform = handle_request_models;

		build_request({
			api: api, 
			definition: definition,
			method: 'get',
			id: id,
			parent: parent
		}, transform.bind(this, api.connection.request, cb));
	};

	var find = function(query, cb, transform) {
		if (typeof cb !== 'function') {
			if (typeof query === 'function') {
				cb = query;
				query = '';
			} else {
				cb = dummy_cb;
			}
		}

		if (typeof transform !== 'function')
			transform = handle_request_models;

		build_request({
			api: api, 
			definition: definition,
			method: 'get',
			query: query,
			parent: parent
		}, transform.bind(this, api.connection.request, cb));
	};

	var save = function(cb, transform) {
		if (typeof cb !== 'function')
			cb = dummy_cb;
		if (typeof transform !== 'function')
			transform = handle_request;

		build_request({
			api: api,
			definition: definition,
			method: 'save',
			model: this,
			parent: parent
		}, transform.bind(this, api.connection.request, cb));
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

	function handle_request(fn, cb, req) {
		fn(req, function(err, res) {
			if (err)
				return cb(err);

			cb(null, res.body);
		});
	};

	function handle_request_models(fn, cb, req) {
		fn(req, function(err, res) {
			if (err)
				return cb(err);

			cb(null, create_models(res.body));
		});
	};

	// For all intents and purposes, these are static methods
	Model.create = create;
	Model.get = get;
	Model.find = find;
	Model.query = find;

	for (var idx in api.connection.statics) {
		var static = api.connection.statics[idx];

		if (typeof static === 'function')
			static = static.bind(Model);

		Model[idx] = static;
	}

	for (var idx in definition.statics) {
		var static = definition.statics[idx];

		if (typeof static === 'function')
			static = static.bind(Model);

		Model[idx] = static;
	}


	Model.__definition = definition;
	Model.__parent = parent;

	return Model;
}

function build_request(params, cb) {
	var conn = params.api.connection,
		def = params.definition,
		req = {},
		stack = [];

	req.uri = build_request_uri(def, conn, params);
	req.method = build_request_method(def, conn, params);

	if (params.model && params.method !== 'del')
		req.json = params.model.__values();

	build_request_headers(def, conn, req);

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

function build_request_headers(def, conn, req) {
	req.headers = {};

	if (typeof conn.headers === 'object' && conn.headers !== null)
		req.headers = conn.headers;
	if (typeof def.headers === 'object' && def.headers !== null)
		req.headers = def.headers;
	if (typeof conn.headers === 'function')
		conn.headers(req);
	if (typeof def.headers === 'function')
		def.headers(req);
};

function build_request_method(def, conn, params) {
	var idProp = def.idProperty ? def.idProperty : conn.idProperty,
		method = params.method;

	if (method === 'save') {
		if (params.model && params.model[idProp])
			method = 'update';
		else
			method = 'new';
	}

	var method = method + 'Method';

	if (def[method] || conn[method])
		method = def[method] ? def[method] : conn[method];
	else
		method = params.method;

	return method;
};

function build_request_uri(def, conn, params) {
	if (params.parent) {
		var uri = build_request_uri(params.parent.__definition, conn, {
			model: params.parent,
			parent: params.parent.__parent
		});
	} else {
		var uri = def.url ? def.url : conn.url;
	}

	var idProp = def.idProperty ? def.idProperty : conn.idProperty;
	
	uri += '/' + def.path + '/';

	if (params.id)
		uri += params.id;
	else if (params.model && params.model[idProp]) {
		uri += params.model[idProp];
	}

	if (params.path)
		uri += params.path;

	if (params.query) {
		if (typeof params.query === 'string')
			uri += '?' + params.query;
		if (typeof params.query === 'object')
			uri += '?' + querystring.stringify(params.query);
	}

	uri = format_uri(uri);

	return uri;
};

function dummy_cb(){}

function format_uri(uri) {
	uri = URL.parse(uri);
	uri.pathname = uri.pathname
		.replace(/\/+/g, '/')	// replace consecutive slashes with a single slash
		.replace(/\/+$/, '');	// remove trailing slash

	return URL.format(uri);
};

function _prepare_property(property, context) {
	if (typeof property === 'function')
		property = _prop_obj(property.bind(context));
	else if (Array.isArray(property))
		property = property.slice();
	else if (typeof property === 'object')
		property = Object.assign({}, property);
	return property;
}

function _prop_obj(value) {
	return {
		enumerable: false,
		configurable: false,
		writable: false,
		value: value
	};
};

module.exports = ModelFactory;