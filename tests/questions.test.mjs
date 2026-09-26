import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import katex from 'katex';
import { chapters, filterQuestions } from '../src/utils/questions.ts';

const questions = JSON.parse(readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'));

test('all chapters includes 28 questions, with each topic filtered separately', () => {
  assert.equal(questions.length, 28);
  assert.deepEqual(filterQuestions(questions, 'All Chapters', ''), questions);
  assert.deepEqual(filterQuestions(questions, 'Calculus', ''), questions.slice(0, 18));
  assert.deepEqual(filterQuestions(questions, 'Matrices & Determinants', ''), questions.slice(18, 22));
  assert.deepEqual(filterQuestions(questions, 'Probability', ''), questions.slice(22, 24));
  assert.deepEqual(filterQuestions(questions, 'Relations & Functions', ''), questions.slice(24, 26));
  assert.deepEqual(filterQuestions(questions, 'Vectors & 3D', ''), questions.slice(26, 28));
});

test('all chapter groups match their individual CBSE chapters', () => {
  const individualChapters = ['Relations and Functions', 'Determinants', 'Differential Equations', 'Vector Algebra', 'Probability', 'Linear Programming'];
  individualChapters.forEach((chapter, index) => {
    const question = { ...questions[0], chapter };
    assert.deepEqual(filterQuestions([question], chapters[index + 1], ''), [question]);
  });
});

test('search matches question text, metadata and optional tags, ignoring case and extra whitespace', () => {
  // Keep search behavior tests independent of additions to the question bank.
  const questions = JSON.parse(readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8')).slice(0, 2);
  assert.deepEqual(filterQuestions(questions, 'All Chapters', '  RECTANGLE  '), [questions[1]]);
  assert.deepEqual(filterQuestions(questions, 'Calculus', 'CBSE 2023'), [questions[0]]);
  assert.deepEqual(filterQuestions(questions, 'All Chapters', '6 marks'), [questions[0]]);
  assert.deepEqual(filterQuestions(questions, 'Probability', 'rectangle'), []);
  const tagged = [{ ...questions[0], tags: ['symmetry'] }];
  assert.deepEqual(filterQuestions(tagged, 'All Chapters', 'symmetry'), tagged);
  assert.deepEqual(filterQuestions(questions, 'All Chapters', 'no-such-question'), []);
  assert.deepEqual(filterQuestions(questions, 'All Chapters', '   '), questions);
});

test('data has unique IDs, the required schema and valid KaTeX in every field', () => {
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
  let expressions = 0;
  for (const question of questions) {
    for (const key of ['id', 'chapter', 'year', 'question', 'hint', 'solution']) {
      assert.equal(typeof question[key], 'string');
      assert.ok(question[key].length > 0);
    }
    assert.ok(Number.isInteger(question.marks) && question.marks > 0);
    for (const key of ['question', 'hint', 'solution']) {
      assert.doesNotMatch(question[key], /[\u0000-\u0009\u000b-\u001f]/, `${question.id}: accidental JSON escape in ${key}`);
      const mathParts = question[key].split('$');
      assert.equal(mathParts.length % 2, 1, `${question.id}: unmatched math delimiter in ${key}`);
      for (const [, math] of question[key].matchAll(/\$([^$]+)\$/g)) {
        assert.match(katex.renderToString(math, { throwOnError: true }), /class="katex"/);
        expressions++;
      }
    }
  }
  assert.ok(expressions > 20);
});

test('q3–q10 cover the original calculus chapters and have numbered solution steps', () => {
  const added = questions.slice(2, 10);
  assert.deepEqual(added.map(q => q.id), ['q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10']);
  const counts = Object.fromEntries(['Integrals', 'Application of Integrals', 'Differential Equations'].map(chapter => [chapter, added.filter(q => q.chapter === chapter).length]));
  assert.deepEqual(counts, { Integrals: 3, 'Application of Integrals': 3, 'Differential Equations': 2 });
  for (const question of added) {
    assert.match(question.year, /CBSE.*Q\d+/);
    assert.match(question.solution, /^1\. /);
    assert.ok(question.solution.includes('\n\n2. '));
    assert.ok(question.solution.includes('\\boxed{'));
  }
});

test('q11–q22 add four questions per requested topic without changing the schema', () => {
  const added = questions.slice(10, 22);
  assert.deepEqual(added.map(q => q.id), Array.from({ length: 12 }, (_, i) => `q${i + 11}`));
  assert.equal(added.filter(q => q.chapter === 'Continuity and Differentiability').length, 4);
  assert.equal(added.filter(q => q.chapter === 'Applications of Derivatives').length, 4);
  assert.equal(added.filter(q => ['Matrices', 'Determinants'].includes(q.chapter)).length, 4);
  const keys = ['id', 'chapter', 'year', 'marks', 'question', 'hint', 'solution'].sort();
  for (const question of added) {
    assert.deepEqual(Object.keys(question).sort(), keys);
    assert.match(question.year, /CBSE.*Q\d+/);
    assert.match(question.solution, /^1\. /);
    assert.ok(question.solution.includes('\n\n2. '));
    assert.ok(question.solution.includes('\\boxed{'));
    assert.ok(question.hint.length > 40);
  }
});

test('q23–q28 add two source-labelled questions per requested topic', () => {
  const added = questions.slice(22);
  assert.deepEqual(added.map(q => q.id), ['q23', 'q24', 'q25', 'q26', 'q27', 'q28']);
  for (const chapter of ['Probability', 'Relations and Functions', 'Three Dimensional Geometry']) {
    assert.equal(added.filter(q => q.chapter === chapter).length, 2);
  }
  for (const question of added) {
    assert.deepEqual(Object.keys(question).sort(), ['id', 'chapter', 'year', 'marks', 'question', 'hint', 'solution'].sort());
    assert.match(question.year, /CBSE.*Official SQP.*Q\d+/);
    assert.ok([4, 5].includes(question.marks));
    assert.match(question.solution, /^1\. /);
    assert.ok(question.solution.includes('\n\n2. '));
    assert.ok(question.solution.includes('\\boxed{'));
    assert.ok(question.hint.length > 40);
  }
});
