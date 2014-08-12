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
