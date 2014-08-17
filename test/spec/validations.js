'use strict';

describe('validations.js', function () {
	var helpers = {
		min: function () { return 42; },
		invalidMin: function () { return 'David'; },
		max: function () { return 4242; },
		invalidMax: function () { return []; },
		converter: function () {
			return 333;
		}
	};
	var ctrl = {
		$isEmpty: angular.noop,
		$setValidity: angular.noop,
		$viewValue: 28
	};

	beforeEach(function () {
		spyOn(ctrl, '$isEmpty');
		spyOn(ctrl, '$setValidity');
	});

	describe('numberValidator', function () {
		it('should be a function', function () {
			expect(typeof numberValidator).toBe('function');
		});

		it('should check if empty before validating', function () {
			numberValidator(ctrl, 0);
			expect(ctrl.$isEmpty).toHaveBeenCalledWith(0);
		});

		it('should return true when valid number is passed', function () {
			var numbers = [-123123.9999, -123123, -0, +0, 123123, 123123.9999];
			numbers.forEach(function (number) {
				expect(numberValidator(ctrl, number)).toBe(true);
			});
		});

		it('should return false when invalid number is passed', function () {
			var numbers = [-Infinity, 'I am the best!', null, , {}, [], true, false, Infinity];
			numbers.forEach(function (number) {
				expect(numberValidator(ctrl, number)).toBe(false);
			});
		});
	});

	describe('minValidator', function () {
		it('should be a function', function () {
			expect(typeof minValidator).toBe('function');
		});

		it('should work with min function', function () {
			expect(minValidator(ctrl, helpers.min, 100)).toBe(true);
		});

		it('should work with min value', function () {
			expect(minValidator(ctrl, 5, 6)).toBe(true);
		});

		it('should return true if given value is bigger than the min', function () {
			var numbers = [42, 50, 1000];
			numbers.forEach(function (number) {
				expect(minValidator(ctrl, helpers.min, number)).toBe(true)
				expect(minValidator(ctrl, helpers.min(), number)).toBe(true)
			});
		});

		it('should return false if given value is bigger than the min', function () {
			var numbers = [-42, -50, 0, 1, 41];
			numbers.forEach(function (number) {
				expect(minValidator(ctrl, helpers.min, number)).toBe(false);
				expect(minValidator(ctrl, helpers.min(), number)).toBe(false);
			});
		});
	});

	describe('maxValidator', function () {
		it('should be a function', function () {
			expect(typeof maxValidator).toBe('function');
		});

		it('should work with max function', function () {
			expect(maxValidator(ctrl, helpers.min, 0)).toBe(true);
		});

		it('should work with max value', function () {
			expect(maxValidator(ctrl, 5, 4)).toBe(true);
		});

		it('should return true if given value is less than the max', function () {
			var numbers = [42, 50, 1000, 4241, 4242];
			numbers.forEach(function (number) {
				expect(maxValidator(ctrl, helpers.max, number)).toBe(true)
				expect(maxValidator(ctrl, helpers.max(), number)).toBe(true)
			});
		});

		it('should return false if given value is bigger than the max', function () {
			var numbers = [4243, 50000, Infinity];
			numbers.forEach(function (number) {
				expect(maxValidator(ctrl, helpers.max, number)).toBe(false);
				expect(maxValidator(ctrl, helpers.max(), number)).toBe(false);
			});
		});

	});
});
