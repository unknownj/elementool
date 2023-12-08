# Elementool JavaScript Library

## Overview

Elementool is a versatile JavaScript library designed to simplify the creation, manipulation, and interaction of HTML, SVG, and MathML elements in web applications. This library provides an intuitive API for developers to easily generate and control various types of web elements, offering robust features for dynamic styling, event handling, and element management.

## Features

- **Element Creation**: Quickly create HTML, SVG, and MathML elements with minimal code.
- **Dynamic Content & Styles**: Incorporate dynamic content and styles that update in real-time.
- **Event Handling**: Attach event listeners to elements for interactive web experiences.
- **Utility Functions**: Convert polar coordinates to Cartesian, parse CSS selectors, and more.
- **SVG Helpers**: Create complex SVG shapes and paths with simple function calls.
- **Accessibility Helpers**: Enhance accessibility with descriptive labels for elements.

## Installation

Include the Elementool library in your HTML file:

```html
<script src="path/to/index.js"></script>
```

Or, use a module bundler like Webpack or Rollup to import Elementool:

```javascript
import Elementool from 'path/to/index.js';
```

## Getting Started

Create a new instance of Elementool:

```javascript
var el = new Elementool();
```

## Usage Examples

### Creating a Simple HTML Element

```javascript
var main = document.querySelector("main");
el.make("h1", "Hello World!").appendTo(main);
```

### Adding Dynamic Content and Styles

```javascript
el.make(
  "h2",
  function() {
    return "Dynamic: " + new Date().toISOString().split("T").join(" ").split("Z").join("");
  },
  {
    color: function() { return `rgb(${new Date().getSeconds() * 4}, ${new Date().getMinutes() * 4}, ${new Date().getHours() * 4})`; },
    fontSize: function() { return `${20 + (new Date().getSeconds() / 3)}px`; }
  }
).appendTo(main);
```

### Creating SVG Elements

```javascript
var svgCircle = el.svgHelpers.circle(50, 50, 40, { fill: 'red' }).appendTo(document.body);
```

## Documentation

Refer to the detailed documentation for a complete list of functions, parameters, and usage examples.

- **Element Creation**
  - `make(selector, content, styles, eventListeners)`
  - `draw(selector, content, styles, eventListeners)`
  - `math(selector, content, styles, eventListeners)`
- **SVG Helpers**
  - `svgHelpers.circle(cx, cy, r, styles)`
  - `svgHelpers.ellipse(cx, cy, rx, ry, styles)`
  - `...` (and more)
- **Accessibility Helpers**
  - `accessibilityHelpers.description(element, description)`
  - `accessibilityHelpers.button(element, customDescription)`
  - `...` (and more)

## Contributing

Contributions to Elementool are welcome!

## License

Elementool is [BSD 3-Clause Licensed](LICENSE.md).
