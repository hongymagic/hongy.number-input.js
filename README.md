# Angular Formatted Number Input

Simple angular directive to format numbers in `input` elements. When displaying
the numbers are formatted using standard thousand-separators like: `123,456`.
When editing, numbers are free of any formatting.

Since HTML5 `input[type=number]` does not allow comma characters, we recommend
that you use it with `type=tel` or `type=text`.

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
