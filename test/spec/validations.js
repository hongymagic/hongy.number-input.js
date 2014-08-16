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

	describe('validate', function () {
		it('should be a function', function () {
			expect(typeof validate).toBe('function');
		});

		it('should call $setValidity on the ngModelController when called', function () {
			var result = validate(ctrl, 'test', true, true);
			expect(ctrl.$setValidity).toHaveBeenCalledWith('test', true);
			expect(result).toBe(true);
		});

		it('should return undefined when validity is set to false', function () {
			var result = validate(ctrl, 'test', false, true);
			expect(ctrl.$setValidity).toHaveBeenCalledWith('test', false);
			expect(result).toBe(undefined);
		});
	});

	describe('numberValidator', function () {
		beforeEach(function () {
			spyOn(window, 'validate');
		});

		it('should be a function', function () {
			expect(typeof numberValidator).toBe('function');
		});

		it('should call the converter when given', function () {
			spyOn(helpers, 'converter');
			numberValidator(ctrl, helpers.converter, '');
			expect(helpers.converter).toHaveBeenCalled();
		});

		it('should check if empty before validating', function () {
			numberValidator(ctrl, null, 0);
			expect(ctrl.$isEmpty).toHaveBeenCalledWith(0);
		});

		it('should call validate when called', function () {
			numberValidator(ctrl, null, 0);
			expect(window.validate).toHaveBeenCalledWith(ctrl, 'number', true, 0);
		});

		it('should call validate with validity set to true when valid number is passed', function () {
			var numbers = [-123123.9999, -123123, -0, +0, 123123, 123123.9999];
			numbers.forEach(function (number) {
				numberValidator(ctrl, null, number);
				expect(window.validate).toHaveBeenCalledWith(ctrl, 'number', true, number);
			});
		});

		it('should call validate with validity set to false when invalid number is passed', function () {
			var numbers = [-Infinity, 'I am the best!', null, , {}, [], true, false, Infinity];
			numbers.forEach(function (number) {
				numberValidator(ctrl, null, number);
				expect(window.validate).toHaveBeenCalledWith(ctrl, 'number', false, number);
			});
		});
	});

	describe('minValidator', function () {
		beforeEach(function () {
			spyOn(window, 'validate');
		});

		it('should be a function', function () {
			expect(typeof minValidator).toBe('function');
		});

		it('should check angular.isNumber before setting validation attributes', function () {
			spyOn(angular, 'isNumber');
			minValidator(ctrl, helpers.min, 100);
			expect(angular.isNumber).toHaveBeenCalledWith(helpers.min());
		});

		it('should return ctrl.$viewValue if given min function does not return a valid number', function () {
			var result = minValidator(ctrl, helpers.invalidMin, 100);
			expect(result).toBe(ctrl.$viewValue);
		});

		it('should call validate when given min function returns a valid numner', function () {
			minValidator(ctrl, helpers.min, 100);
			expect(window.validate).toHaveBeenCalled();
		});

		it('should call validate with validity set to true if given value is bigger than the min', function () {
			var numbers = [42, 50, 1000];
			numbers.forEach(function (number) {
				minValidator(ctrl, helpers.min, number);
				expect(window.validate).toHaveBeenCalledWith(ctrl, 'min', true, number);
			});
		});

		it('should call validate with validity set to false if given value is bigger than the min', function () {
			var numbers = [-42, -50, 0, 1, 41];
			numbers.forEach(function (number) {
				minValidator(ctrl, helpers.min, number);
				expect(window.validate).toHaveBeenCalledWith(ctrl, 'min', false, number);
			});
		});
	});

	describe('maxValidator', function () {
		beforeEach(function () {
			spyOn(window, 'validate');
		});

		it('should be a function', function () {
			expect(typeof maxValidator).toBe('function');
		});

		it('should check angular.isNumber before setting validation attributes', function () {
			spyOn(angular, 'isNumber');
			maxValidator(ctrl, helpers.max, 100);
			expect(angular.isNumber).toHaveBeenCalledWith(helpers.max());
		});

		it('should return ctrl.$viewValue if given min function does not return a valid number', function () {
			var result = maxValidator(ctrl, helpers.invalidMax, 100);
			expect(result).toBe(ctrl.$viewValue);
		});

		it('should call validate when given min function returns a valid numner', function () {
			maxValidator(ctrl, helpers.max, 100);
			expect(window.validate).toHaveBeenCalled();
		});

		it('should call validate with validity set to true if given value is less than the max', function () {
			var numbers = [42, 50, 1000, 4242];
			numbers.forEach(function (number) {
				maxValidator(ctrl, helpers.max, number);
				expect(window.validate).toHaveBeenCalledWith(ctrl, 'max', true, number);
			});
		});

		it('should call validate with validity set to false if given value is bigger than the max', function () {
			var numbers = [4243, 5000, 123123123.123];
			numbers.forEach(function (number) {
				maxValidator(ctrl, helpers.max, number);
				expect(window.validate).toHaveBeenCalledWith(ctrl, 'max', false, number);
			});
		});
	});
});
