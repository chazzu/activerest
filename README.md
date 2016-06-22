# activerest

This is COMPLETELY UNFINISHED. As of this moment, it is not even Alpha, and commits are happening during development.

## Usage

var models = activerest(urlOrConfig, definitions);

The first parameter could be just a base URL, or a configuration object detailed below.

### Configuration

```
var models = activerest({
	url: urlString, 	// Default base URL to use

	headers: null,		// Could be an object containing header: value fields OR a function which returns an object
						// The function will be called each time a REST request is made, good for complex
						// authentication methods.

	idProperty: 'id', 	// When accessing an object, we assume the id property is 'id.' Override this here.
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

picture.save();							// POST /pictures/1
newpic.save();							// PUT /pictures
```

The pluralization is automatic, but not entirely brilliant. It automatically appends an 's' unless the word ends in a y, as so:

```
picture:		/pictures
puppy:			/puppies
```

However, things are customizable.

var models = activerest(config, [{
	name: 'picture',					// Name of the returned model
	path: '/picture',					// Customize the path that the model will use
	idProperty: 'picture_id',			// Customize the property used for the ID when updating
	headers: null,						// Custom function or object to set the headers, overrides the default from config
	children: ['exif', {				// Will default paths to /pictures/idProperty/exif
		name: 'person',					// Define children just like definitions
		path: '/people'
	}]
}]);