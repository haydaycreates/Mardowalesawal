import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const questions = JSON.parse(readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'));
const byId = Object.fromEntries(questions.map(q => [q.id, q]));
const close = (a, b, tolerance = 1e-7) => assert.ok(Math.abs(a - b) < tolerance, `${a} differs from ${b}`);
const derivative = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
function contains(id, expression) {
  assert.ok(byId[id].solution.includes(expression), `${id} does not contain checked expression ${expression}`);
}

const transpose = a => a[0].map((_, j) => a.map(row => row[j]));
const multiply = (a, b) => a.map(row => transpose(b).map(col => row.reduce((sum, v, i) => sum + v * col[i], 0)));
function det(a) {
  if (a.length === 1) return a[0][0];
  return a[0].reduce((sum, v, j) => sum + (-1) ** j * v * det(a.slice(1).map(row => row.filter((_, k) => k !== j))), 0);
}
const cofactor = a => a.map((row, i) => row.map((_, j) => (-1) ** (i + j) * det(a.filter((_, r) => r !== i).map(row => row.filter((_, c) => c !== j)))));

// Read integer matrices directly from the stored LaTeX, including their row separators.
function integerMatrices(text) {
  return [...text.matchAll(/\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g)]
    .map(([, body]) => body.split('\\\\').map(row => row.split('&').map(cell => cell.trim())))
    .filter(matrix => matrix.every(row => row.every(cell => /^-?\d+$/.test(cell))))
    .map(matrix => matrix.map(row => row.map(Number)));
}

test('q11: both one-sided limits equal the specified continuous value', () => {
  contains('q11', String.raw`\boxed{k=6}`);
  assert.equal(2 * 2 + 2, 6);
  assert.equal(3 * 2, 6);
  close(2 * (2 - 1e-9) + 2, 6);
  close(3 * (2 + 1e-9), 6);
});

test('q12–q14: logarithmic and second derivative formulas are consistent', () => {
  contains('q12', String.raw`\frac{dy}{dx}=(\cos x)^x[\log(\cos x)-x\tan x]`);
  for (const x of [0.1, 0.4, 0.9, 1.3]) {
    const f = t => Math.cos(t) ** t;
    close(derivative(f, x), f(x) * (Math.log(Math.cos(x)) - x * Math.tan(x)));
  }
  contains('q13', String.raw`f^{\prime\prime}(x)=6|x|`);
  for (const x of [-3, -0.1, 0.1, 3]) {
    close(derivative(t => Math.abs(t) ** 3, x), 3 * x * Math.abs(x));
    close(derivative(t => 3 * t * Math.abs(t), x), 6 * Math.abs(x));
  }
  for (const h of [-1e-9, 1e-9]) {
    close(Math.abs(h) ** 3 / h, 0);
    close(3 * h * Math.abs(h) / h, 0);
  }
  contains('q14', String.raw`\frac{y\tan x+\log(\cos y)}{x\tan y+\log(\cos x)}`);
  const relation = (x, y) => y * Math.log(Math.cos(x)) - x * Math.log(Math.cos(y));
  for (const [x, y] of [[0.3, 0.7], [0.5, 0.5], [0.8, 0.4]]) {
    const fx = derivative(t => relation(t, y), x);
    const fy = derivative(t => relation(x, t), y);
    close(-fx / fy, (y * Math.tan(x) + Math.log(Math.cos(y))) / (x * Math.tan(y) + Math.log(Math.cos(x))));
  }
});

test('q15: factored derivative and increasing intervals match the polynomial', () => {
  contains('q15', String.raw`4x(x-1)(x-2)`);
  contains('q15', String.raw`\boxed{(0,1)\text{ and }(2,\infty)}`);
  const f = x => x ** 4 - 4 * x ** 3 + 4 * x ** 2 + 15;
  const df = x => 4 * x * (x - 1) * (x - 2);
  for (const [x, sign] of [[-1, -1], [0.5, 1], [1.5, -1], [3, 1]]) {
    close(derivative(f, x), df(x));
    assert.equal(Math.sign(df(x)), sign);
  }
});

test('q16–q18: related rates, decreasing growth rate and physical box maximum', () => {
  contains('q16', String.raw`\boxed{160\text{ cm/s}}`);
  close(derivative(t => Math.sqrt((4 + 2 * t) ** 2 + 9), 0) * 100, 160);
  contains('q17', String.raw`-\frac{1}{12t\sqrt{t}}`);
  for (const t of [6, 10, 17]) {
    close(derivative(x => Math.sqrt(x) / 3, t), 1 / (6 * Math.sqrt(t)));
    close(derivative(x => 1 / (6 * Math.sqrt(x)), t), -1 / (12 * t * Math.sqrt(t)));
  }
  contains('q18', String.raw`\boxed{x=5\text{ cm}}`);
  contains('q18', String.raw`1000-260x+12x^2`);
  const volume = x => x * (25 - 2 * x) * (40 - 2 * x);
  assert.equal(volume(5), 2250);
  close(derivative(volume, 5), 0);
  assert.ok(50 / 3 > 25 / 2); // Reject the non-physical critical point.
  for (let i = 0; i <= 100; i++) assert.ok(volume(i / 8) <= volume(5));
});

test('q19: stored cofactor, adjoint, inverse and solution vector are correct', () => {
  const [a] = integerMatrices(byId.q19.question);
  const [c, adj, inverseNumerator, b, answer] = integerMatrices(byId.q19.solution);
  assert.equal(det(a), -5);
  assert.deepEqual(c, cofactor(a));
  assert.deepEqual(adj, transpose(c));
  assert.deepEqual(multiply(a, inverseNumerator), [[5, 0, 0], [0, 5, 0], [0, 0, 5]]);
  assert.deepEqual(answer, [[400], [300], [200]]);
  assert.deepEqual(multiply(a, answer), b);
  contains('q19', String.raw`A^{-1}=\frac15`);
});

test('q20: matrix-model coefficients fit all three football-path points', () => {
  const [m, b, c, adj] = integerMatrices(byId.q20.solution);
  assert.equal(det(m), -240);
  assert.deepEqual(c, cofactor(m));
  assert.deepEqual(adj, transpose(c));
  assert.deepEqual(multiply(m, adj), [[-240, 0, 0], [0, -240, 0], [0, 0, -240]]);
  const solution = multiply(adj, b).map(row => row.map(v => v / -240));
  assert.deepEqual(solution, [[-0.5], [8], [1]]);
  assert.deepEqual(multiply(m, solution), b);
  contains('q20', String.raw`y=-\frac12x^2+8x+1`);
  for (const [x, y] of [[2, 15], [4, 25], [14, 15]]) close(-0.5 * x * x + 8 * x + 1, y);
});

test('q21–q22: adjoint scaling and odd-order skew-symmetric determinant identities', () => {
  contains('q21', String.raw`(-16)^2=256=2^8`);
  const a = [[1, 0, 0], [0, 1, 0], [0, 0, -2]];
  assert.equal(det(transpose(cofactor(a.map(row => row.map(v => 2 * v))))), 256);
  contains('q22', String.raw`\boxed{\det A=0}`);
  for (const x of [0.1, 0.5, 1, 5, 20]) {
    const matrix = [[0, 2 * x - 1, Math.sqrt(x)], [1 - 2 * x, 0, 2 * Math.sqrt(x)], [-Math.sqrt(x), -2 * Math.sqrt(x), 0]];
    matrix.forEach((row, i) => row.forEach((v, j) => close(v, -matrix[j][i])));
    close(det(matrix), 0);
  }
});
