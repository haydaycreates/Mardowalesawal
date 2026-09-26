import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const questions = JSON.parse(readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'));
const byId = Object.fromEntries(questions.map(q => [q.id, q]));

function close(actual, expected, tolerance = 1e-7) {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`);
}

function integrate(f, a, b, n = 4000) {
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * f(a + i * h);
  return sum * h / 3;
}

function derivative(f, x) {
  const h = 1e-5;
  return (f(x + h) - f(x - h)) / (2 * h);
}

test('q3: symmetric definite integral evaluates to pi squared / 16', () => {
  assert.ok(byId.q3.solution.includes(String.raw`\boxed{I=\frac{\pi^2}{16}}`));
  close(integrate(x => x * Math.sin(x) * Math.cos(x) / (Math.sin(x) ** 4 + Math.cos(x) ** 4), 0, Math.PI / 2), Math.PI ** 2 / 16);
});

test('q4 and q5: differentiating the final antiderivatives recovers the integrands', () => {
  assert.ok(byId.q4.solution.includes(String.raw`\boxed{I=-\frac{1}{4x}+\frac78\tan^{-1}\left(\frac{x}{2}\right)+C}`));
  for (const x of [-3, -1, 0.5, 2, 5]) {
    close(derivative(t => -1 / (4 * t) + 7 / 8 * Math.atan(t / 2), x), (2 * x * x + 1) / (x * x * (x * x + 4)));
  }
  assert.ok(byId.q5.solution.includes(String.raw`\boxed{I=\frac{x}{\log x}+C}`));
  for (const x of [1.5, 2, 3, 10]) {
    close(derivative(t => t / Math.log(t), x), 1 / Math.log(x) - 1 / Math.log(x) ** 2);
  }
});

test('q6, q7 and q8: positive areas agree with the displayed exact answers', () => {
  assert.ok(byId.q6.solution.includes(String.raw`\boxed{A=\frac{\pi}{3}\text{ square units}}`));
  close(integrate(x => Math.sqrt(4 - x * x) - Math.sqrt(3) * x, 0, 1), Math.PI / 3);
  assert.ok(byId.q7.solution.includes(String.raw`\frac{343}{3}\text{ square units}`));
  close(integrate(x => 1.5 * x + 4, -8 / 3, 2) + integrate(x => 7.5 - x / 4, 2, 30), 343 / 3);
  assert.ok(byId.q8.solution.includes(String.raw`\boxed{A=20-10\sqrt{3}\text{ square units}}`));
  close(integrate(x => 20 * Math.abs(Math.cos(2 * x)), Math.PI / 6, Math.PI / 3), 20 - 10 * Math.sqrt(3));
});

test('q9: implicit solution satisfies the ODE on both sides of the initial point', () => {
  assert.ok(byId.q9.solution.includes(String.raw`\boxed{x^2=2y^2\log y,\quad y>0}`));
  // Solve the monotone implicit relation for its unique y >= 1 branch.
  function yAt(x) {
    let lo = 1, hi = 2 + Math.abs(x);
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (2 * mid * mid * Math.log(mid) < x * x) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }
  close(yAt(0), 1);
  for (const x of [-3, -1, 0, 1, 3]) {
    const y = yAt(x);
    close(derivative(yAt, x), x * y / (x * x + y * y));
  }
});

test('q10: explicit solution satisfies the linear ODE and initial condition', () => {
  assert.ok(byId.q10.solution.includes(String.raw`\boxed{y=\frac{\tan^{-1}x-\pi/4}{1+x^2}}`));
  const yAt = x => (Math.atan(x) - Math.PI / 4) / (1 + x * x);
  close(yAt(1), 0);
  for (const x of [-3, -1, 0, 1, 3]) {
    close((1 + x * x) * derivative(yAt, x) + 2 * x * yAt(x), 1 / (1 + x * x));
  }
});
