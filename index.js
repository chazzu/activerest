var Connection = require('./lib/connection'),
	Definition = require('./lib/definition'),
	ModelFactory = require('./lib/modelfactory');

function API(config, definitions) {
	if (!config || (typeof config !== 'string' && typeof config !== 'object'))
		throw new TypeError('Expecting config to be a string or object');

	if (!definitions || Array.isArray(definitions) === false)
		throw new TypeError('Expecting definitions to be an array');

	this.connection = new Connection(config);
	this.definitions = build_definitions(definitions);
	this.models = build_models(this);

	// Set up shorthand
	for (var name in this.models) {
		this[name] = this.models[name];
	}
};

function build_definitions(definitions) {
	var defs = {};

	definitions.forEach(function(def) {
		def = new Definition(def);
		defs[def.name] = def;
	});

	return defs;
};

function build_models(api) {
	var models = {};

	for (var name in api.definitions) {
		models[name] = ModelFactory(api, api.definitions[name]);
	};

	return models;
};

module.exports = API;