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
			return null;
		}

		if (angular.isString(value)) {
			value = value.replace(/[,]/g, '');
		}

		var number = parseFloat(numberFilter(value, precision()).replace(/[,]/g, ''));
		return isFinite(number) ? number : null;
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
			var validators = [
				minValidator(ctrl, function () { return scope.$eval(attrs.min); }),
				maxValidator(ctrl, function () { return scope.$eval(attrs.max); })
			];

			// HTML5 number validator. Must be run before anything else.
			ctrl.$parsers.push(numberValidator(ctrl, toModel));

			// When accessing the model value, always use the numeric value.
			ctrl.$parsers.push(toModel);

			// HTML5 validators
			angular.forEach(validators, function (validator) {
				ctrl.$parsers.push(validator);
			});

			// Watch for attribute changes and re-validate them
			scope.$watch(attrs.max, function (max) {
				maxValidator(ctrl, max, toModel(ctrl.$viewValue));
			});

			scope.$watch(attrs.min, function (min) {
				minValidator(ctrl, min, toModel(ctrl.$viewValue));
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
