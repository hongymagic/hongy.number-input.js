'use strict';

describe('input[number]', function () {
	var html = [
		'<form name="form">',
			'<input id="price" name="price" type="tel" data-number min="0" max="1000000" ng-model="model.price" required />',
		'</form>'
	].join('');
	var $scope, element, form, $price;

	beforeEach(module('hongy'));
	beforeEach(inject(function ($rootScope, $compile) {
		$scope = $rootScope.$new();
		$scope.model = { price: 930000 };

		element = angular.element(html);
		$compile(element)($scope);
		$scope.$digest();

		form = $scope.form;
		$price = element.find('#price');
	}));

	function setPrice(value) {
		form.price.$setViewValue(value);
		$scope.$digest();
	}

	it('should have model value of 930000', function () {
		expect($scope.model.price).toBe(930000);
		expect(form.price.$modelValue).toBe(930000);
	});

	it('should have view value of 930,000', function () {
		expect($price.val()).toBe('930,000');
		expect(form.price.$viewValue).toBe('930,000');
	});

	it('should change the model value when input value is changed', function () {
		setPrice('93000');
		expect(form.price.$modelValue).toBe(93000);
	});

	it('should change the view value when input value is changed', function () {
		setPrice('93000');
		$price.focus().blur();
		expect(form.price.$viewValue).toBe('93,000');
	});

	it('should set the model value to null when invalid input is entered', function () {
		setPrice('');
		expect(form.price.$modelValue).toBeUndefined();
		setPrice('-=');
		expect(form.price.$modelValue).toBeUndefined();
		setPrice('!@#!%%');
		expect(form.price.$modelValue).toBeUndefined();
		setPrice('David');
		expect(form.price.$modelValue).toBeUndefined();
	});

	describe('validations', function () {
		it('should validate min', function () {
			setPrice('1');
			expect(form.price.$error.min).toBe(false);
			setPrice('-1');
			expect(form.price.$error.min).toBe(true);
		});

		it('should validate max', function () {
			setPrice('2000000');
			expect(form.price.$error.max).toBe(true);
			setPrice('1');
			expect(form.price.$error.max).toBe(false);
		});

		it('should validate required', function () {
			setPrice('');
			expect(form.price.$error.required).toBe(true);
			setPrice('123');
			expect(form.price.$error.required).toBe(false);
		});
	});
});
