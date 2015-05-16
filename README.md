# Blister

Minimalist dependency injection container for JavaScript, inspired by Fabien Potencier's [Pimple](http://pimple.sensiolabs.org/).

## Installation

The package is available as a UMD module: compatible with AMD, CommonJS and exposing a global variable `Blister` in `dist/blister.min.js` (910 bytes minified and gzipped).

It can be installed via npm (for both Node.js and browserify/webpack), Bower or downloading it from the repository:

```bash
npm install blister
bower install blister
```

## Usage

### Loading

```js
var Blister = require('blister');

require(['blister'], function(Blister) {
  //...
});

var Blister = window.Blister;
```

### Basic usage

```js
var container = new Blister();
```

#### Setting values

Raw values can be stored in the container. The registered parameters is what the container returns when the dependency is requested.

If the dependency is not a function, the parameter is optional.

Example:

```js
container.set('protocol', 'http://' /*, container.VALUE */);
container.get('protocol'); //> 'http://'

container.set('randomFn', Math.random, container.VALUE);
container.get('randomFn'); //> function random() { [native code] }
```

#### Setting singletons

Dependencies can be registered as a singleton functions. Those functions are executed the first time the associated dependency is requested. The result of the functions is returned and cached for subsequent calls.

All the dependencies specified as functions are singletons by default.

Example:

```js
container.set('host', function(c) {
  console.log('called');
  return c.get('protocol') === 'http://' ?
    'example.com' : 'secure.example.com';
} /*, container.SINGLETON */);
container.get('host'); //> 'example.com'
// called
container.get('host'); //> 'example.com'
```

#### Setting factories

Dependencies can also be registered as factory functions. Those functions are executed every time the dependency is requested.

Example:

```js
container.set('timestamp', function() {
  return Date.now();
}, container.FACTORY);
container.get('timestamp'); 1431773272660
container.get('timestamp'); 1431773281953
```

#### Registering service providers

Service providers can be used to help organizing the registration of dependencies. A service provider is any object implementing a `register` method.

Example:

```javascript
var provider = {
 register: function(container) {
   container.set('protocol', 'http://');
   container.set('host', 'example.com');
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
npm instal && npm test
```

## Contribute

1. Fork it: `git clone https://github.com/rubennorte/blister.git`
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Check the build: `npm run build`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
