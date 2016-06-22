var connection = require('./lib/connection'),
	definition = require('./lib/definition'),
	proto = require('./lib/prototype');

module.exports = function(config, definitions) {
	var models = {};

	if (!config || (typeof config !== 'string' && typeof config !== 'object'))
		throw new TypeError('Expecting config to be a string or object');

	if (!definitions || typeof definitions.forEach === 'undefined')
		throw new TypeError('Expecting definitions to be an array');

	var connection = new Connection(config);

	build_models(connection, definitions, models);

	return models;
};

function build_models(connection, definitions, models) {
	definitions.forEach(function(def) {
			def = new definition(def);
			name = def.name;
		}

		models[name] = proto.bind(def, connection);
	});
};