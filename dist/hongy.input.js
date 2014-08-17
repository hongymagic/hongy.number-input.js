(function (window, document, undefined) {
	'use strict';

	var angular = window.angular;
function apply(handler, args) {
	return handler.apply(null, args);
}

function toArray(collection) {
	return [].slice.call(collection);
}

function reverse(collection) {
	return toArray(collection).reverse();
}

function identity(arg) {
	return arg;
}

function currier(rightward) {
	return function (handler, arity) {
		if (handler.curried) {
			return handler;
		}

		arity = arity || handler.length;

		var curry = function curry() {
			var args = toArray(arguments);

			if (args.length >= arity) {
				var transform = rightward ? reverse : identity;
				return apply(handler, transform(args));
			}

			var inner = function () {
				return apply(curry, args.concat(toArray(arguments)));
			};

			inner.curried = true;
			return inner;
		};

		curry.curried = true;
		return curry;
	};
}

var curry = currier(false);
var curryRight = currier(true);

 /* global curry: true */

// Standard HTML5 number regex
var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;

/**
 * @description
 * Function to validate if given value is a number as per W3C HTML5 spec.
 * Internally sets the given NgModelController's validity.
 *
 * @param {NgModelController} ctrl Controller of the bound model.
 * @param {any} value Value of the model.
 * @returns {any} Returns the valid value otherwise, undefined.
 */
var numberValidator = curry(function (ctrl, value) {
	return ctrl.$isEmpty(value) || NUMBER_REGEXP.test(value);
});

/**
 * @description
 * Function to validate if given value is a greater than or equal to the
 * given maximum number. Internally sets the given NgModelController's
 * validity.
 *
 * @param {NgModelController} ctrl Controller of the bound model.
 * @param {number} min Function which returns minimum permissible value of the model.
 * @param {any} value Value of the model.
 * @returns {any} Returns the valid value otherwise, undefined.
 */
var minValidator = curry(function (ctrl, min, value) {
	min = angular.isFunction(min) ? min() : min;
	return ctrl.$isEmpty(value) || value >= min;
});

/**
 * @description
 * Function to validate if given value is a less than or equal to the given
 * maximum number. Internally sets the given NgModelController's validity.
 *
 * @param {NgModelController} ctrl Controller of the bound model.
 * @param {function} max Function which returns maximum permissible value.
 * @param {any} value Value of the model.
 * @returns {any} Returns the valid value otherwise, undefined.
 */
var maxValidator = curry(function (ctrl, max, value) {
	max = angular.isFunction(max) ? max() : max;
	return ctrl.$isEmpty(value) || value <= max;
});

 /* global curry: true */
 /* global numberValidator: true */
 /* global minValidator: true */
 /* global maxValidator: true */

/**
 * @ngdoc directive
 * @name input[number]
 * @restrict E
 *
 * @description
 * Non-standard HTML number input with thousand-separators that support
 * angular data biding. Supports the use of regular HTML5 input[type=number]
 * validation attributes. Also introduces `precision` attribute for formatting
 * decimal numbers.
 *
 * There are two modes to this input directive:
 *  1. Display formatted numbers; and
 *  2. Edit non-formatted numbers.
 *
 * When input has the focus, number value is converted to standard HTML5
 * compliant number.
 *
 * When input loses the focus, number value is converted to non-standard
 * number with thousand-separators.
 *
 * The `ng-model` is always a number or null.
 *
 * Since input[type=number] does not support comma characters, this works the
 * best when input[type] is set to `tel` or `text`.
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {number} ngMin Assignable angular expression to set the required minimum value.
 * @param {number} ngMax Assignable angular expression to set the required maximum value.
 * @param {number} ngPrecision Assignable angular expression to set the required precision in decimal value.
 *
 * @example
	<example name="input-directive" module="inputExample">
		<file name="index.html">
		<script>
			angular
			.module('inputExample', [])
			.controller('ExampleCtrl', ['$scope', function ($scope) {
				$scope.input = { price: 930000 };
			}]);
		</script>
		<div ng-controller="ExampleCtrl">
			<form name="myForm">
				Price: <input type="tel" data-number min="0" max="100000" precision="2">
			</form>
		</div>
		</file>
	</example>
 */
angular
.module('hongy', [])
.directive('input', ['numberFilter', '$timeout', function (numberFilter, $timeout) {
	var namespace = '.hongy.number';
	var focusEvents = ['focus' + namespace].join(' ');
	var blurEvents = ['blur' + namespace].join(' ');
	var destroyEvents = '$destroy';

	// Returns a function which formats the number with thousand-separators.
	// If given input is not a number, return it as-is.
	// Number -> (Number|String) -> String
	var toFormattedNumber = curry(function (ctrl, precision, number) {
		return numberFilter(number || ctrl.$viewValue, precision()) || ctrl.$viewValue;
	});

	// Converts given string or number to HTML5 compliant number.
	// Number -> (String|Number) -> Number?
	var toHtml5Number = curry(function (precision, value) {
		if (!angular.isString(value) && !angular.isNumber(value)) {
			return undefined;
		}

		if (angular.isString(value)) {
			value = value.replace(/[,]/g, '');
		}

		var number = parseFloat(numberFilter(value, precision()).replace(/[,]/g, ''));
		return isFinite(number) ? number : undefined;
	});

	// Set $viewValue and $modelValue for a given NgModelContrller.
	// NgModelController -> (Any -> Any) -> (Any -> Any) -> Event -> Any
	var setModels = curry(function (ctrl, viewModelConverter, modelConverter, event) {
		if (angular.isFunction(viewModelConverter)) {
			ctrl.$viewValue = viewModelConverter(ctrl.$modelValue);
		}

		if (angular.isFunction(modelConverter)) {
			ctrl.$modelValue = modelConverter(ctrl.$modelValue);
		}

		return ctrl.$render();
	});

	return {
		restrict: 'E',
		require: ['?ngModel'],
		link: function (scope, element, attrs, ctrls) {
			// TODO: throw error if input[type=number]
			if (!ctrls || !('number' in attrs)) {
				return;
			}

			// NgModelController
			var ctrl = ctrls[0];

			// Use to convert numbers for different views
			var precision = function () { return scope.$eval(attrs.precision) || 0; };
			var toDisplay = toFormattedNumber(ctrl, precision);
			var toModel   = toHtml5Number(precision);

			// HTML5 validators.
			ctrl.$validators.number = numberValidator(ctrl);
			ctrl.$validators.min = minValidator(ctrl, function () { return scope.$eval(attrs.min); });
			ctrl.$validators.max = maxValidator(ctrl, function () { return scope.$eval(attrs.max); });

			// When accessing the model value, always use the numeric value.
			ctrl.$parsers.push(toModel);

			// Watch for attribute changes and re-validate them
			scope.$watch(attrs.max, function (max) {
				ctrl.$validate();
			});

			scope.$watch(attrs.min, function (min) {
				ctrl.$validate();
			});

			// When displaying the value, always format it to currency format.
			ctrl.$formatters.push(toDisplay);

			// When input is focused, remove the number formatting and emulate
			// number input.
			element
			.off(focusEvents)
			.on(focusEvents, setModels(ctrl, toModel, undefined))
			.on(focusEvents, function () {
				return $timeout(function () { element.select(); }, 10);
			})
			// When input is blurred, show formatted number instead.
			.off(blurEvents)
			.on(blurEvents, setModels(ctrl, toDisplay, toModel))
			// When element is about to be destroyed (angular) remove event
			// bindings.
			.off(destroyEvents)
			.on(destroyEvents, function () {
				element
				.off(focusEvents)
				.off(blurEvents);
			});
		}
	};
}]);

})(window, document);