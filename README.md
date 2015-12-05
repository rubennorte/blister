# Blister

Minimalist dependency injection container for JavaScript.

## Installation

The package is available as a UMD module: compatible with AMD, CommonJS and exposing a global variable `Blister` in `dist/blister.min.js` (1.2 KB minified and gzipped).

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

container.get('name'); //> 'Robert'
container.has('name'); //> true

container.keys(); //> ['name']
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

#### Creating new scopes

Some scenarios may require different instances of a DI container. For example, we may want to have different DI containers to handle different requests of a server (having specific dependencies for the current request).

In order to be able to define global dependencies and scope-specific dependencies, we can create a new scope from a container, which is just a container that inherits dependencies from the original one.

Example:

```javascript
var container = new Blister();
container.service('logger', function() {
  return 'system logger';
});

var scope = container.createScope();
scope.get('logger'); // 'system logger'

scope.service('logger', function() {
  return 'request logger';
});
scope.get('logger'); // 'request logger'
```

__IMPORTANT__:

If you have dependencies in a container that should use dependencies from a sub-scope when accessing through it, define them as factories instead of as services.

All the dependencies of a given service are fetched from the scope where the service is defined:

```javascript
var container = new Blister();
container.service('logger', function(c) {
  return c.get('scope') + ' logger';
});
container.value('scope', 'system');

var scope = container.createScope();
scope.value('scope', 'request');

scope.get('logger'); // 'system logger';
container.get('logger'); // 'system logger';
```

This is because services are cached in the scope where they are defined (to make them a system-wide singleton as expected), so accessing a dependency of the scope would make the service inconsistent in the scope of the container (as it would use a dependency of a specifc sub-scope).

This problem does not exist in factories, because they do not have this kind of side-effects (they are not cached):

```javascript
var container = new Blister();
container.factory('logger', function(c) {
  return c.get('scope') + ' logger';
});
container.value('scope', 'system');

var scope = container.createScope();
scope.value('scope', 'request');

scope.get('logger'); // 'request logger';
container.get('logger'); // 'system logger';
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
