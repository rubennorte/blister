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
    expect(BlisterContainer.prototype.set).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.register).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.extend).toEqual(jasmine.any(Function));
    expect(BlisterContainer.prototype.VALUE).toEqual(jasmine.any(String));
    expect(BlisterContainer.prototype.SINGLETON).toEqual(jasmine.any(String));
    expect(BlisterContainer.prototype.FACTORY).toEqual(jasmine.any(String));
  });

  var container;
  beforeEach(function() {
    container = new BlisterContainer();
  });

  describe('set(id, value, type)', function() {

    it('should return the container', function() {
      var returnValue = container.set('id', 'value', container.VALUE);
      expect(returnValue).toBe(container);
    });

    describe('when the id is not a string', function() {

      it('should throw an error', function() {
        expect(function() {
          container.set(5, 'foo', container.VALUE);
        }).toThrowError(TypeError);
      });

    });

    describe('when the type is VALUE', function() {

      it('should return the given value', function() {
        container.set('string-id', 'foo', container.VALUE);
        expect(container.get('string-id')).toBe('foo');

        var func = function() {};
        container.set('function-id', func, container.VALUE);
        expect(container.get('function-id')).toBe(func);
      });

    });

    describe('when the type is FACTORY', function() {

      it('should throw an error if the value is not a function', function() {
        expect(function() {
          container.set('string-id', 'foo', container.FACTORY);
        }).toThrowError(TypeError);
      });

      it('should call the function with the container as parameter and context', function() {
        var singletonSpy = jasmine.createSpy('singletonSpy');
        container.set('singleton', singletonSpy, container.SINGLETON);
        container.get('singleton');
        expect(singletonSpy).toHaveBeenCalledWith(container, undefined);
        expect(singletonSpy.calls.first().object).toBe(container);
      });

      it('should return the result of the given function value for each call', function() {
        container.set('factory', createCounter(), container.FACTORY);

        var first = container.get('factory');
        var second = container.get('factory');
        expect(first).toBe(1);
        expect(second).toBe(2);
      });

    });

    describe('when the type is SINGLETON', function() {

      it('should throw an error if the value is not a function', function() {
        expect(function() {
          container.set('string-id', 'foo', container.SINGLETON);
        }).toThrowError(TypeError);
      });

      it('should call the function with the container as parameter and context', function() {
        var singletonSpy = jasmine.createSpy('singletonSpy');
        container.set('singleton', singletonSpy, container.SINGLETON);
        container.get('singleton');
        expect(singletonSpy).toHaveBeenCalledWith(container, undefined);
        expect(singletonSpy.calls.first().object).toBe(container);
      });

      it('should return the same cached result of the given function value', function() {
        container.set('singleton', createCounter(), container.SINGLETON);

        var first = container.get('singleton');
        var second = container.get('singleton');
        expect(first).toBe(1);
        expect(second).toBe(1);
      });

      it('should call the given function value only when the id is requested', function() {
        var func = jasmine.createSpy();
        container.set('singleton', func, container.SINGLETON);
        expect(func).not.toHaveBeenCalled();

        container.get('singleton');
        expect(func).toHaveBeenCalled();
      });

    });

    describe('when no type is passed', function() {

      describe('when the value is a function', function() {

        it('should save it as a SINGLETON', function() {
          container.set('singleton', createCounter());

          var first = container.get('singleton');
          var second = container.get('singleton');
          expect(first).toBe(1);
          expect(second).toBe(1);
        });

      });

      describe('otherwise', function() {

        it('should save it as a VALUE', function() {
          container.set('string-id', 'foo');
          expect(container.get('string-id')).toBe('foo');
        });

      });

    });

    describe('when called multiple times with the same id', function() {

      it('should overwrite previously set values', function() {
        var stored;

        container.set('id', 'foo', container.VALUE);

        container.set('id', 5, container.VALUE);
        stored = container.get('id');
        expect(stored).toBe(5);

        var func = function() {};
        container.set('id', func, container.VALUE);
        stored = container.get('id');
        expect(stored).toBe(func);

        container.set('id', createCounter(), container.FACTORY);
        stored = container.get('id');
        expect(stored).toBe(1);
      });

    });

  });

  describe('extend(id, value, type)', function() {

    it('should throw an error if the dependency is not already registered', function() {
      expect(function() {
        container.extend('id', 'value', container.VALUE);
      }).toThrow();
    });

    it('should return the container', function() {
      container.set('id', 'value', container.VALUE);
      var returnValue = container.extend('id', 'value', container.VALUE);
      expect(returnValue).toBe(container);
    });

    describe('when the type is VALUE', function() {

      it('should return the given value', function() {
        container.set('string-id', 'foo', container.VALUE);
        expect(container.get('string-id')).toBe('foo');

        var func = function() {};
        container.set('function-id', func, container.VALUE);
        expect(container.get('function-id')).toBe(func);
      });

    });

    describe('when the type is FACTORY', function() {

      it('should throw an error if the value is not a function', function() {
        container.set('id', 'foo');
        expect(function() {
          container.extend('id', 'bar', container.FACTORY);
        }).toThrowError(TypeError);
      });

      it(
        'should call the function with the original value and the container (also as context)',
        function() {
          container.set('id', 'value');
          var extensionDefinition = jasmine.createSpy('extensionDefinition');
          container.extend('id', extensionDefinition, container.FACTORY);

          container.get('id');

          expect(extensionDefinition).toHaveBeenCalledWith(container, 'value');
          expect(extensionDefinition.calls.first().object).toBe(container);
        });

      it('should return the result of the given function value for each call', function() {
        container.set('id', 'value');
        container.extend('id', createCounter(), container.FACTORY);

        var first = container.get('id');
        var second = container.get('id');
        expect(first).toBe(1);
        expect(second).toBe(2);
      });

      describe('when the original value was a singleton', function() {

        it('should return the original value cached', function() {
          container.set('id', createCounter());

          var newCounter = createCounter();
          container.extend('id', function(container, original) {
            return [original, newCounter()];
          }, container.FACTORY);

          var first = container.get('id');
          var second = container.get('id');

          expect(first).toEqual([1, 1]);
          expect(second).toEqual([1, 2]);
        });

      });

      describe('when the original value was a factory', function() {

        it('should return the original value cached', function() {
          container.set('id', createCounter(), container.FACTORY);

          var newCounter = createCounter();
          container.extend('id', function(container, original) {
            return [original, newCounter()];
          }, container.FACTORY);

          var first = container.get('id');
          var second = container.get('id');

          expect(first).toEqual([1, 1]);
          expect(second).toEqual([2, 2]);
        });

      });

    });

    describe('when the type is SINGLETON', function() {

      it('should throw an error if the value is not a function', function() {
        container.set('id', 'foo');
        expect(function() {
          container.extend('id', 'bar', container.FACTORY);
        }).toThrowError(TypeError);
      });

      it(
        'should call the function with the original value and the container (also as context)',
        function() {
          container.set('id', 'value');
          var extensionDefinition = jasmine.createSpy('extensionDefinition');
          container.extend('id', extensionDefinition, container.SINGLETON);

          container.get('id');

          expect(extensionDefinition).toHaveBeenCalledWith(container, 'value');
          expect(extensionDefinition.calls.first().object).toBe(container);
        });

      it('should return the same cached result of the given function value', function() {
        container.set('singleton', createCounter(), container.SINGLETON);
        container.extend('singleton', createCounter(), container.SINGLETON);

        var first = container.get('singleton');
        var second = container.get('singleton');
        expect(first).toBe(1);
        expect(second).toBe(1);
      });

    });

    describe('when no type is passed', function() {

      describe('when the value is a function', function() {

        it('should save it with the same type of the original value', function() {
          container.set('singleton', createCounter(), container.SINGLETON);
          container.extend('singleton', createCounter());

          var first = container.get('singleton');
          var second = container.get('singleton');
          expect(first).toBe(1);
          expect(second).toBe(1);

          container.set('factory', createCounter(), container.FACTORY);
          container.extend('factory', createCounter());

          first = container.get('factory');
          second = container.get('factory');
          expect(first).toBe(1);
          expect(second).toBe(2);
        });

      });

      describe('otherwise', function() {

        it('should save it as a VALUE', function() {
          container.set('string-id', 'foo');
          container.extend('string-id', 'foo');
          expect(container.get('string-id')).toBe('foo');
        });

      });

    });

  });

  describe('register(provider)', function() {

    it('should call the method register on the given provider passing itself', function() {
      var provider = jasmine.createSpyObj('provider', ['register']);
      container.register(provider);
      expect(provider.register).toHaveBeenCalledWith(container);
    });

    it('should return the container itself', function() {
      var provider = jasmine.createSpyObj('provider', ['register']);
      var returnValue = container.register(provider);
      expect(returnValue).toBe(container);
    });

    it('should throw an error if the given parameter does not have a register method',
      function() {
        expect(function() {
          container.register(5);
        }).toThrowError(TypeError);

        expect(function() {
          container.register({});
        }).toThrowError(TypeError);
      });

  });

});
