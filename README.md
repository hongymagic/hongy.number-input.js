# Angular Formatted Number Input

Simple angular directive to format numbers in `input` elements. When displaying
the numbers are formatted using standard thousand-separators like: `123,456`.
When editing, numbers are free of any formatting.

Since HTML5 `input[type=number]` does not allow comma characters, we recommend
that you use it with `type=tel` or `type=text`.

## HTML5 Validation support

Supports all standard HTML5 `input[type=number]` validations such as:

* Number (according to [this floating point spec](http://www.w3.org/TR/html-markup/datatypes.html#common.data.float)
* Mininum (use the `min` or `data-min` attribute)
* Maximum (use the `max` or `data-max` attribute)

## Extra attributes

In addition to HTML5 number validation, there is one extra attribute:

* Precision `data-precision=[number]`: set the precision of the floating point
value. _Defaults to 0_.

## Demo

![in flight](https://raw.githubusercontent.com/hongymagic/hongy.number-input.js/master/demo.gif)

## Usage

```javascript
angular.module('myApp', ['hongy']);
```

```html
<input type="tel" data-number>
```

## Contribute

1. Fork
2. Clone
3. Write tests
4. Make sure it conforms to coding style present in the source code
5. Make sure all tests pass and cover all aspects of your code
6. Send a pull request
