let URL
if (typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node !== 'undefined')
	URL = require('url')
else
	URL = null

function ModelFactory(api, definition, parent) {

	if (!api.connection) // Unit-testing stub
		api.connection = {}

	function Model(values) {
		let properties = {};

		properties['del'] = _prop_obj(del.bind(this));
		properties['save'] = _prop_obj(save.bind(this));
		properties['__api'] = _prop_obj(api);
		properties['__build_request'] = _prop_obj(build_request);
		properties['__build_request_uri'] = _prop_obj(build_request_uri.bind(this));
		properties['__definition'] = _prop_obj(definition);
		properties['__dirty'] = _prop_obj(__dirty.bind(this));
		properties['__parent'] = _prop_obj(parent);
		properties['__values'] = _prop_obj(__values.bind(this));


		for (let idx in api.connection.properties)
			properties[idx] = _prepare_property(api.connection.properties[idx], this);

		for (let idx in definition.properties)
			properties[idx] = _prepare_property(definition.properties[idx], this);

		Object.defineProperties(this, properties);

		if (typeof values === 'object') {
			for (var name in values) {
				Object.defineProperty(this, name, {
					enumerable: true,
					configurable: false,
					writable: true,
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
		var model = new Model(values);
		return model.save(cb, transform);
	};

	var del = function(cb, transform) {
		if (typeof transform !== 'function')
			transform = handle_request;
		else transform = promisify(transform)

		return promisify_request(build_request({
			api: api,
			definition: definition,
			method: 'del',
			model: this,
			parent: parent
		}), api, transform, cb)
	};

	var get = function(id, cb, transform) {
		if (typeof transform !== 'function')
			transform = handle_request_models;
		else transform = promisify(transform)

		return promisify_request(build_request({
			api: api, 
			definition: definition,
			method: 'get',
			id: id,
			parent: parent
		}), api, transform, cb)
	};

	var find = function(query, cb, transform) {
		if (typeof cb !== 'function') {
			if (typeof query === 'function') {
				cb = query;
				query = '';
			}
		}

		if (typeof transform !== 'function')
			transform = handle_request_models;
		else transform = promisify(transform)

		return promisify_request(build_request({
			api: api, 
			definition: definition,
			method: 'get',
			query: query,
			parent: parent
		}), api, transform, cb)
	};

	var save = function(cb, transform) {
		if (typeof transform !== 'function')
			transform = handle_request;
		else transform = promisify(transform)

		return promisify_request(build_request({
			api: api,
			definition: definition,
			method: 'save',
			model: this,
			parent: parent
		}), api, transform, cb)
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

	function handle_request(fn, req) {
		return fn(req)
	};

	function handle_request_models(fn, req) {
		return fn(req).then(res => create_models(res))
	};

	// For all intents and purposes, these are static methods
	Model.create = create;
	Model.get = get;
	Model.find = find;
	Model.query = find;

	for (let idx in api.connection.statics) {
		let staticProp = api.connection.statics[idx];

		if (typeof staticProp === 'function')
			staticProp = staticProp.bind(Model);

		Model[idx] = staticProp;
	}

	for (let idx in definition.statics) {
		let staticProp = definition.statics[idx];

		if (typeof staticProp === 'function')
			staticProp = staticProp.bind(Model);

		Model[idx] = staticProp;
	}


	Model.__definition = definition;
	Model.__parent = parent;

	return Model;
}

function build_request(params) {
	var conn = params.api.connection,
		def = params.definition,
		req = {}

	req.uri = build_request_uri(def, conn, params);
	req.method = build_request_method(def, conn, params);

	if (params.model && params.method !== 'del')
		req.json = params.model.__values();

	build_request_headers(def, conn, req);

	return promisify(conn.transform.bind(null, req))
		.then(req => promisify(def.transform.bind(null, req)))
};

function build_request_headers(def, conn, req) {
	req.headers = {};

	if (typeof conn.headers === 'object' && conn.headers !== null)
		req.headers = conn.headers;
	if (typeof def.headers === 'object' && def.headers !== null)
		req.headers = def.headers;

	if (req.headers != {}) // Deep clone to prevent later transforms from modifying object
		req.headers = JSON.parse(JSON.stringify(req.headers));

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

	let methodName = method + 'Method';

	if (def[methodName] || conn[methodName])
		methodName = def[methodName] ? def[methodName] : conn[methodName];
	else
		methodName = params.method;

	return methodName;
};

function build_request_uri(def, conn, params) {
	let uri
	if (params.parent) {
		uri = build_request_uri(params.parent.__definition, conn, {
			model: params.parent,
			parent: params.parent.__parent
		});
	} else {
		uri = def.url ? def.url : conn.url;
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
			uri += '?' + stringify_query(params.query)
	}

	uri = format_uri(uri);

	return uri;
}

function format_uri(uri) {
	let parsed
	if (URL)
		parsed = URL.parse(uri)
	else { // Let the browser handle parsing the URL
		parsed = document.createElement('a')
		parsed.href = uri
	}

	parsed.pathname = parsed.pathname
		.replace(/\/+/g, '/')	// replace consecutive slashes with a single slash
		.replace(/\/+$/, '');	// remove trailing slash

	if (URL)
		return URL.format(parsed)
	else
		return parsed.protocol + '//' + parsed.host + parsed.pathname + (parsed.search ? parsed.search : '')
};

function promisify(fn) {
	return new Promise((resolve, reject) => {
		let cb = function promisified_cb(err, result) {
			if (err)
				reject(err)
			else
				resolve(result)
		}

		const retval = fn(cb)
		if (retval instanceof Promise)
			resolve(retval)
	})
}

function promisify_request(promise, api, transform, cb) {
	return promise
		.then(req => transform(api.connection.request, req))
		.then(result => {
			if (typeof cb === 'function')
				cb(null, result)
			return result
		})
		.catch(err => {
			if (typeof cb === 'function')
				cb(err)
			else throw err
		})
}

function stringify_query(query) {
	let params = []

	Object.keys(query).forEach(key => {
		params.push([key, query[key]].join('='))
	})

	return params.join('&')
}

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