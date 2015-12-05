'use strict';

var BlisterContainer = require('../../../src/blister');

function createCounter() {
  var count = 0;
  return function() {
    count++;
    return count;
  };
}

describe('BlisterContainer', function() {

  it('should be a class with the proper API', function() {
    expect(BlisterContainer).toEqual(jasmine.any(Function));

    expect(BlisterContainer.prototype.get).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.has).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.value).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.factory).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.service).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.register).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.extend).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.createScope).toEqual(jasmine.any(Function));

    expect(BlisterContainer.IllegalExtensionError).toEqual(jasmine.any(Function));
    expect(BlisterContainer.UnregisteredExtendedDependencyError).toEqual(jasmine.any(Function));
    expect(BlisterContainer.UnregisteredDependencyError).toEqual(jasmine.any(Function));
  });

  var container;
  beforeEach(function() {
    container = new BlisterContainer();
  });

  describe('#get(id)', function() {

    describe('when the id is not a string', function() {

      it('should throw a type error', function() {
        expect(function() {
          container.get(5);
        }).toThrowError(TypeError);
      });

    });

    describe('when the id does not reference a registered dependency', function() {

      it('should throw an error', function() {
        expect(function() {
          container.get('id');
        }).toThrowError(BlisterContainer.UnregisteredDependencyError);
      });

    });

    describe('when there is an error accessing a service', function() {

      it('should not cache it', function() {
        container.service('id', function(c) {
          return c.get('value');
        });

        expect(function() {
          container.get('id');
        }).toThrow();

        container.value('value', 'value');

        expect(container.get('id')).toEqual('value');
      });

    });

  });

  describe('#has(id)', function() {

    describe('when there is a dependency with the given id', function() {

      it('should return true', function() {
        container.value('id', 'value');
        expect(container.has('id')).toBe(true);
      });

    });

    describe('when there is no dependency with the given id', function() {

      it('should return false', function() {
        expect(container.has('id')).toBe(false);
      });

    });

    describe('when the given id is not a string', function() {

      it('should throw a type error', function() {
        expect(function() {
          container.has(5);
        }).toThrowError(TypeError);
      });

    });

  });

  describe('#keys()', function() {

    it('should return the keys of all the registered dependencies', function() {
      container.value('some-value', 3);
      container.service('some-service', function() {});
      container.factory('some-factory', function() {});

      expect(container.keys()).toEqual(['some-value', 'some-service', 'some-factory']);
    });

  });

  describe('#value(id, argument)', function() {

    it('should register so get(id) returns the argument', function() {
      container.value('string-id', 'foo');
      expect(container.get('string-id')).toBe('foo');

      var valueFn = function() {};
      container.value('function-id', valueFn);
      expect(container.get('function-id')).toBe(valueFn);
    });

    it('should overwrite a previously defined argument with the same id', function() {
      container.value('id', 'foo');
      container.value('id', 5);
      expect(container.get('id')).toBe(5);
    });

    it('should return the container', function() {
      expect(container.value('id', 'foo')).toBe(container);
    });

    describe('when the id is not a string', function() {

      it('should throw a type error', function() {
        expect(function() {
          container.value(5, 'foo');
        }).toThrowError(TypeError);
      });

    });

  });

  describe('#factory(id, argument)', function() {

    it('should register so get(id) returns the result of a new call to argument', function() {
      container.factory('factory', createCounter());

      var first = container.get('factory');
      var second = container.get('factory');
      expect(first).toBe(1);
      expect(second).toBe(2);
    });

    it('should register so get(id) calls argument with container as "this" and param', function() {
      var factoryFn = jasmine.createSpy('factoryFn');
      container.factory('factory', factoryFn);
      container.get('factory');
      expect(factoryFn).toHaveBeenCalledWith(container);
      expect(factoryFn.calls.count()).toEqual(1);
      expect(factoryFn.calls.first().object).toBe(container);
    });

    it('should not call the argument until get(id) is called', function() {
      var factoryFn = jasmine.createSpy('factoryFn');
      container.factory('factory', factoryFn);
      expect(factoryFn).not.toHaveBeenCalled();

      container.get('factory');
      expect(factoryFn).toHaveBeenCalled();
    });

    it('should overwrite a previously defined argument with the same id', function() {
      container.factory('id', function() {
        return 'foo';
      });
      container.factory('id', function() {
        return 5;
      });
      expect(container.get('id')).toBe(5);
    });

    it('should return the container', function() {
      expect(container.factory('id', function() {})).toBe(container);
    });

    describe('when the id is not a string', function() {

      it('should throw a type error', function() {
        expect(function() {
          container.factory(5, function() {});
        }).toThrowError(TypeError);
      });

    });

    describe('when the argument is not a function', function() {

      it('should throw a type error', function() {
        expect(function() {
          container.factory('string-id', 'foo');
        }).toThrowError(TypeError);
      });

    });

  });

  describe('#service(id, argument)', function() {

    it('should register so get(id) returns a cached result of the argument', function() {
      container.service('service', createCounter());
      var first = container.get('service');
      var second = container.get('service');
      expect(first).toBe(1);
      expect(second).toBe(1);
    });

    it('should register so get(id) calls argument with container as "this" and param', function() {
      var serviceFn = jasmine.createSpy('serviceFn');
      container.service('service', serviceFn);
      container.get('service');
      expect(serviceFn).toHaveBeenCalledWith(container);
      expect(serviceFn.calls.count()).toEqual(1);
      expect(serviceFn.calls.first().object).toBe(container);
    });

    it('should not call the argument until get(id) is called', function() {
      var serviceFn = jasmine.createSpy();
      container.service('service', serviceFn);
      expect(serviceFn).not.toHaveBeenCalled();

      container.get('service');
      expect(serviceFn).toHaveBeenCalled();
    });

    it('should overwrite a previously defined argument with the same id', function() {
      container.service('id', function() {
        return 'foo';
      });
      container.service('id', function() {
        return 5;
      });
      expect(container.get('id')).toBe(5);
    });

    it('should return the container', function() {
      expect(container.service('id', function() {})).toBe(container);
    });

    describe('when the argument is not a function', function() {

      it('should throw a type error', function() {
        expect(function() {
          container.service('string-id', 'foo');
        }).toThrowError(TypeError);
      });

    });

  });

  describe('#extend(id, argument)', function() {

    it('should throw an error if the dependency is not already registered', function() {
      expect(function() {
        container.extend('id', function() {});
      }).toThrowError(BlisterContainer.UnregisteredExtendedDependencyError);
      expect(function() {
        container.extend('id', 'foo');
      }).toThrowError(BlisterContainer.UnregisteredExtendedDependencyError);
    });

    describe('when extending a value', function() {

      it('should extend so get(id) returns a cached result of the argument', function() {
        container.value('id', 'value');
        container.extend('id', createCounter());

        expect(container.get('id')).toBe(1);
        expect(container.get('id')).toBe(1);
      });

      it('should extend so get(id) calls properly the new argument', function() {
        container.value('id', 'value');
        var valueFn = jasmine.createSpy('valueFn');
        container.extend('id', valueFn);

        container.get('id');
        expect(valueFn).toHaveBeenCalledWith('value', container);
        expect(valueFn.calls.first().object).toBe(container);

        container.get('id');
        expect(valueFn).toHaveBeenCalledWith('value', container);
        expect(valueFn.calls.first().object).toBe(container);
      });

      it('should return the container', function() {
        container.value('id', 'value');
        var returnValue = container.extend('id', function() {});
        expect(returnValue).toBe(container);
      });

      describe('when the argument is not a function', function() {

        it('should throw a type error', function() {
          container.value('id', 'value');

          expect(function() {
            container.extend('id', 'foo');
          }).toThrowError(TypeError);
        });

      });

    });

    describe('when extending a factory', function() {

      it('should extend so get(id) returns the result of a new call to argument', function() {
        container.factory('id', function() {});
        container.extend('id', createCounter());

        expect(container.get('id')).toBe(1);
        expect(container.get('id')).toBe(2);
      });

      it('should extend so get(id) calls properly the new argument', function() {
        container.factory('id', createCounter());
        var factoryFn = jasmine.createSpy('factoryFn');
        container.extend('id', factoryFn);

        container.get('id');
        expect(factoryFn).toHaveBeenCalledWith(1, container);
        expect(factoryFn.calls.count()).toEqual(1);
        expect(factoryFn.calls.all()[0].object).toBe(container);

        container.get('id');
        expect(factoryFn).toHaveBeenCalledWith(2, container);
        expect(factoryFn.calls.count()).toEqual(2);
        expect(factoryFn.calls.all()[1].object).toBe(container);
      });

      it('should return the container', function() {
        container.factory('id', function() {});
        var returnValue = container.extend('id', function() {});
        expect(returnValue).toBe(container);
      });

      describe('when the argument is not a function', function() {

        it('should throw a type error', function() {
          container.factory('factory', function() {});
          expect(function() {
            container.extend('factory', 'foo');
          }).toThrowError(TypeError);
        });

      });

    });

    describe('when extending a service', function() {

      it('should extend so get(id) returns a cached result of the argument', function() {
        container.service('id', function() {});
        container.extend('id', createCounter());

        expect(container.get('id')).toBe(1);
        expect(container.get('id')).toBe(1);
      });

      it('should extend so get(id) calls properly the new argument', function() {
        container.service('id', createCounter());
        var serviceFn = jasmine.createSpy('serviceFn');
        container.extend('id', serviceFn);

        container.get('id');
        expect(serviceFn).toHaveBeenCalledWith(1, container);
        expect(serviceFn.calls.first().object).toBe(container);

        container.get('id');
        expect(serviceFn).toHaveBeenCalledWith(1, container);
        expect(serviceFn.calls.first().object).toBe(container);
      });

      it('should return the container', function() {
        container.service('id', function() {});
        var returnValue = container.extend('id', function() {});
        expect(returnValue).toBe(container);
      });

      describe('when the argument is not a function', function() {

        it('should throw a type error', function() {
          container.service('service', function() {});

          expect(function() {
            container.extend('service', 'foo');
          }).toThrowError(TypeError);
        });

      });

    });

  });

  describe('#register(provider)', function() {

    describe('when the provider is a function', function() {

      it('should call it with the container as parameter', function() {
        var provider = jasmine.createSpy('provider');
        container.register(provider);
        expect(provider).toHaveBeenCalledWith(container);
      });

      it('should return the container', function() {
        var returnValue = container.register(function() {});
        expect(returnValue).toBe(container);
      });

    });

    describe('when the provider is an object', function() {

      it('should call provider.register with the container as parameter', function() {
        var provider = jasmine.createSpyObj('provider', ['register']);
        container.register(provider);
        expect(provider.register).toHaveBeenCalledWith(container);
      });

      it('should return the container', function() {
        var provider = jasmine.createSpyObj('provider', ['register']);
        var returnValue = container.register(provider);
        expect(returnValue).toBe(container);
      });

      it('should throw an error if the provider does not have a register method', function() {
        expect(function() {
          container.register(5);
        }).toThrowError(TypeError);

        expect(function() {
          container.register({});
        }).toThrowError(TypeError);
      });

    });

  });

  describe('#createScope()', function() {

    it('should return a new BlisterContainer instance', function() {
      var scope = container.createScope();

      expect(scope).toEqual(jasmine.any(BlisterContainer));
      expect(scope).not.toBe(container);
    });

    describe('the new BlisterContainer instance', function() {

      it('should inherit all the current dependencies of the container', function() {
        container.service('service-dep', function() {
          return 'service';
        });
        container.factory('factory-dep', function() {
          return 'factory';
        });
        container.value('value-dep', 'value');

        var scope = container.createScope();

        expect(scope.get('service-dep')).toEqual('service');
        expect(scope.get('factory-dep')).toEqual('factory');
        expect(scope.get('value-dep')).toEqual('value');
      });

      it('should inherit all the future dependencies of the container', function() {
        var scope = container.createScope();

        container.service('service-dep', function() {
          return 'service';
        });
        container.factory('factory-dep', function() {
          return 'factory';
        });
        container.value('value-dep', 'value');

        expect(scope.get('service-dep')).toEqual('service');
        expect(scope.get('factory-dep')).toEqual('factory');
        expect(scope.get('value-dep')).toEqual('value');
      });

      it('should shadow the dependencies of the container', function() {
        container.service('service-dep', function() {
          return 'service';
        });
        container.factory('factory-dep', function() {
          return 'factory';
        });
        container.value('value-dep', 'value');

        var scope = container.createScope();

        scope.service('service-dep', function() {
          return 'scope-service';
        });
        scope.factory('factory-dep', function() {
          return 'scope-factory';
        });
        scope.value('value-dep', 'scope-value');

        expect(scope.get('service-dep')).toEqual('scope-service');
        expect(scope.get('factory-dep')).toEqual('scope-factory');
        expect(scope.get('value-dep')).toEqual('scope-value');
      });

      it('should be able to extend the dependencies of the container', function() {
        container.service('service-dep', function() {
          return 'service';
        });

        var scope = container.createScope();
        scope.extend('service-dep', function(service) {
          return 'scope-' + service;
        });

        expect(scope.get('service-dep')).toEqual('scope-service');
      });

      it('should not modify the dependencies of the container', function() {
        container.service('service-dep', function() {
          return 'service';
        });
        container.factory('factory-dep', function() {
          return 'factory';
        });
        container.value('value-dep', 'value');

        var scope = container.createScope();

        scope.service('service-dep', function() {
          return 'scope-service';
        });
        scope.factory('factory-dep', function() {
          return 'scope-factory';
        });
        scope.value('value-dep', 'scope-value');

        expect(container.get('service-dep')).toEqual('service');
        expect(container.get('factory-dep')).toEqual('factory');
        expect(container.get('value-dep')).toEqual('value');
      });

      it('should return the keys of the parent and its own', function() {
        container.value('container-value', 1);
        var scope = container.createScope();
        scope.value('scope-value', 1);
        expect(scope.keys()).toEqual(['scope-value', 'container-value']);
      });

    });

    describe('factories defined in the scope of a container', function() {

      it('should use dependencies of a scope when accessing through it', function() {
        container.factory('factory-dep', function(c) {
          return 'got ' + c.get('sub-dep');
        });

        var scope = container.createScope();
        scope.factory('sub-dep', function() {
          return 'scope-dep';
        });

        expect(scope.get('factory-dep')).toEqual('got scope-dep');
      });

      it('should use dependencies of the container when accessing through it', function() {
        container.factory('factory-dep', function(c) {
          return 'got ' + c.get('sub-dep');
        });

        var scope = container.createScope();
        scope.factory('sub-dep', function() {
          return 'scope-dep';
        });

        expect(function() {
          container.get('factory-dep');
        }).toThrowError(BlisterContainer.UnregisteredDependencyError);

        container.factory('sub-dep', function() {
          return 'container-dep';
        });
        expect(container.get('factory-dep')).toEqual('got container-dep');
      });

    });

    describe('services defined in the scope of a container', function() {

      it('should NOT use dependencies of a scope when accessing through it', function() {
        container.service('service-dep', function(c) {
          return 'got ' + c.get('factory-dep');
        });

        var scope = container.createScope();

        scope.factory('factory-dep', function() {
          return 'scope-factory';
        });

        expect(function() {
          scope.get('service-dep');
        }).toThrowError(BlisterContainer.UnregisteredDependencyError);
      });

      it('should use dependencies of the container when accessing through it', function() {
        container.service('service-dep', function(c) {
          return 'got ' + c.get('factory-dep');
        });

        var scope = container.createScope();
        scope.factory('factory-dep', function() {
          return 'scope-factory';
        });

        expect(function() {
          container.get('service-dep');
        }).toThrowError(BlisterContainer.UnregisteredDependencyError);

        container.factory('factory-dep', function() {
          return 'container-factory';
        });
        expect(container.get('service-dep')).toEqual('got container-factory');
      });

    });

  });

  describe('#withScope(values)', function() {

    it('should return a new scope with the passed keys registered as values', function() {
      var newScope = new BlisterContainer();
      spyOn(container, 'createScope').and.returnValue(newScope);

      var scope = container.withScope({value1: 'value1', value2: 'value2'});

      expect(scope).toBe(newScope);
      expect(scope.get('value1')).toBe('value1');
      expect(scope.get('value2')).toBe('value2');
    });

  });

});
