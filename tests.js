const { JSDOM } = require('jsdom');
const dom = new JSDOM();
global.document = dom.window.document;
global.Element = dom.window.Element;

const YourObject = require('./index'); // replace with the actual exported object containing the append method

describe('append function', () => {
  let element;
  let yourObject;

  beforeEach(() => {
    element = document.createElement('div');
    yourObject = new YourObject(); // replace with the actual constructor
  });

  test('appends a single element', () => {
    const child = document.createElement('p');
    yourObject.append(element, child);
    expect(element.firstChild).toBe(child);
  });

  test('appends an array of elements', () => {
    const children = [document.createElement('p'), document.createElement('span')];
    yourObject.append(element, children);
    children.forEach((child, index) => {
      expect(element.children[index]).toBe(child);
    });
  });

  test('ignores non-Element values in an array', () => {
    const children = [document.createElement('p'), 'not an element', document.createElement('span')];
    yourObject.append(element, children);
    expect(element.children.length).toBe(2);
    expect(element.firstChild).toBe(children[0]);
    expect(element.lastChild).toBe(children[2]);
  });
});