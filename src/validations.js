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
