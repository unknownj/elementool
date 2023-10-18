function Elementool() {

  var self = this;

  /**
   * Creates a new element based on the given selector, content, styles, and event listeners,
   * and can append it to the specified parent or sibling element.
   *
   * @param {string} selector -
   *   The CSS selector for the element to be created and the parent or sibling element it should be appended to.
   *   Examples: '#myDiv', '.myClass', 'div', 'input[type="text"]'
   * @param {string|Element|Element[]|undefined} optionalDescendants -
   *   The content to be set as the textContent, an Element, or an array of Elements.
   *   Examples: 'Hello, world!', document.createElement('div'), [element1, element2]
   * @param {Object} optionalStyleObject -
   *   An object containing style assignments for the created element.
   *   Example: { color: 'red', fontSize: '14px' }
   * @param {Object} optionalEventListeners -
   *   Optional object with event listeners assigned to the created element.
   *   Example: { click: handleClick, mouseover: handleMouseOver }
   * @returns {Element} - The created Element.
   *
   * @example
   *
   * // Create a new div with text content and append it to the body
   * Elementool.make('div', 'Hello, world!').appendTo(document.body);
   *
   */
  this.make = function (selector, optionalDescendants, optionalStyleObject, optionalEventListeners) {
    return this.util.make(selector, optionalDescendants, optionalStyleObject, undefined, optionalEventListeners);
  };

  /**
 * Creates a new SVG element based on the given selector, content, styles, and event listeners,
 * and appends it to the specified parent or sibling element.
 *
 * @param {string} selector -
 *   The CSS selector for the SVG element to be created and optionally the parent or sibling element it should be appended to.
 *   Examples: '#mySvg', '.myClass', 'svg'
 * @param {string|Element|Element[]|undefined} content -
 *   The content to be set as the textContent, an Element, or an array of Elements.
 *   Examples: 'Hello, world!', document.createElement('circle'), [element1, element2]
 * @param {Object} styles -
 *   An object containing style assignments for the created SVG element.
 *   Example: { fill: 'red', stroke: 'black' }
 * @param {Object} optionalEventListeners -
 *   Optional object with event listeners assigned to the created SVG element.
 *   Example: { click: handleClick, mouseover: handleMouseOver }
 * @returns {Element} - The created SVG Element.
 *
 * @example
 *
 * // Create a new circle with red fill and black stroke and append it to the body
 * Elementool.draw('circle', undefined, { fill: 'red', stroke: 'black' }).appendTo(document.body);
 *
 */
  this.draw = function (selector, optionalDescendants, optionalStyleObject, optionalEventListeners) {
    var svgElement = this.util.make(selector, optionalDescendants, optionalStyleObject, "http://www.w3.org/2000/svg", optionalEventListeners);
    svgElement.moveElementBehind = this.svgHelpers.moveElementBehind;
    return svgElement;
  };

  this.math = function (selector, optionalDescendants, optionalStyleObject, optionalEventListeners) {
    return this.util.make(selector, optionalDescendants, optionalStyleObject, "http://www.w3.org/1998/Math/MathML", optionalEventListeners);
  };

  /**
   * Converts an object into a set of elements based on the object's properties.
   * 
   * The object must have one of the following properties:
   * - make: A string representing a CSS selector for the HTML element to be created.
   * - draw: A string representing a CSS selector for the SVG element to be created.
   * - math: A string representing a CSS selector for the MathML element to be created.
   * 
   * The object may optionally have the following properties:
   * - content: A string, Element, or array of Elements to be appended to the created element.
   * - styles: An object containing style assignments for the created element.
   * - listeners: An object with event listeners assigned to the created element.
   * 
   * 
   * @param {*} obj - The definition of an element, potentially containing other elements
   * @returns {Element} - The created Element.
   */
  this.objectToElement = function (obj) {
    try {
      if (typeof obj.make === "string") {
        return this.make(obj.make, obj.content, obj.styles, obj.listeners);
      } else if (typeof obj.draw === "string") {
        return this.draw(obj.draw, obj.content, obj.styles, obj.listeners);
      } else if (typeof obj.math === "string") {
        return this.math(obj.math, obj.content, obj.styles, obj.listeners);
      }
    } catch (e) {
      // fail silently
    }
  };

  this.util = {
    /**
     * Converts polar coordinates to Cartesian coordinates.
     * @param {number} centerX - The x-coordinate of the center of the circle.
     * @param {number} centerY - The y-coordinate of the center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {number} angleInDegrees - The angle in degrees, measured clockwise from the positive x-axis.
     * @returns {Object} An object with x and y properties representing the Cartesian coordinates, and a toXY method for formatting the coordinates as a string.
     */
    polarToCartesian: function (centerX, centerY, radius, angleInDegrees) {

      var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians)),
        toXY: function (spacer) { return this.x + spacer + this.y; }
      };

    },

    /**
     * Takes a single element CSS selector and turns it into an object with the specified properties.
     * @param {string} selector - A single element CSS selector.
     * @returns {Object} An object with properties: tagName, id, classList, and attributes.
     */
    selectorToComponents: function (selector) {
      // Initialize the result object with default values
      var result = {
        tagName: 'div',
        id: undefined,
        classList: [],
        attributes: {}
      };

      var doneAttributes = [];

      // Extract the attributes first to simplify parsing of the remaining selector
      var attributeRegex = /\[([\w-]+)(?:=(?:['"](.+?)['"]|([^\]]+)))?\]/g;
      var attributeMatch;
      while ((attributeMatch = attributeRegex.exec(selector)) !== null) {
        var attributeName = attributeMatch[1];
        var attributeValue = attributeMatch[2] || attributeMatch[3] || '';
        result.attributes[attributeName] = attributeValue;

        doneAttributes.push(attributeMatch[0]);
      }

      doneAttributes.forEach(function (att) {
        selector = selector.split(att).join("");
      });

      // Regex to match different parts of the selector
      var tagNameRegex = /^[\w-]+/;
      var idRegex = /#([\w-]+)/;
      var classRegex = /\.([\w-]+)/g;

      // Extract the tag name
      var tagNameMatch = selector.match(tagNameRegex);
      if (tagNameMatch) {
        result.tagName = tagNameMatch[0];
        selector = selector.replace(tagNameMatch[0], '');
      }

      // Extract the ID
      var idMatch = selector.match(idRegex);
      if (idMatch) {
        result.id = idMatch[1];
      }

      // Extract the class list
      var classMatch;
      while ((classMatch = classRegex.exec(selector)) !== null) {
        result.classList.push(classMatch[1]);
      }
      //console.log(result);
      return result;
    },

    /**
     * Takes a single string input and returns an object with the appropriate properties
     * depending on the input.
     * @param {string} input - A single string input representing an element selector with optional combinators.
     * @returns {Object} An object with properties: elementDefinition, parentElement (optional), and siblingElement (optional).
     */
    resolveRelativeElement: function (input) {
      // Initialize the result object with the default values
      var result = {
        elementDefinition: '',
        parentElement: undefined,
        siblingElement: undefined
      };

      // Replace attribute selectors with placeholders to avoid confusion with combinators
      var attributeRegex = /\[.*?\]/g;
      var attributePlaceholders = [];
      var attributeMatch;
      while ((attributeMatch = attributeRegex.exec(input)) !== null) {
        var placeholder = 'ATTR' + attributePlaceholders.length;
        attributePlaceholders.push(attributeMatch[0]);
        input = input.replace(attributeMatch[0], placeholder);
      }

      // Find the last child or sibling combinator in the input string
      var lastCombinatorIndex = Math.max(input.lastIndexOf('>'), input.lastIndexOf('+'));

      if (lastCombinatorIndex !== -1) {
        // Set the elementDefinition to the selector after the last combinator
        result.elementDefinition = input.slice(lastCombinatorIndex + 1).trim();

        // Set the parentElement or siblingElement property depending on the last combinator
        if (input[lastCombinatorIndex] === '>') {
          result.parentElement = input.slice(0, lastCombinatorIndex).trim();
        } else {
          result.siblingElement = input.slice(0, lastCombinatorIndex).trim();
        }
      } else {
        // If there's no combinator, the input string is a single element selector
        result.elementDefinition = input.trim();
      }

      // Replace attribute placeholders with their original values
      for (var i = 0; i < attributePlaceholders.length; i++) {
        result.elementDefinition = result.elementDefinition.replace('ATTR' + i, attributePlaceholders[i]);
        if (result.parentElement) {
          result.parentElement = result.parentElement.replace('ATTR' + i, attributePlaceholders[i]);
        }
        if (result.siblingElement) {
          result.siblingElement = result.siblingElement.replace('ATTR' + i, attributePlaceholders[i]);
        }
      }

      return result;
    },

    /**
     * Applies styles from the given style object to the specified Element.
     * @param {Element} element - The Element to which the styles will be applied.
     * @param {Object} styles - An object containing style assignments in either JS notation or CSS notation.
     */
    applyStylesToElement: function (element, styles) {
      // Iterate through each style property in the styles object
      for (var property in styles) {
        if (styles.hasOwnProperty(property)) {
          var value = styles[property];

          if (typeof value === "function") {
            element._dynamicStyles = element._dynamicStyles || {};
            element._dynamicStyles[property] = value;
            value = value();
          }

          // Check if the property is a CSS custom property (e.g. '--col')
          var customPropertyRegex = /^--/;
          if (customPropertyRegex.test(property)) {
            // Apply the CSS custom property using setProperty method
            element.style.setProperty(property, value);
          } else {
            // Check if the property is in CSS notation (e.g. 'margin-left')
            var cssNotationRegex = /-./g;
            if (cssNotationRegex.test(property)) {
              // Convert the property from CSS notation to JS notation (e.g. 'marginLeft')
              var jsNotationProperty = property.replace(cssNotationRegex, function (match) {
                return match.charAt(1).toUpperCase();
              });

              // Apply the style to the element using JS notation
              element.style[jsNotationProperty] = value;
            } else {
              // Apply the style to the element using the given JS notation
              element.style[property] = value;
            }
          }
        }
      }
    },

    /**
     * Applies an object of attributes to an element
     * @param {*} element 
     * @param {*} attributes 
     */
    setAttributesOnElement: function (element, attributes) {
      for (var attr in attributes) {
        if (typeof attributes[attr] === "function") {
          element._dynamicAttributes = element._dynamicAttributes || {};
          element._dynamicAttributes[attr] = attributes[attr];
          attributes[attr] = attributes[attr]();
        }
        if (element instanceof SVGElement) {
          element.setAttributeNS(null, attr, attributes[attr]);
        } else if (window.MathMLElement && element instanceof window.MathMLElement) {
          element.setAttributeNS(attr, attributes[attr]);
        } else {
          element.setAttribute(attr, attributes[attr]);
        }
      }
    },

    /**
     * Creates an Element based on the given selector, content, and styles, and
     * appends the element to the specified parent or sibling element, if provided.
     *
     * @param {string} selector - The selector for the element to be created and the
     *                             parent or sibling element it should be appended to.
     * @param {string|Element|Element[]|undefined} content - The content to be
     *                                                               set as the textContent,
     *                                                               an Element, or an array
     *                                                               of Elements.
     * @param {Object} styles - An object containing style assignments for the created element.
     * @returns {Element} - The created Element.
     */
    make: function (selector, content, styles, optionalNamespace, optionalEventListeners) {
      // Get the element relationship information.
      var elementInfo = this.resolveRelativeElement(selector);

      // Get the component information for the element to be created.
      var components = this.selectorToComponents(elementInfo.elementDefinition);

      // Create the new element.
      var newElement = optionalNamespace ?
        document.createElementNS(optionalNamespace, components.tagName)
        :
        document.createElement(components.tagName || "div");

      // Set the ID, if provided.
      if (components.id) {
        newElement.id = components.id;
      }

      // Set the class list, if provided.
      if (components.classList) {
        components.classList.forEach(function (className) {
          newElement.classList.add(className);
        });
      }

      // Set the attributes, if provided.
      this.setAttributesOnElement(newElement, components.attributes);

      // Set the content, if provided.
      if (typeof content === "string") {
        newElement.textContent = content;
      } else if (typeof content === "function") {
        newElement._dynamicContent = content;
        newElement.textContent = content();
      } else if (content instanceof Element) {
        newElement.appendChild(content);
      } else if (typeof content === "object" && content && (content.draw || content.make || content.math)) {
        var proposedContent = self.objectToElement(content);
        if (proposedContent instanceof Element) {
          newElement.appendChild(proposedContent);
        }
      } else if (Array.isArray(content)) {
        content.forEach(function (child) {
          if (child instanceof Element) {
            newElement.appendChild(child);
          } else if (typeof child === "object" && child && (child.draw || child.make || child.math)) {
            var proposedContent = self.objectToElement(child);
            if (proposedContent instanceof Element) {
              newElement.appendChild(proposedContent);
            }
          }
        });
      }

      // Apply the styles, if provided.
      if (styles) {
        this.applyStylesToElement(newElement, styles);
      }

      // Apply the event listeners, if provided.
      if (optionalEventListeners) {
        for (var event in optionalEventListeners) {
          if (optionalEventListeners.hasOwnProperty(event)) {
            if (typeof optionalEventListeners[event] === "function") {
              newElement.addEventListener(event, optionalEventListeners[event]);
            }
          }
        }
      }

      // Append the new element to the specified parent or sibling element, if provided.
      if (elementInfo.parentElement) {
        var parent = document.querySelector(elementInfo.parentElement);
        if (parent) {
          parent.appendChild(newElement);
        }
      } else if (elementInfo.siblingElement) {
        var sibling = document.querySelector(elementInfo.siblingElement);
        if (sibling && sibling.parentNode) {
          sibling.parentNode.insertBefore(newElement, sibling.nextSibling);
        }
      }

      // Add the appendTo method to the new element.
      newElement.appendTo = function (intendedParentElement) {
        if (intendedParentElement instanceof Element) {
          intendedParentElement.appendChild(this);
        }
        return this;
      };

      newElement.setStyles = function (styleObject) {
        self.util.applyStylesToElement(this, styleObject);
        return this;
      };

      newElement.setAttributes = function (attributesObject) {
        self.util.setAttributesOnElement(this, attributesObject);
        return this;
      };

      newElement.setContent = function (content) {
        if (typeof content === "function") {
          this._dynamicContent = content;
          this.textContent = content();
        } else {
          this.textContent = content;
        }
        return this;
      };

      newElement.render = function () {
        if (typeof this._dynamicContent === "function") {
          this.textContent = this._dynamicContent();
        }
        if (this._dynamicStyles) {
          self.util.applyStylesToElement(this, this._dynamicStyles);
        }
        if (this._dynamicAttributes) {
          self.util.setAttributesOnElement(this, this._dynamicAttributes);
        }
        return this;
      }

      // Return the new element.
      return newElement;
    },


  }

  this.svgHelpers = {

    circle: function (cx, cy, r, styles) {
      var attributeString = [
        ["cx", cx],
        ["cy", cy],
        ["r", r]
      ].map(function (pair) {
        return "[" + pair[0] + '="' + pair[1] + '"]';
      }).join("");

      return self.draw("circle" + attributeString, undefined, styles);
    },

    ellipse: function (cx, cy, rx, ry, styles) {
      var attributeString = [
        ["cx", cx],
        ["cy", cy],
        ["rx", rx],
        ["ry", ry]
      ].map(function (pair) {
        return "[" + pair[0] + '="' + pair[1] + '"]';
      }).join("");

      return self.draw("ellipse" + attributeString, undefined, styles);
    },

    line: function (x1, y1, x2, y2, styles) {
      var attributeString = [
        ["x1", x1],
        ["y1", y1],
        ["x2", x2],
        ["y2", y2]
      ].map(function (pair) {
        return "[" + pair[0] + '="' + pair[1] + '"]';
      }).join("");

      return self.draw("line" + attributeString, undefined, styles);
    },

    _polyAnything: function (type, points, styles) {
      var attributeString = [
        ["points", points]
      ].map(function (pair) {
        return "[" + pair[0] + '="' + pair[1] + '"]';
      }).join("");

      return self.draw(type + attributeString, undefined, styles);
    },

    polygon: function (points, styles) {
      return this._polyAnything("polygon", points, styles);
    },

    polyline: function (points, styles) {
      return this._polyAnything("polyline", points, styles);
    },

    rect: function (x, y, width, height, styles) {
      var attributeString = [
        ["x", x],
        ["y", y],
        ["width", width],
        ["height", height]
      ].map(function (pair) {
        return "[" + pair[0] + '="' + pair[1] + '"]';
      }).join("");

      return self.draw("rect" + attributeString, undefined, styles);
    },

    text: function (x, y, text, hAlign, vAlign, styles) {

      var hAlignMapping = {
        "left": "start",
        "center": "middle",
        "right": "end"
      };

      var vAlignMapping = {
        "top": "hanging",
        "center": "central",
        "bottom": "alphabetic"
      };

      var attributeString = [
        ["x", x],
        ["y", y],
        ["text-anchor", hAlignMapping[hAlign] || hAlign || "start"],
        ["dominant-baseline", vAlignMapping[vAlign] || vAlign || "alphabetic"]
      ].map(function (pair) {
        return "[" + pair[0] + '="' + pair[1] + '"]';
      }).join("");

      return self.draw("text" + attributeString, text, styles);

    },

    regularNGon: function (cx, cy, r, n, styles) {
      var points = [];
      for (var i = 0; i < n; i++) {
        var angle = 360 / n * i;
        var point = self.util.polarToCartesian(cx, cy, r, angle);
        points.push(point.toXY(","));
      }
      return this.polygon(points.join(" "), styles);
    },

    star: function (cx, cy, r, n, styles) {
      var points = [];
      for (var i = 0; i < n; i++) {
        var angle = 360 / n * i;
        var point = self.util.polarToCartesian(cx, cy, r, angle);
        points.push(point.toXY(","));
        angle += 360 / n / 2;
        point = self.util.polarToCartesian(cx, cy, r / 2, angle);
        points.push(point.toXY(","));
      }
      return this.polygon(points.join(" "), styles);
    },

    pathInstructions: {
      moveTo: function (x, y) {
        var currentValue = this.getAttribute("d") || "";
        this.setAttribute("d", currentValue + " M" + x + "," + y);
        return this;
      },
      moveToRelative: function(x,y){
        var currentValue = this.getAttribute("d") || "";
        this.setAttribute("d", currentValue + " m" + x + "," + y);
        return this;
      },
      lineTo: function (x, y) {
        var currentValue = this.getAttribute("d") || "";
        this.setAttribute("d", currentValue + " L" + x + "," + y);
        return this;
      },
      lineToRelative: function(x,y){
        var currentValue = this.getAttribute("d") || "";
        this.setAttribute("d", currentValue + " l" + x + "," + y);
        return this;
      },
      horizontalLineTo: function (x) {
        var currentValue = this.getAttribute("d") || "";
        this.setAttribute("d", currentValue + " H" + x);
        return this;
      },
      horizontalLineToRelative: function(x){
        var currentValue = this.getAttribute("d") || "";
        this.setAttribute("d", currentValue + " h" + x);
        return this;
      },
      verticalLineTo: function (y) {
        var currentValue = this.getAttribute("d") || "";
        this.setAttribute("d", currentValue + " V" + y);
        return this;
      },
      verticalLineToRelative: function(y){
        var currentValue = this.getAttribute("d") || "";
        this.setAttribute("d", currentValue + " v" + y);
        return this;
      },
      arcTo: function (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
        if(typeof xAxisRotation === "boolean"){
          sweepFlag = xAxisRotation;
          xAxisRotation = 0;
        }
        if(typeof largeArcFlag === "boolean"){
          sweepFlag = largeArcFlag;
          largeArcFlag = 0;
        }
        var currentValue = this.getAttribute("d") || "";
        this.setAttribute("d", currentValue + " A" + rx + "," + ry + " " + xAxisRotation + " " + largeArcFlag + "," + sweepFlag + " " + x + "," + y);
        return this;
      },
      arcToRelative: function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y){
        if(typeof xAxisRotation === "boolean"){
          sweepFlag = xAxisRotation;
          xAxisRotation = 0;
        }
        if(typeof largeArcFlag === "boolean"){
          sweepFlag = largeArcFlag;
          largeArcFlag = 0;
        }
        var currentValue = this.getAttribute("d") || "";
        this.setAttribute("d", currentValue + " a" + rx + "," + ry + " " + xAxisRotation + " " + largeArcFlag + "," + sweepFlag + " " + x + "," + y);
        return this;
      },
      closePath: function () {
        var currentValue = this.getAttribute("d") || "";
        this.setAttribute("d", currentValue + " Z");
        return this;
      },
      quadraticBezierCurveTo: function (x1, y1, x, y) {
        var smooth = false;
        if(!x && !y){
          x = x1;
          y = y1;
          smooth = true;
        }
        var currentValue = this.getAttribute("d") || "";
        if(smooth){
          this.setAttribute("d", currentValue + " T" + x + "," + y);
        } else {
          this.setAttribute("d", currentValue + " Q" + x1 + "," + y1 + " " + x + "," + y);
        }
        return this;
      },
      quadraticBezierCurveToRelative: function(x1, y1, x, y){
        var smooth = false;
        if(!x && !y){
          x = x1;
          y = y1;
          smooth = true;
        }
        var currentValue = this.getAttribute("d") || "";
        if(smooth){
          this.setAttribute("d", currentValue + " t" + x + "," + y);
        } else {
          this.setAttribute("d", currentValue + " q" + x1 + "," + y1 + " " + x + "," + y);
        }
        return this;
      },
      cubicBezierCurveTo: function (x1, y1, x2, y2, x, y) {
        var smooth = false;
        if(!x && !y){
          x = x2;
          y = y2;
          smooth = true;
        }
        var currentValue = this.getAttribute("d") || "";
        if(smooth){
          this.setAttribute("d", currentValue + " S" + x + "," + y);
        } else {
          this.setAttribute("d", currentValue + " C" + x1 + "," + y1 + " " + x2 + "," + y2 + " " + x + "," + y);
        }
        return this;
      },
      cubicBezierCurveToRelative: function(x1, y1, x2, y2, x, y){
        var smooth = false;
        if(!x && !y){
          x = x2;
          y = y2;
          smooth = true;
        }
        var currentValue = this.getAttribute("d") || "";
        if(smooth){
          this.setAttribute("d", currentValue + " s" + x + "," + y);
        } else {
          this.setAttribute("d", currentValue + " c" + x1 + "," + y1 + " " + x2 + "," + y2 + " " + x + "," + y);
        }
        return this;
      },
      
        
    },

    path: function (d, styles) {
      var attributeString = [
        ["d", d]
      ].map(function (pair) {
        return "[" + pair[0] + '="' + pair[1] + '"]';
      }).join("");

      var returnedPath = self.draw("path" + attributeString, undefined, styles);
      for(var k in this.pathInstructions){
        if(this.pathInstructions.hasOwnProperty(k)){
          returnedPath[k] = this.pathInstructions[k];
        }
      }

      return returnedPath;
    },

    clipPath: function(id, content){
      var clipPath = self.draw("clipPath", content);
      clipPath.id = id;
      return clipPath;
    },

    mask: function(id, content){
      var mask = self.draw("mask", content);
      mask.id = id;
      return mask;
    },

    group: function (content, styles) {
      return self.draw("g", content, styles);
    },

    pattern: function (id, width, height, content, styles) {
      var pattern = self.draw("pattern", content, styles);
      pattern.id = id;
      pattern.setAttribute("width", width);
      pattern.setAttribute("height", height);
      pattern.setAttribute("patternUnits", "userSpaceOnUse");
      return pattern;
    },

    linearGradient: function (id, stops, x1OrDirection, y1, x2, y2) {
      var gradient = self.draw("linearGradient", stops);
      gradient.id = id;
      var x1;
      if(typeof x1OrDirection === "string"){
        if(x1OrDirection === "LR"){
          x1 = 0;
          y1 = 0;
          x2 = 1;
          y2 = 0;
        } else if(x1OrDirection === "RL"){
          x1 = 1;
          y1 = 0;
          x2 = 0;
          y2 = 0;
        } else if(x1OrDirection === "TB"){
          x1 = 0;
          y1 = 0;
          x2 = 0;
          y2 = 1;
        } else if(x1OrDirection === "BT"){
          x1 = 0;
          y1 = 1;
          x2 = 0;
          y2 = 0;
        } else if(x1OrDirection === "TLBR"){
          x1 = 0;
          y1 = 0;
          x2 = 1;
          y2 = 1;
        } else if(x1OrDirection === "BLTR"){
          x1 = 0;
          y1 = 1;
          x2 = 1;
          y2 = 0;
        } else if(x1OrDirection === "TRBL"){
          x1 = 1;
          y1 = 0;
          x2 = 0;
          y2 = 1;
        } else if(x1OrDirection === "BRTL"){
          x1 = 1;
          y1 = 1;
          x2 = 0;
          y2 = 0;
        } else {
          x1 = 0;
          y1 = 0;
          x2 = 1;
          y2 = 0;
        }
      } else {
        x1 = x1OrDirection;
      }
      gradient.setAttribute("x1", x1);
      gradient.setAttribute("y1", y1);
      gradient.setAttribute("x2", x2);
      gradient.setAttribute("y2", y2);
      return gradient;
    },

    stop: function (offset, color, opacity) {
      var stop = self.draw("stop");
      stop.setAttribute("offset", offset);
      stop.setAttribute("stop-color", color);
      if (opacity) {
        stop.setAttribute("stop-opacity", opacity);
      }
      return stop;
    },

    radialGradient: function (id, stops, cx, cy, r, fx, fy) {
      var gradient = self.draw("radialGradient", stops);
      gradient.id = id;
      gradient.setAttribute("cx", cx);
      gradient.setAttribute("cy", cy);
      gradient.setAttribute("r", r);
      if (fx) {
        gradient.setAttribute("fx", fx);
      }
      if (fy) {
        gradient.setAttribute("fy", fy);
      }
      return gradient;
    },

    
    animate: function (svgElement, attributeToAnimate, fromValue, toValue, duration, repeatCount, fillMode) {

      // if fromValue is not provided, get the current value of the attribute
      if (!fromValue) {
        fromValue = svgElement.getAttribute(attributeToAnimate);
      }

      // if toValue is not provided, get the current value of the attribute
      if (!toValue) {
        toValue = svgElement.getAttribute(attributeToAnimate);
      }

      // if duration is not provided, default to 1 second
      if (!duration) {
        duration = "1s";
      }

      // if repeatCount is not provided, default to 1
      if (!repeatCount) {
        repeatCount = "1";
      }

      // if fillMode is not provided, default to "freeze"
      if (!fillMode) {
        fillMode = "freeze";
      }

      // Create attribute string for the animate element
      var animateString = [
        ["attributeName", attributeToAnimate],
        ["from", fromValue],
        ["to", toValue],
        ["dur", duration],
        ["repeatCount", repeatCount],
        ["fill", fillMode]
      ].map(function (pair) {
        return "[" + pair[0] + '="' + pair[1] + '"' + "]";
      }).join("");

      var animateElement = self.draw("animate" + animateString);
      svgElement.appendChild(animateElement);
    },

    animateTransform: function (svgElement, type, fromValue, toValue, duration, repeatCount, fillMode) {

      // if fromValue is not provided, get the current value of the attribute
      if (!fromValue) {
        fromValue = svgElement.getAttribute("transform");
      }

      // if toValue is not provided, get the current value of the attribute
      if (!toValue) {
        toValue = svgElement.getAttribute("transform");
      }

      // if duration is not provided, default to 1 second
      if (!duration) {
        duration = "1s";
      }

      // if repeatCount is not provided, default to 1
      if (!repeatCount) {
        repeatCount = "1";
      }

      // if fillMode is not provided, default to "freeze"
      if (!fillMode) {
        fillMode = "freeze";
      }

      // Create attribute string for the animate element
      var animateString = [
        ["attributeName", "transform"],
        ["type", type],
        ["from", fromValue],
        ["to", toValue],
        ["dur", duration],
        ["repeatCount", repeatCount],
        ["fill", fillMode]
      ].map(function (pair) {
        return "[" + pair[0] + '="' + pair[1] + '"' + "]";
      }).join("");

      var animateElement = self.draw("animateTransform" + animateString);
      svgElement.appendChild(animateElement);
    },

    animateMotion: function (svgElement, path, duration, repeatCount, fillMode) {

      // if duration is not provided, default to 1 second
      if (!duration) {
        duration = "1s";
      }

      // if repeatCount is not provided, default to 1
      if (!repeatCount) {
        repeatCount = "1";
      }

      // if fillMode is not provided, default to "freeze"
      if (!fillMode) {
        fillMode = "freeze";
      }

      // Create attribute string for the animate element
      var animateString = [
        ["dur", duration],
        ["repeatCount", repeatCount],
        ["fill", fillMode],
        ["path", path]
      ].map(function (pair) {
        return "[" + pair[0] + '="' + pair[1] + '"' + "]";
      }).join("");

      var animateElement = self.draw("animateMotion" + animateString);
      svgElement.appendChild(animateElement);
    },

    moveElementBehind: function (elementToMove, elementToMoveBehind) {
      if(!elementToMoveBehind && typeof this === "object" && this instanceof SVGElement){
        elementToMoveBehind = elementToMove;
        elementToMove = this;
      }
      if (elementToMoveBehind.parentNode) {
        elementToMoveBehind.parentNode.insertBefore(elementToMove, elementToMoveBehind);
      }
    },

    addMaskToElement: function (element, maskElement) {
      if (maskElement instanceof Element){
        if(maskElement.id) {
          element.setAttribute("mask", "url(#" + maskElement.id + ")");
        } else {
          var maskId = "mask" + Math.random().toString().slice(2);
          maskElement.id = maskId;
          element.setAttribute("mask", "url(#" + maskId + ")");
        }
        // if the mask element isn't in the DOM we'll need to add it
        if(!maskElement.parentNode){
          element.parentNode.insertBefore(maskElement, element);
        }
      }
    },


    addClipPathToElement: function (element, clipPathElement) {
      if (clipPathElement instanceof Element){
        if(clipPathElement.id) {
          element.setAttribute("clip-path", "url(#" + clipPathElement.id + ")");
        } else {
          var clipPathId = "clipPath" + Math.random().toString().slice(2);
          clipPathElement.id = clipPathId;
          element.setAttribute("clip-path", "url(#" + clipPathId + ")");
        }
        // if the clip path element isn't in the DOM we'll need to add it
        if(!clipPathElement.parentNode){
          element.parentNode.insertBefore(clipPathElement, element);
        }
      }
    },

    groupElements: function (elements) {
      var group = self.draw("g");
      // if the first element of the array has a parent, append the group to the parent
      if (elements[0].parentNode) {
        elements[0].parentNode.appendChild(group);
      }
      elements.forEach(function (element) {
        group.appendChild(element);
      });
      return group;
    }

  };

  this.accessibilityHelpers = {
    description: function(element, description){
      element.setAttribute("aria-label", description);
      element.setAttribute("title", description);
      return element;
    },
    button: function(element, customDescription){
      element.setAttribute("role", "button");
      if(customDescription) this.description(element, customDescription);
      return element;
    },
    link: function(element, customDescription){
      element.setAttribute("role", "link");
      if(customDescription) this.description(element, customDescription);
      return element;
    }
  }

  /**
   * Applies styles from the given style object to the specified Element.
   * @param {Element} element - The Element to which the styles will be applied.
   * @param {Object} styleObject - An object containing style assignments in either JS notation or CSS notation.
   */
  this.applyStyle = function (element, styleObject) {
    this.util.applyStylesToElement(element, styleObject);
  };

  this.setAttributes = function (element, attributesObject) {
    this.util.setAttributesOnElement(element, attributesObject);
  };

  /**
   * Removes the specified element from its parent node.
   * @param {Element} element - The Element to be removed.
   */
  this.remove = function (element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  /**
   * Removes all child nodes of the specified element.
   * @param {Element} element - The Element whose child nodes will be removed.
   */
  this.removeAllChildren = function (element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  /**
   * Appends a single Element or an array of Elements to a specified element.
   * @param {Element} element - The Element to which the content will be appended.
   * @param {Element|Element[]} contentToAppend - A single Element or an array of Elements to be appended.
   */
  this.append = function (element, contentToAppend) {
    if (contentToAppend instanceof Element) {
      element.appendChild(contentToAppend);
    } else if (Array.isArray(contentToAppend)) {
      contentToAppend.forEach(function (child) {
        if (child instanceof Element) {
          element.appendChild(child);
        }
      });
    }
  };

}
