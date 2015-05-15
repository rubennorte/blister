'use strict';

var Blister = require('../../../src/blister');

describe('Blister', function() {

  it('should be a class with the proper API', function() {
    expect(Blister).toEqual(jasmine.any(Function));
    expect(Blister.prototype.get).toEqual(jasmine.any(Function));
    expect(Blister.prototype.set).toEqual(jasmine.any(Function));
    expect(Blister.prototype.register).toEqual(jasmine.any(Function));
    expect(Blister.prototype.VALUE).toEqual(jasmine.any(String));
    expect(Blister.prototype.SINGLETON).toEqual(jasmine.any(String));
    expect(Blister.prototype.FACTORY).toEqual(jasmine.any(String));
  });

  var container;
  beforeEach(function() {
    container = new Blister();
  });

  describe('set(id, value, type)', function() {

    var incrementCounter;
    beforeEach(function() {
      var count = 0;
      incrementCounter = function() {
        count++;
        return count;
      };
    });

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

        container.set('number-id', 4, container.VALUE);
        expect(container.get('number-id')).toBe(4);

        container.set('boolean-id', false, container.VALUE);
        expect(container.get('boolean-id')).toBe(false);

        container.set('null-id', null, container.VALUE);
        expect(container.get('null-id')).toBe(null);

        container.set('undefined-id', undefined, container.VALUE);
        expect(container.get('undefined-id')).toBe(undefined);

        var obj = {};
        container.set('object-id', obj, container.VALUE);
        expect(container.get('object-id')).toBe(obj);

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
        expect(singletonSpy).toHaveBeenCalledWith(container);
        expect(singletonSpy.calls.first().object).toBe(container);
      });

      it('should return the result of the given function value for each call', function() {
        container.set('factory', incrementCounter, container.FACTORY);

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
        expect(singletonSpy).toHaveBeenCalledWith(container);
        expect(singletonSpy.calls.first().object).toBe(container);
      });

      it('should return the same cached result of the given function value', function() {
        container.set('singleton', incrementCounter, container.SINGLETON);

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
          container.set('singleton', incrementCounter);

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

        container.set('id', incrementCounter, container.FACTORY);
        stored = container.get('id');
        expect(stored).toBe(1);
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
