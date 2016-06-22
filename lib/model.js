function Model(config) {
	var properties = {};

	config.forEach(function(value, prop) {
		properties['_'+prop] = _prop_obj(value);
	});

	properties['delete'] = _prop_obj(del);
	properties['save'] = _prop_obj(save);

	Object.defineProperties(this, properties);
};

function _prop_obj(value) {
	return {
		enumerable: false,
		configurable: false,
		value: value
	};
};

function create(config, cb) {

};

function del(cb) {

};

function get(id, cb) {

};

function find(query, cb) {

};

function save(cb) {

};

// For all intents and purposes, these are static methods
Model.create = create;
Model.get = get;
Model.find = find;
Model.query = find;

module.exports = Model;