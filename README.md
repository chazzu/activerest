# activerest

This is COMPLETELY UNFINISHED. As of this moment, it is not even Alpha, and commits are happening during development.

## Usage

```
var models = activerest(urlOrConfig, definitions);
```

The first parameter could be just a base URL, or a configuration object detailed below.

### Configuration

```
var API = require('activerest');

var models = new api({
	url: urlString, 		// Default base URL to use

	headers: null,			// Could be an object containing header: value fields OR a function which returns an object
							// The function will be called each time a REST request is made, good for complex
							// authentication methods. It will be called with the path and any post data.

	getMethod: 'GET',		// Override the method used when getting an object
	newMethod: 'PUT',		// Override the method used when creating an object
	findMethod: 'GET',		// Override the method used when finding an object
	updateMethod: 'PUT',	// Override the method used when updating an object

	transform: null,		// Would be a function of form function(req, cb); is passed in the entire request to transform
							// as necessary for complex requests

	statics: {				// A key-value object which defines static objects that should be added to the model
		count: function() { // An example of a function that will be added, such that Model.count calls this function
		}
	}

}, definitions);
```

### Model Definition

The model definitions could be an array, like this:

var models = activerest(config, ['picture', 'note']);

This will give you models.picture and models.note, which will use all the default values. Requests will be:

```
var pictures = models.picture.find(); 	// GET /pictures
var picture = models.picture.get(1); 	// GET /pictures/1
var newpic = new models.picture();

picture.save();							// PUT /pictures/1
newpic.save();							// POST /pictures
```

Model names are automatically pluralized into paths, using the [Pluralize](https://www.npmjs.com/package/pluralize) module.

```
picture:		/pictures
puppy:			/puppies
person:			/people
```

However, things are customizable.

```
var models = activerest(config, [{
	name: 'picture',					// Name of the returned model
	path: '/picture',					// Customize the path that the model will use
	idProperty: 'picture_id',			// Customize the property used for the ID when updating.
	getMethod: 'GET',					// Override the method used when getting an object
	newMethod: 'PUT',					// Override the method used when creating an object
	findMethod: 'QUERY',				// Override the method used when finding an object
	updateMethod: 'PATCH',				// Override the method used when updating an object
	headers: null,						// Custom function or object to set the headers, overrides the default from config
	transform: null						// As above, this is the last function to be passed the request for transformation
}, {
	name: 'person',	
	url: 'http://domain.com/people'		// Specify a completely different URL just for this
}]);
```