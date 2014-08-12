/**
 * @ngdoc directive
 * @name input[number]
 * @restrict E
 *
 * @description
 * Non-standard HTML number input with thousand-separators that support
 * angular data biding. Supports the use of regular HTML5 input[type=number]
 * validation attributes.
 *
 * There are two modes to this input directive:
 *  1. Display formatted numbers; and
 *  2. Edit non-formatted numbers.
 *
 * When input has the focus, number value is converted to standard HTML5
 * compliant integer (without decimals).
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
				Price: <input type="tel" data-number min="0" max="100000">
			</form>
		</div>
		</file>
	</example>
 */
angular
.module('cba.number', [])
.directive('input', ['numberFilter', '$timeout', function (numberFilter, $timeout) {
	// Number -> (Number|String) -> String
	function toFormattedNumber(precision) {
		return function (number) {
			return numberFilter(number, precision);
		};
	}

	// (String|Number) -> Number?
	function toInt(value) {
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
		link: function (scope, element, attrs, ctrls) {
			// Precision is set to 0 to mimic integer conversion.
			// TODO: Support for precision is coming soon.
			var precision = 0;
			var ModelCtrl;
			var toFormattedInt = toFormattedNumber(precision);

			if (!ctrls || !('number' in attrs)) {
				return;
			}

			ModelCtrl = ctrls[0];

			// When accessing the model value, always use the numeric value;
			// When displaying the value, always format it to currency format.
			ModelCtrl.$parsers.push(toInt);
			ModelCtrl.$formatters.push(toFormattedInt);

			// Add HTML5 style number validations
			if (attrs.min) {
				ModelCtrl.$parsers.push(minValidator(ModelCtrl, parseFloat(attrs.min)));
			}

			if (attrs.max) {
				ModelCtrl.$parsers.push(maxValidator(ModelCtrl, parseFloat(attrs.max)));
			}

			// When focusing on the currency input field, change the format of the number to digits only;
			// When focus is taken away, i.e., blurred, format the number to currency and display it instead.
			element
			.on('focus', function () {
				ModelCtrl.$viewValue = toInt(ModelCtrl.$modelValue);
				ModelCtrl.$render();
				// On supported browsers, select the entire number so value can be replaced
				// with minimum keyboard interaction.
				return $timeout(function () { element.select(); }, 0);
			})
			.on('blur', function () {
				ModelCtrl.$viewValue = toFormattedInt(ModelCtrl.$modelValue);
				ModelCtrl.$modelValue = toInt(ModelCtrl.$modelValue);
				return ModelCtrl.$render();
			});
		}
	};
}]);
