'use strict';

describe('curry.js', function () {
	var noop = function () { return true; };
	var identity = function (x) { return x; };
	var add = function (x, y) { return x + y; };
	var podium = function (x, y, z) { return [x, y, z]; };

	var fnoop, fidentity, fadd, fpodium;
	var noopf, identityf, addf, podiumf;

	beforeEach(function () {
		fnoop = curry(noop);
		fidentity = curry(identity);
		fadd = curry(add);
		fpodium = curry(podium);

		noopf = curryRight(noop);
		identityf = curryRight(identity);
		addf = curryRight(add);
		podiumf = curryRight(podium);
	});

	afterEach(function () {
		fnoop = null;
		fidentity = null;
		fadd = null;
		fpodium = null;

		noopf = null;
		identityf = null
		addf = null;
		podiumf = null
	});

	describe('curry', function () {
		it('should be a function', function () {
			expect(typeof fnoop).toBe('function');
		});

		it('should return a new function when curried', function () {
			expect(typeof fnoop).toBe('function');
			expect(typeof fidentity).toBe('function');
			expect(typeof fadd).toBe('function');
			expect(typeof fpodium).toBe('function');
		})

		it('should return result of a void function when run after currying', function () {
			expect(fnoop()).toBe(true);
		});

		it('should return a function when unary function is never fed an argument', function () {
			expect(typeof fidentity()()()()).toBe('function');
		});

		it('should return the result of unary function when it is fed an argument', function () {
			expect(typeof fidentity()()()(1)).toBe(typeof 1);
			expect(fidentity()()()(1)).toBe(1);
		});

		it('should return a new unary function when binary function is called with single argument', function () {
			var fincrement = fadd(1);
			expect(typeof fincrement).toBe('function');
			expect(fincrement(1)).toBe(2);
		});

		it('should also work with partial applications', function () {
			expect(fadd(1)(2)).toBe(3);
			expect(fadd(1, 2)).toBe(3);
		});

		it('should respect order of arguments', function () {
			expect(fpodium(1)(2, 3)).toEqual([1, 2, 3]);
		});
	});

	describe('curryRight', function () {
		it('should be a function', function () {
			expect(typeof curryRight).toBe('function');
		});

		it('should return result of a void function when run after currying', function () {
			expect(noopf()).toBe(true);
		});

		it('should return a function when unary function is never fed an argument', function () {
			expect(typeof identityf()()()()).toBe('function');
		});

		it('should return the result of unary function when it is fed an argument', function () {
			expect(typeof identityf()()()(1)).toBe(typeof 1);
			expect(identityf()()()(1)).toBe(1);
		});

		it('should return a new unary function when binary function is called with single argument', function () {
			var incrementf = fadd(1);
			expect(typeof incrementf).toBe('function');
			expect(incrementf(1)).toBe(2);
		});

		it('should also work with partial applications', function () {
			expect(addf(1)(2)).toBe(3);
			expect(addf(1, 2)).toBe(3);
		});

		it('should respect order of arguments', function () {
			expect(podiumf(1)(2, 3)).toEqual([3, 2, 1]);
		});

	});
});
