function Elementool() {

  var self = this;

  this.make = function (selector, optionalDescendants, optionalStyleObject) {
    return this.util.make(selector, optionalDescendants, optionalStyleObject);
  };

  this.draw = function (selector, optionalText, optionalStyleObject) {
    return this.util.make(selector, optionalText, optionalStyleObject, "http://www.w3.org/2000/svg");
  };

  this.math = function (selector, optionalText, optionalStyleObject) {
    return this.util.make(selector, optionalText, optionalStyleObject, "http://www.w3.org/1998/Math/MathML");
  };

  this.objectToElement = function (obj) {
    try {
      if (typeof obj.make === "string") {
        return this.make(obj.make, obj.content, obj.styles);
      } else if (typeof obj.draw === "string") {
        return this.draw(obj.draw, obj.content, obj.styles);
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
    make: function (selector, content, styles, optionalNamespace) {
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
        newElement.className = components.classList.join(" ");
      }

      // Set the attributes, if provided.
      for (var attr in components.attributes) {
        if (optionalNamespace) {
          newElement.setAttributeNS(null, attr, components.attributes[attr]);
        } else {
          newElement.setAttribute(attr, components.attributes[attr]);
        }
      }

      // Set the content, if provided.
      if (typeof content === "string") {
        newElement.textContent = content;
      } else if (content instanceof Element) {
        newElement.appendChild(content);
      } else if (typeof content === "object" && content && (content.draw || content.make)) {
        var proposedContent = self.objectToElement(content);
        if (proposedContent instanceof Element) {
          newElement.appendChild(proposedContent);
        }
      } else if (Array.isArray(content)) {
        content.forEach(function (child) {
          if (child instanceof Element) {
            newElement.appendChild(child);
          } else if (typeof child === "object" && child && (child.draw || child.make)) {
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

      // Return the new element.
      return newElement;
    },


  }


  /**
   * Applies styles from the given style object to the specified Element.
   * @param {Element} element - The Element to which the styles will be applied.
   * @param {Object} styleObject - An object containing style assignments in either JS notation or CSS notation.
   */
  this.applyStyle = function (element, styleObject) {
    this.util.applyStylesToElement(element, styleObject);
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
