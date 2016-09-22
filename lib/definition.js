var defaults = {
	name: null,
	path: generate_path,
	idProperty: null,
	headers: null,
	url: null,
	children: [],
	delMethod: null,
	getMethod: null,
	newMethod: null,
	findMethod: null,
	updateMethod: null,
	transform: null,
	children: [],
	statics: {}
};

var pluralize = require('pluralize');

function Definition(def, parent) {
	var me = this;

	if (typeof def !== 'string' && typeof def !== 'object')
		throw new TypeError('Expecting definition to be a string or object');

	if (typeof def === 'string')
		def = { name: def };

	for (var key in defaults) {
		var value = null;
		if (key in def)
			value = validate(key, def[key]);
		else if (typeof defaults[key] === 'function')
			value = defaults[key](this);
		else
			value = validate(key, defaults[key]);

		Object.defineProperty(this, key, {
			writable: false,
			enumerable: true,
			configurable: false,
			value: value
		});
	}

	if (Array.isArray(this.children)) {
		var children = this.children,
			child;
		this.children = {};

		while (child = children.shift()) {
			var def = new Definition(child, this);
			this.children[def.name] = def;
		}
	}

	if (parent instanceof Definition)
		Object.defineProperty(this, '__parent', {
			writable: false,
			enumerable: false,
			value: parent
		})

	Object.defineProperty(this, '__path', {
		writable: false,
		enumerable: false,
		value: __path.bind(this)
	});
};

function __path(domain) {
	if (this.url !== null && typeof this.url === 'string')
		return this.url;
	
	var url = [domain, this.path].join('/').replace(/\/\//g, '/');

	return url;
};

function generate_path(def) {
	return pluralize(def.name);
};

function validate(key, value) {
	switch (key) {
		case 'name':
		case 'path':
			if (value === null)
				throw new TypeError('Expecting definition to contain '+ key +' property');
			else if (typeof value !== 'string')
				throw new TypeError('Expecting defintion '+ key +' to be a string');
			else
				return value;
			break;

		case 'idProperty':
		case 'url':
		case 'getMethod':
		case 'newMethod':
		case 'findMethod':
		case 'updateMethod':
		case 'delMethod':
			if (value === null)
				return value;
			else if (typeof value !== 'string')
				throw new TypeError('Expecting definition '+ key +'to be a string or null');
			else
				return value;
			break;

		case 'headers':
			if (value === null)
				return value;
			else if (typeof value === 'string')
				throw new TypeError('Expecting headers to be a function or object');
			else if (Array.isArray(value))
				throw new TypeError('Expecting headers to be a function or object');
			return value;
			break;

		case 'children':
			if (value === null)
				return [];
			else if (Array.isArray(value))
				return value;
			else
				throw new TypeError('Expecting definition children to be null or an array');
			break;

		case 'transform':
			if (value === null)
				return null;
			else if (typeof value !== 'function')
				throw new TypeError('Expecting transform to be a function');
			else
				return value;
			break;

		case 'statics':
			if (typeof value !== 'object' || Array.isArray(value))
				throw new TypeError('Expecting config statics to be an object');
			return value;
	}
};

module.exports = Definition;