[![npm](https://img.shields.io/npm/l/blister.svg)](https://www.npmjs.org/package/blister)
[![npm](https://img.shields.io/npm/v/blister.svg)](https://www.npmjs.org/package/blister)

# Blister

Minimalist dependency injection container for JavaScript.

## Installation

The package is available as a UMD module: compatible with AMD, CommonJS and exposing a global variable `Blister` in `dist/blister.min.js` (1.3 KB minified and gzipped).

It can be installed via npm (for both Node.js and browserify/webpack), Bower or downloading it from the repository:

```bash
npm install blister
bower install blister
```

## Usage

### Loading

```js
var Blister = require('blister');
```

```js
require(['blister'], function(Blister) {
  // Usage
});
```

```html
<script src="bower_components/blister/dist/blister.min.js"></script>
<script>var Blister = window.Blister;</script>
```

### Basic usage

```js
var container = new Blister();
```

#### Getting dependencies

Example:

```js
container.value('name', 'Robert');
container.value('surname', 'Baratheon');

container.get('name'); //> 'Robert'
container.has('name'); //> true
container.pick('name', 'surname'); //> { name: 'Robert', surname: 'Baratheon' }

container.keys(); //> ['name', 'surname']
```

#### Setting values

Raw values can be stored in the container. The registered parameters is what the container returns when the dependency is requested.

Example:

```js
container.value('protocol', 'http://');
container.get('protocol'); //> 'http://'

container.value('randomFn', Math.random);
container.get('randomFn'); //> function random() { [native code] }
```

#### Setting services

Dependencies can be registered as a singleton functions. Those functions are executed the first time the associated dependency is requested. The result of the functions is returned and cached for subsequent calls.

Example:

```js
container.service('host', function(c) {
  console.log('called');
  return c.get('protocol') === 'http://' ?
    'example.com' : 'secure.example.com';
});
container.get('host'); //> 'example.com'
// called
container.get('host'); //> 'example.com'
```

#### Setting factories

Dependencies can also be registered as factory functions. Those functions are executed every time the dependency is requested.

Example:

```js
container.factory('timestamp', function() {
  return Date.now();
});
container.get('timestamp'); 1431773272660
container.get('timestamp'); 1431773281953
```

#### Extending dependencies

Dependencies already defined in the container can be modified or extended. That functionality can be useful, for example, to add plugins to a service.

The extension preserves the type of the original dependency (factory or service).

Example:

```js
container.service('some-service', function() {
  return service;
});

// after that definition
container.extend('some-service', function(service, c) {
  service.addLogger(c.get('logger'));
});

container.get('service'); //> singleton service with logger
```

If the previous dependency is not used in the definition of the extension, it can be replaced using `value`, `factory` or `service` instead.

#### Registering service providers

Service providers can be used to help organizing the registration of dependencies. A service provider can be both a function or anything implementing a `register` method.

Example with a function:

```javascript
function provider(container) {
   container.value('protocol', 'http://');
   container.value('host', 'example.com');
}

var container = new Blister();
container.register(provider);
```

Example with object:

```javascript
var provider = {
 register: function(container) {
   container.value('protocol', 'http://');
   container.value('host', 'example.com');
 }
};

var container = new Blister();
container.register(provider);
```

## Documentation

To generate the code documentation of the project:

```bash
npm run doc
```

## Tests

To run the tests of the project, clone the repository and execute:

```bash
npm install && npm test
```

## Contribute

1. Fork it: `git clone https://github.com/rubennorte/blister.git`
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Check the build: `npm run build`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

Copyright (c) 2015-2016 Rubén Norte <rubennorte@gmail.com>

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
