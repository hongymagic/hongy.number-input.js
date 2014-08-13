 /* global curry: true */

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
var validate = curry(function (ctrl, name, validity, value) {
	ctrl.$setValidity(name, validity);
	return validity ? value : undefined;
});

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
	return validate(ctrl, 'number', ctrl.$isEmpty(value) || NUMBER_REGEXP.test(value), value);
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
	var minValue = min();
	return !angular.isNumber(minValue) ? ctrl.$viewValue : validate(ctrl, 'min', ctrl.$isEmpty(value) || value >= minValue, value);
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
	var maxValue = max();
	return !angular.isNumber(maxValue) ? ctrl.$viewValue : validate(ctrl, 'max', ctrl.$isEmpty(value) || value <= maxValue, value);
});
