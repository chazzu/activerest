var defaults = {
	name: '',
	path: generate_path,
	idProperty: 'id',
	headers: null,
	children: []
};

var pluralize = require('pluralize');

function Definition(def) {
	var me = this;

	if (typeof def !== 'string' && typeof def !== 'object')
		throw new TypeError('Expecting definition to be a string or object');

	for (var key in defaults) {
		var value = null;
		if (key in def)
			value = validate(key, def[key]);
		else if (typeof defaults[key] === 'function')
			value = defaults[key](this);
		else
			value = validate(key, null);

		Object.defineProperty(this, key, {
			writable: false,
			enumerable: true,
			configurable: false,
			value: value
		});
	}
};

function generate_path(def) {
	return pluralize(def.name);
};

function validate(key, value) {
	switch (key) {
		case 'name':
		case 'path':
		case 'idProperty':
			if (value === null)
				throw new TypeError('Expecting definition to contain '+ key +' property');
			else if (typeof value !== 'string')
				throw new TypeError('Expecting defintion '+ key +' to be a string');
			else
				return value;
			break;

		case 'headers':
			return value;
			break;

		case 'children':
			if ('forEach' in value)
				return value;
			else if (value === null)
				return [];
			else
				throw new TypeError('Expecting definition children to be null or an array');
			break;
	}
};

module.exports = Definition;