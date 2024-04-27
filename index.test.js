const { JSDOM } = require('jsdom');
const fs = require('fs');
const dom = new JSDOM(`
<!DOCTYPE html>
<body>
  <script>${fs.readFileSync("index.js").toString()}</script>
</body>`, { runScripts: 'dangerously' });
global.document = dom.window.document;
global.Element = dom.window.Element;


describe('append function', () => {
  let element;
  let el;

  beforeEach(() => {
    element = document.createElement('div');
    el = new dom.window.Elementool(); // replace with the actual constructor
  });

  test('appends a single element', () => {
    const child = document.createElement('p');
    el.append(element, child);
    expect(element.firstChild).toBe(child);
  });

  test('appends an array of elements', () => {
    const children = [document.createElement('p'), document.createElement('span')];
    el.append(element, children);
    children.forEach((child, index) => {
      expect(element.children[index]).toBe(child);
    });
  });

  test('ignores non-Element values in an array', () => {
    const children = [document.createElement('p'), 'not an element', document.createElement('span')];
    el.append(element, children);
    expect(element.children.length).toBe(2);
    expect(element.firstChild).toBe(children[0]);
    expect(element.lastChild).toBe(children[2]);
  });
});