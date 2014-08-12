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
	function toFormattedNumberFn(precision) {
		return function (number) {
			console.log(number, precision);
			return numberFilter(number, precision);
		};
	}

	// Converts given string or number to HTML5 compliant number.
	// (String|Number) -> Number?
	function toHtml5Number(value) {
		var number;

		if (typeof value !== 'string' && typeof value !== 'number') {
			return null;
		}

		// Drop the decimal points and commas
		if (typeof value === 'number') {
			number = Math.round(value);
		} else {
			number = Math.round(parseFloat((value || '').replace(',', '')));
		}

		return isFinite(number) ? number : null;
	}

	// Helper function to set validity of ngModel.
	// Returns value, regardless of its validity.
	function validate(ctrl, name, validity, value) {
		ctrl.$setValidity(name, validity);
		return value;
	}

	// NgModelCtrl -> Number -> (Number -> Number)
	function minValidator(ctrl, min) {
		return function (value) {
			return validate(ctrl, 'min', value >= min, value);
		};
	}

	// NgModelCtrl -> Number -> (Number -> Number)
	function maxValidator(ctrl, max) {
		return function (value) {
			return validate(ctrl, 'max', value <= max, value);
		};
	}

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

			// Precision defaults to 0
			var precision = scope.precision() || 0;
			var toFormattedNumber = toFormattedNumberFn(precision);
			var toInt = toHtml5Number;
			var ctrl;

			ctrl = ctrls[0];

			// When accessing the model value, always use the numeric value.
			// When displaying the value, always format it to currency format.
			ctrl.$parsers.push(toHtml5Number);
			ctrl.$formatters.push(toFormattedNumber);

			// Add HTML5 style number validations.
			if (attrs.min) {
				ctrl.$parsers.push(minValidator(ctrl, parseFloat(attrs.min)));
			}

			if (attrs.max) {
				ctrl.$parsers.push(maxValidator(ctrl, parseFloat(attrs.max)));
			}

			// When focusing on the currency input field, change the format of the number to digits only.
			// When focus is taken away, i.e., blurred, format the number to currency and display it instead.
			// When element is about to be destroyed (angular) remove event bindings.
			element
			.on(focusEvents, function () {
				ctrl.$viewValue = toInt(ctrl.$modelValue);
				ctrl.$render();
				// On supported browsers, select the entire number so value can be replaced
				// with minimum keyboard interaction.
				return $timeout(function () { element.select(); }, 0);
			})
			.on(blurEvents, function () {
				ctrl.$viewValue = toFormattedNumber(ctrl.$modelValue);
				ctrl.$modelValue = toInt(ctrl.$modelValue);
				return ctrl.$render();
			})
			.on(destroyEvents, function () {
				element
				.off(focusEvents)
				.off(blurEvents);
			});
		}
	};
}]);
