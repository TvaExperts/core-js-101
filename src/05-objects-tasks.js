/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
}

Rectangle.prototype.getArea = function getArea() {
  return this.width * this.height;
};


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const objFromJson = JSON.parse(json);
  return Object.setPrototypeOf(objFromJson, proto);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const TYPES_OF_PARTS = {
  ELEMENT: 0,
  ID: 1,
  CLASS: 2,
  ATTR: 3,
  PSEUDO_CLASS: 4,
  PSEUDO_ELEMENT: 5,
};

class MyBuilder {
  constructor(initStr, typeOfPart) {
    this.line = '';
    this.partsPresence = new Array(6).fill(0);
    this.addNewPartInLine(initStr, typeOfPart);
  }

  isCorrectOrderForNewPart(newPartType) {
    return !this.partsPresence.slice(newPartType + 1).filter((item) => item > 0).length;
  }

  element(str) {
    if (this.partsPresence[TYPES_OF_PARTS.ELEMENT]) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.addNewPartInLine(str, TYPES_OF_PARTS.ELEMENT);
    return this;
  }

  class(str) {
    this.addNewPartInLine(str, TYPES_OF_PARTS.CLASS);
    return this;
  }

  id(str) {
    if (this.partsPresence[TYPES_OF_PARTS.ID]) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.addNewPartInLine(str, TYPES_OF_PARTS.ID);
    return this;
  }

  attr(str) {
    this.addNewPartInLine(str, TYPES_OF_PARTS.ATTR);
    return this;
  }

  pseudoClass(str) {
    this.addNewPartInLine(str, TYPES_OF_PARTS.PSEUDO_CLASS);
    return this;
  }

  pseudoElement(str) {
    if (this.partsPresence[TYPES_OF_PARTS.PSEUDO_ELEMENT]) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.addNewPartInLine(str, TYPES_OF_PARTS.PSEUDO_ELEMENT);
    return this;
  }

  addNewPartInLine(str, typeOfPart) {
    if (!this.isCorrectOrderForNewPart(typeOfPart)) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.partsPresence[typeOfPart] += 1;
    switch (typeOfPart) {
      case TYPES_OF_PARTS.ELEMENT:
        this.line += str;
        break;
      case TYPES_OF_PARTS.ID:
        this.line += `#${str}`;
        break;
      case TYPES_OF_PARTS.CLASS:
        this.line += `.${str}`;
        break;
      case TYPES_OF_PARTS.PSEUDO_CLASS:
        this.line += `:${str}`;
        break;
      case TYPES_OF_PARTS.PSEUDO_ELEMENT:
        this.line += `::${str}`;
        break;
      case TYPES_OF_PARTS.ATTR:
        this.line += `[${str}]`;
        break;
      default:
    }
  }

  combineTail(combinator, lineStr) {
    this.line += ` ${combinator} ${lineStr}`;
    return this;
  }

  stringify() {
    return this.line;
  }
}

const cssSelectorBuilder = {

  element(value) {
    return new MyBuilder(value, TYPES_OF_PARTS.ELEMENT);
  },

  id(value) {
    return new MyBuilder(value, TYPES_OF_PARTS.ID);
  },

  class(value) {
    return new MyBuilder(value, TYPES_OF_PARTS.CLASS);
  },

  attr(value) {
    return new MyBuilder(value, TYPES_OF_PARTS.ATTR);
  },

  pseudoClass(value) {
    return new MyBuilder(value, TYPES_OF_PARTS.PSEUDO_CLASS);
  },

  pseudoElement(value) {
    return new MyBuilder(value, TYPES_OF_PARTS.PSEUDO_ELEMENT);
  },

  combine(selector1, combinator, selector2) {
    return selector1.combineTail(combinator, selector2.stringify());
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
