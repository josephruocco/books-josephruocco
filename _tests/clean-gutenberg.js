// Self-check for the reader's Gutenberg cleaner. No network, no framework:
//   node _tests/clean-gutenberg.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const page = fs.readFileSync(path.join(__dirname, '..', 'woodwork-demo.html'), 'utf8');
const source = page.slice(page.indexOf('function cleanGutenbergPayload'),
                          page.indexOf('function isSectionHeading'));
const cleanGutenbergPayload = new Function(source + '; return cleanGutenbergPayload;')();

const body = ('The little town of Verrieres can pass for one of the prettiest.\n\n').repeat(400);
const contents = 'CONTENTS\n\n    CHAPTER I        A SMALL TOWN\n    CHAPTER II       A MAYOR\n\n';
const wrap = (inner) =>
  'Markdown Content:\nThe Project Gutenberg eBook of Something\n\n' +
  '*** START OF THE PROJECT GUTENBERG EBOOK SOMETHING ***\n' + inner +
  '*** END OF THE PROJECT GUTENBERG EBOOK SOMETHING ***\nLicense boilerplate.\n';

// Contents at the front: skip past it to the real Chapter I.
const front = cleanGutenbergPayload(wrap(contents + '\nCHAPTER I\n\nA SMALL TOWN\n\n' + body));
assert.ok(front.startsWith('CHAPTER I\n\nA SMALL TOWN'), 'front contents not skipped');
assert.ok(!front.includes('CHAPTER II       A MAYOR'), 'front contents left in');

// Contents at the end (The Red and the Black): keep the book, don't slice to it.
const back = cleanGutenbergPayload(wrap('CHAPTER I\n\nA SMALL TOWN\n\n' + body + contents));
assert.ok(back.startsWith('CHAPTER I\n\nA SMALL TOWN'), 'book starts in the wrong place');
assert.ok(back.length > body.length, 'trailing contents ate the book');

// Boilerplate is gone either way.
[front, back].forEach((t) => assert.ok(!t.includes('License boilerplate'), 'license left in'));

console.log('ok — cleanGutenbergPayload handles contents at the front and at the end');
