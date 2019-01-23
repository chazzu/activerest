const Fetch = require('cross-fetch')

const defaults = {
	idProperty: 'id',
	url: null,
	delMethod: 'DELETE',
	getMethod: 'GET',
	newMethod: 'POST',
	findMethod: 'GET',
	updateMethod: 'PUT',
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	},
	transform: null,
	statics: {},
	properties: {}
}

class Connection {
	constructor(config) {
		if (typeof config === 'string') {

			config = {
				url: config,
				headers: {}
			}
	
		} else {
	
			for (let key in defaults) {
				let value = null
				if (key in config)
					value = validate(key, config[key])
				else if (typeof defaults[key] === 'function')
					value = defaults[key]
				else
					value = validate(key, defaults[key])
	
				this[key] = value
	
			}
	
		}
	
		this.request = do_request.bind(this)
	}
}

function do_request(req) {
	return Fetch(req.uri, req).then(result => result.json())
}

function validate_headers(headers) {
	if (!headers)
		return null

	else if (typeof headers === 'string')
		return {
			'Authorization': headers
		}

	else if (typeof headers === 'function')
		return headers

	else if (typeof headers !== 'object')
		throw new TypeError('Expecting headers to be a string, function, or object')

	else if (Array.isArray(headers))
		throw new TypeError('Expecting headers to be a string, function, or object')

	else
		return headers
}

function validate(key, value) {
	switch (key) {
		case 'url':
		case 'idProperty':
			if (value === null)
				throw new TypeError('Expecting config to contain '+ key +' property')
			else if (typeof value !== 'string')
				throw new TypeError('Expecting config '+ key +' to be a string')
			else
				return value
			break

		case 'getMethod':
		case 'newMethod':
		case 'findMethod':
		case 'updateMethod':
		case 'delMethod':
			if (value === null)
				return value
			else if (typeof value !== 'string')
				throw new TypeError('Expecting config '+ key +'to be a string or null')
			else
				return value
			break

		case 'transform':
			if (value === null)
				return (req, cb) => { if (typeof cb === 'function') return cb(null, req) }
			else if (typeof value !== 'function')
				throw new TypeError('Expecting transform to be a function')
			else
				return value
			break

		case 'headers':
			return validate_headers(value)
			break

		case 'statics':
		case 'properties':
			if (typeof value !== 'object' || Array.isArray(value))
				throw new TypeError('Expecting config statics to be an object')
			return value
	}
}

function parseBody(result) {
	return new Promise(resolve => {
		let json = result.json(),
			text = result.text()
		if (json)
			resolve(json)
		else
			resolve(text)
	})
}

module.exports = Connection