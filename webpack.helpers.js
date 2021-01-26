const handlebarsLayouts = require('handlebars-layouts');
const fakerLib = require('faker');

const handlebarsContext = {};

function _handlebarsEqualHelper(name, value, options) {
  return handlebarsContext[name] === value ? options.fn(this) : options.inverse(this);
}

function _handlebarsVariablesHelper(name, options) {
  const content = options.fn(this);
  handlebarsContext[name] = content;
}

/**
 * Generates an array of random length between our `min` and `max`.
 *
 * @example
 *     {{! Randomly loop 5-10 times }}
 *     {{#each (randomRange 5 10)}} ... {{/each}}
 *
 * @example
 *     {{! Randomly loop 1-9 times }}
 *     {{#each (randomRange 9)}} ... {{/each}}
 *
 * @param {Number} [min] If called with 1 argument, argument is used as the `max` and min is set to `1`.
 * @param {Number} max
 * @returns {Array} Returns an array filled with numbers starting from 1
 */
function randomRange(min, max, options) {
  // If we call this with one arg, the number is the max, min is set to 1
  if (typeof max === 'object' && typeof min === 'number') {
    max = min;
    min = 1;
  }

  if (typeof min !== 'number') {
    min = 1;
  }

  if (typeof max !== 'number') {
    max = 5;
  }

  let num = fakerLib.random.number({ min, max });
  return Array(num)
    .fill()
    .map((_, i) => i + 1);
}

/**
 * Conveninence function to generate lorem ipsum words
 * @param {int} num Number of words to create.
 * @param {bool} [upperCase] When true
 * @returns {String}
 */
function loremWords(...args) {
  // Remove HBS `options`, destructure args
  let [num, upperCase = true] = args.slice(0, -1);

  let words = fakerLib.lorem.words(num);
  return upperCase ? words.charAt(0).toUpperCase() + words.slice(1) : words;
}

function loremWord(...args) {
  // Remove HBS `options`, destructure `upperCase` arg
  let [upperCase = true] = args.slice(0, -1);
  let word = fakerLib.lorem.word();
  return upperCase ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

/**
 * Conveninence function to generate lorem ipsum setences
 * @param {int} num Number of sentences to create.
 * @returns {String}
 */
function loremSentences(num) {
  if (typeof num !== 'number') {
    // Use default num count in Faker
    num = undefined;
  }

  return fakerLib.lorem.sentences(num);
}

function loremSentence(wordCount) {
  if (typeof wordCount !== 'number') {
    // Use default wordCount count in Faker
    wordCount = undefined;
  }

  return fakerLib.lorem.sentence(wordCount);
}

/**
 * Use math operators in hbs partials
 * i.e. {{math @index "+" 5}} will return index value incremented by 5
 *
 * @param {number} leftValue ex. @index
 * @param {string} operator basic math operator "+", "-", "*", "/", "%"
 * @param {number} rightValue custom number
 * @returns {number} resulting value
 */
function math(leftValue, operator, rightValue) {
  leftValue = parseFloat(leftValue);
  rightValue = parseFloat(rightValue);

  return {
    '+': leftValue + rightValue,
    '-': leftValue - rightValue,
    '*': leftValue * rightValue,
    '/': (leftValue / rightValue).toFixed(2),
    '%': leftValue % rightValue,
  }[operator];
}

function registerHandlersHelpers(Handlebars) {
  Handlebars.registerHelper('equal', _handlebarsEqualHelper);
  Handlebars.registerHelper('set', _handlebarsVariablesHelper);
  Handlebars.registerHelper('randomRange', randomRange);
  Handlebars.registerHelper('loremWords', loremWords);
  Handlebars.registerHelper('loremWord', loremWord);
  Handlebars.registerHelper('loremSentences', loremSentences);
  Handlebars.registerHelper('loremSentence', loremSentence);
  Handlebars.registerHelper('math', math);

  handlebarsLayouts.register(Handlebars);
}

function _escapeForRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function makeDataReplacements(originalData) {
  const { replacements, ...data } = originalData;
  let dataAsString = JSON.stringify(data);
  Object.keys(replacements).map((key) => {
    dataAsString = dataAsString.replace(new RegExp(_escapeForRegex(key), 'g'), replacements[key]);
  });
  return JSON.parse(dataAsString);
}

module.exports = {
  makeDataReplacements,
  registerHandlersHelpers,
};
