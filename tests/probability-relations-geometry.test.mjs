import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const questions = JSON.parse(readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'));
const byId = Object.fromEntries(questions.map(q => [q.id, q]));
const close = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} differs from ${b}`);
const contains = (id, text) => assert.ok(byId[id].solution.includes(text), `${id}: missing checked result ${text}`);
const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
const sub = (a, b) => a.map((v, i) => v - b[i]);
const norm = a => Math.sqrt(dot(a, a));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const pairs = array => array.flatMap((value, i) => array.slice(i + 1).map(other => [value, other]));

test('q23: enumerate all 420 equally likely labelled two-stage bird transfers', () => {
  const cage1 = ['owl', 'a', 'b', 'c', 'd', 'e'];
  const cage2 = ['f', 'g', 'h', 'i', 'j', 'k'];
  let total = 0, endsInCage1 = 0, movedAndReturned = 0;
  for (const outgoing of pairs(cage1)) {
    const remaining = cage1.filter(bird => !outgoing.includes(bird));
    for (const returning of pairs([...cage2, ...outgoing])) {
      total++;
      if ([...remaining, ...returning].includes('owl')) {
        endsInCage1++;
        if (outgoing.includes('owl')) movedAndReturned++;
      }
    }
  }
  assert.equal(total, 420);
  assert.equal(endsInCage1, 315);
  assert.equal(movedAndReturned, 35);
  close(endsInCage1 / total, 3 / 4);
  close(movedAndReturned / endsInCage1, 1 / 9);
  contains('q23', String.raw`\boxed{P(A)=\frac34}`);
  contains('q23', String.raw`\boxed{P(E_1\mid A)=\frac19}`);
});

test('q24: employee-error branches yield correct joint, total and posterior probabilities', () => {
  const [jayant, sonia, oliver] = [0.5 * 0.06, 0.2 * 0.04, 0.3 * 0.03];
  const total = jayant + sonia + oliver;
  close(sonia, 1 / 125);
  close(total, 47 / 1000);
  close((sonia + oliver) / total, 17 / 47);
  close(jayant / total + sonia / total + oliver / total, 1);
  contains('q24', String.raw`\boxed{P(S\cap E)=\frac1{125}=0.008}`);
  contains('q24', String.raw`\boxed{P(E)=0.047=\frac{47}{1000}}`);
  contains('q24', String.raw`\frac{17}{47}`);
});

test('q25: cross-multiplication relation and the stated equivalence class agree on samples', () => {
  const domain = Array.from({ length: 6 }, (_, i) => i + 1);
  const points = domain.flatMap(a => domain.map(b => [a, b]));
  const related = ([a, b], [c, d]) => a * d === b * c;
  for (const a of points) {
    assert.ok(related(a, a));
    for (const b of points) {
      assert.equal(related(a, b), related(b, a));
      if (related(a, b)) {
        for (const c of points) if (related(b, c)) assert.ok(related(a, c));
      }
    }
    assert.equal(related(a, [2, 6]), a[1] === 3 * a[0]);
  }
  for (const n of [1, 2, 5, 50, 500]) assert.ok(related([n, 3 * n], [2, 6]));
  contains('q25', String.raw`\boxed{[(2,6)]=\{(n,3n):n\in\mathbb{N}\}}`);
});

test('q26: inverse compositions work on both absolute-value branches and at zero', () => {
  const f = x => x / (1 + Math.abs(x));
  const inverse = y => y / (1 - Math.abs(y));
  for (const x of [-100, -3, -0.1, 0, 0.1, 3, 100]) {
    assert.ok(Math.abs(f(x)) < 1);
    close(inverse(f(x)), x);
  }
  for (const y of [-0.9999, -0.75, -0.1, 0, 0.1, 0.75, 0.9999]) close(f(inverse(y)), y);
  contains('q26', String.raw`\boxed{f\text{ is bijective}}`);
  contains('q26', String.raw`f^{-1}(y)=\frac{y}{1-|y|}`);
});

test('q27: scalar triple product and common perpendicular give the same shortest distance', () => {
  const a1 = [-1, -1, -1], a2 = [3, 5, 7], b1 = [7, -6, 1], b2 = [1, -2, 1];
  const normal = cross(b1, b2), displacement = sub(a2, a1);
  assert.deepEqual(normal, [-4, -6, -8]);
  assert.equal(dot(displacement, normal), -116);
  assert.equal(dot(displacement, b1), 0);
  assert.equal(dot(displacement, b2), 0);
  close(Math.abs(dot(displacement, normal)) / norm(normal), 2 * Math.sqrt(29));
  close(norm(displacement), 2 * Math.sqrt(29));
  // Nearby points cannot shorten the common perpendicular.
  for (const lambda of [-2, -1, 0, 1, 2]) for (const mu of [-2, -1, 0, 1, 2]) {
    const p = a1.map((v, i) => v + lambda * b1[i]);
    const q = a2.map((v, i) => v + mu * b2[i]);
    assert.ok(norm(sub(q, p)) >= norm(displacement) - 1e-10);
  }
  contains('q27', String.raw`\boxed{2\sqrt{29}\text{ units}}`);
});

test('q28: projection foot, image, midpoint and joining line are consistent', () => {
  const p = [1, 2, 1], a = [3, -1, 1], b = [1, 2, 3];
  const t = dot(sub(p, a), b) / dot(b, b);
  close(t, 2 / 7);
  const h = a.map((v, i) => v + t * b[i]);
  h.forEach((v, i) => close(v, [23 / 7, -3 / 7, 13 / 7][i]));
  close(dot(sub(h, p), b), 0);
  const q = h.map((v, i) => 2 * v - p[i]);
  q.forEach((v, i) => close(v, [39 / 7, -20 / 7, 19 / 7][i]));
  const joiningDirection = [16, -17, 6];
  close(norm(cross(sub(q, p), joiningDirection)), 0);
  close(dot(joiningDirection, b), 0);
  close(norm(sub(q, h)), norm(sub(p, h)));
  contains('q28', String.raw`Q=\left(\frac{39}{7},-\frac{20}{7},\frac{19}{7}\right)`);
  contains('q28', String.raw`\boxed{\frac{x-1}{16}=\frac{y-2}{-17}=\frac{z-1}{6}}`);
});
