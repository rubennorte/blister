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

  it('should be a class with API: get, value, factory, singleton, extend, register and error types', function() {
    expect(BlisterContainer).toEqual(jasmine.any(Function));
    
    expect(BlisterContainer.prototype.get).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.value).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.factory).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.singleton).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.register).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.extend).toEqual(jasmine.any(Function));

    expect(BlisterContainer.IllegalExtensionError).toEqual(jasmine.any(Function));
    expect(BlisterContainer.MissingExtendedDependencyError).toEqual(jasmine.any(Function));
  });

  var container;
  beforeEach(function() {
    container = new BlisterContainer();
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

  describe('#singleton(id, argument)', function() {

    it('should register so get(id) returns a cached result of the argument', function() {
      container.singleton('singleton', createCounter());
      var first = container.get('singleton');
      var second = container.get('singleton');
      expect(first).toBe(1);
      expect(second).toBe(1);
    });

    it('should register so get(id) calls argument with container as "this" and param', function() {
      var singletonFn = jasmine.createSpy('singletonFn');
      container.singleton('singleton', singletonFn);
      container.get('singleton');
      expect(singletonFn).toHaveBeenCalledWith(container);
      expect(singletonFn.calls.count()).toEqual(1);
      expect(singletonFn.calls.first().object).toBe(container);
    });

    it('should not call the argument until get(id) is called', function() {
      var singletonFn = jasmine.createSpy();
      container.singleton('singleton', singletonFn);
      expect(singletonFn).not.toHaveBeenCalled();

      container.get('singleton');
      expect(singletonFn).toHaveBeenCalled();
    });

    it('should overwrite a previously defined argument with the same id', function() {
      container.singleton('id', function() {
        return 'foo';
      });
      container.singleton('id', function() {
        return 5;
      });
      expect(container.get('id')).toBe(5);
    });

    it('should return the container', function() {
      expect(container.singleton('id', function() {})).toBe(container);
    });

    describe('when the argument is not a function', function() {

      it('should throw a type error', function() {
        expect(function() {
          container.singleton('string-id', 'foo');
        }).toThrowError(TypeError);
      });

    });

  });

  describe('#extend(id, argument)', function() {

    it('should throw an error if the dependency is not already registered', function() {
      expect(function() {
        container.extend('id', function() {});
      }).toThrowError(BlisterContainer.MissingExtendedDependencyError);
      expect(function() {
        container.extend('id', 'foo');
      }).toThrowError(BlisterContainer.MissingExtendedDependencyError);
    });

    describe('when extending a value', function() {

      it('should throw an error', function() {
        container.value('id', 'foo');
        expect(function() {
          container.extend('id', 'bar');
        }).toThrowError(BlisterContainer.IllegalExtensionError);
        expect(function() {
          container.extend('id', function() {});
        }).toThrowError(BlisterContainer.IllegalExtensionError);
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
        expect(factoryFn).toHaveBeenCalledWith(container, 1);
        expect(factoryFn.calls.count()).toEqual(1);
        expect(factoryFn.calls.all()[0].object).toBe(container);

        container.get('id');
        expect(factoryFn).toHaveBeenCalledWith(container, 2);
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

    describe('when extending a singleton', function() {

      it('should extend so get(id) returns a cached result of the argument', function() {
        container.singleton('id', function() {});
        container.extend('id', createCounter());

        expect(container.get('id')).toBe(1);
        expect(container.get('id')).toBe(1);
      });

      it('should extend so get(id) calls properly the new argument', function() {
        container.singleton('id', createCounter());
        var singletonFn = jasmine.createSpy('singletonFn');
        container.extend('id', singletonFn);

        container.get('id');
        expect(singletonFn).toHaveBeenCalledWith(container, 1);
        expect(singletonFn.calls.first().object).toBe(container);

        container.get('id');
        expect(singletonFn).toHaveBeenCalledWith(container, 1);
        expect(singletonFn.calls.first().object).toBe(container);
      });

      it('should return the container', function() {
        container.singleton('id', function() {});
        var returnValue = container.extend('id', function() {});
        expect(returnValue).toBe(container);
      });

      describe('when the argument is not a function', function() {

        it('should throw a type error', function() {
          container.singleton('singleton', function() {});

          expect(function() {
            container.extend('singleton', 'foo');
          }).toThrowError(TypeError);
        });

      });

    });

  });

  describe('#register(provider)', function() {

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
