const Connection = require('./lib/connection'),
	Definition = require('./lib/definition'),
	ModelFactory = require('./lib/modelfactory');

class API {
	constructor(config, definitions) {
		if (!config || (typeof config !== 'string' && typeof config !== 'object'))
			throw new TypeError('Expecting config to be a string or object');

		if (!definitions || Array.isArray(definitions) === false)
			throw new TypeError('Expecting definitions to be an array');

		this.connection = new Connection(config);
		this.definitions = buildDefinitions(definitions);
		this.models = buildModels(this);

		// Set up shorthand
		for (var name in this.models) {
			this[name] = this.models[name];
		}
	}
}

function buildDefinitions(definitions) {
	let defs = {};

	definitions.forEach(function(def) {
		def = new Definition(def);
		defs[def.name] = def;
	})

	return defs;
}

function buildModels(api) {
	let models = {};

	for (let name in api.definitions) {
		models[name] = ModelFactory(api, api.definitions[name]);
	}

	return models;
}

module.exports = API