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

// Standard HTML5 number regex
var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;


/**
 * @description
 * Helper function to set the validity of NgModelController.
 *
 * @param {NgModelController} ctrl Controller of the bound model.
 * @param {string} name Name of the validation property.
 * @param {boolean} validity Boolean indicating if given value is valid.
 * @param {any} value Value of the model.
 * @returns {any} Returns the valid value otherwise, undefined.
 */
function validate(ctrl, name, validity, value) {
	ctrl.$setValidity(name, validity);
	return validity ? value : undefined;
}

/**
 * @description
 * Function to validate if given value is a number as per W3C HTML5 spec.
 * Internally sets the given NgModelController's validity.
 *
 * @param {NgModelController} ctrl Controller of the bound model.
 * @param {any} value Value of the model.
 * @returns {any} Returns the valid value otherwise, undefined.
 */
function numberValidator(ctrl, value) {
	return validate(ctrl, 'number', NUMBER_REGEXP.test(value), value);
}

/**
 * @description
 * Function to validate if given value is a greater than or equal to the
 * given maximum number. Internally sets the given NgModelController's
 * validity.
 *
 * @param {NgModelController} ctrl Controller of the bound model.
 * @param {number} min Minimum permissible value of the model.
 * @param {any} value Value of the model.
 * @returns {any} Returns the valid value otherwise, undefined.
 */
function minValidator(ctrl, min, value) {
	return validate(ctrl, 'min', value >= min, value);
}

/**
 * @description
 * Function to validate if given value is a less than or equal to the given
 * maximum number. Internally sets the given NgModelController's validity.
 *
 * @param {NgModelController} ctrl Controller of the bound model.
 * @param {number} max Maximum permissible value of the model.
 * @param {any} value Value of the model.
 * @returns {any} Returns the valid value otherwise, undefined.
 */
function maxValidator(ctrl, max, value) {
	return validate(ctrl, 'max', value <= max, value);
}

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
	// Number -> (Number|String) -> String
	var toFormattedNumber = curry(function (precision, number) {
		return numberFilter(number, precision);
	});

	// Converts given string or number to HTML5 compliant number.
	// Number -> (String|Number) -> Number?
	var toHtml5Number = curry(function (precision, value) {
		if (typeof value !== 'string' && typeof value !== 'number') {
			return null;
		}

		var number = parseFloat(numberFilter(value, precision).replace(/[,]/g, ''));
		return isFinite(number) ? number : null;
	});

	return {
		restrict: 'E',
		require: ['?ngModel'],
		scope: {
			min: '&min',
			max: '&max',
			precision: '&precision'
		},
		link: function (scope, element, attrs, ctrls) {
			if (!ctrls || !('number' in attrs)) {
				return;
			}

			// TODO: precision can be dynamic
			var precision = scope.precision() || parseInt(attrs.precision, 10) || 0;
			var ctrl = ctrls[0];

			// When accessing the model value, always use the numeric value.
			ctrl.$parsers.push(toHtml5Number(precision));

			// When displaying the value, always format it to currency format.
			ctrl.$formatters.push(toFormattedNumber(precision));

			// Add HTML5 number validations:
			// 	- number
			// 	- min
			// 	- max
			ctrl.$parsers.push(curry(numberValidator)(ctrl));

			/*
			// Precision defaults to 0
			var precision = scope.precision() || 0;
			var min = scope.min() || parseFloat(attrs.min);
			var max = scope.max() || parseFloat(attrs.max);

			var toFormattedNumber = toFormattedNumberFn(precision);
			var toHtml5Number = toHtml5NumberFn(precision);
			var ctrl;

			ctrl = ctrls[0];

			// Add HTML5 style number validations.
			ctrl.$parsers.push(numberValidator(ctrl));

			// Add HTML5 min/max validations.
			// TODO: make sure it evaluates expression dynamically.
			if (typeof min === 'number' && isFinite(min)) {
				console.log('min', min);
				ctrl.$parsers.push(minValidator(ctrl, min));
			}

			if (typeof max === 'number' && isFinite(max)) {
				console.log('max', max);
				ctrl.$parsers.push(maxValidator(ctrl, max));
			}
			*/

			element
			.on(focusEvents, function () {
				// When focusing on the currency input field, change the format of the number to digits only.
				ctrl.$viewValue = toHtml5Number(precision, ctrl.$modelValue);
				ctrl.$render();

				// On supported browsers, select the entire number so value can be replaced
				// with minimum keyboard interaction.
				return $timeout(function () { element.select(); }, 0);
			})
			.on(blurEvents, function () {
				// When focus is taken away, i.e., blurred, format the number to currency and display it instead.
				ctrl.$viewValue = toFormattedNumber(precision, ctrl.$modelValue);
				ctrl.$modelValue = toHtml5Number(precision, ctrl.$modelValue);
				return ctrl.$render();
			})
			.on(destroyEvents, function () {
				// When element is about to be destroyed (angular) remove event bindings.
				element
				.off(focusEvents)
				.off(blurEvents);
			});
		}
	};
}]);

})(window, document);