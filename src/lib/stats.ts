// Statistics engine for the administrator/researcher dashboard.
//
// Implements, from first principles (no external stats dependency):
//   - descriptive statistics (mean, sample standard deviation)
//   - Pearson product-moment correlation
//   - ordinary least squares multiple linear regression, with standard
//     errors, t-statistics, two-tailed p-values (via the regularized
//     incomplete beta function) and R^2 / adjusted R^2.
//
// This mirrors, in code, the multiple linear regression procedure the
// research methodology (Chapter Three) describes as being run in SPSS —
// it lets the administrator dashboard demonstrate the same analysis live
// against actual submitted responses. For the thesis itself, the
// authoritative statistical analysis remains the SPSS output reported in
// Chapter Four; this module is a teaching/demo-grade re-implementation.

export function mean(values: number[]): number {
  if (values.length === 0) return NaN;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function sampleStdDev(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (n - 1);
  return Math.sqrt(variance);
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n < 2) return NaN;
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  if (denom === 0) return 0;
  return num / denom;
}

// ---- Gamma / incomplete beta machinery (Numerical Recipes style) ----

function logGamma(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betacf(x: number, a: number, b: number): number {
  const MAXIT = 200;
  const EPS = 3e-9;
  const FPMIN = 1e-30;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    logGamma(a + b) -
      logGamma(a) -
      logGamma(b) +
      a * Math.log(x) +
      b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(x, a, b)) / a;
  }
  return 1 - (bt * betacf(1 - x, b, a)) / b;
}

/** Two-tailed p-value for a t-statistic with `df` degrees of freedom. */
export function tTestTwoTailedPValue(t: number, df: number): number {
  if (!isFinite(t) || df <= 0) return NaN;
  const x = df / (df + t * t);
  return regularizedIncompleteBeta(x, df / 2, 0.5);
}

// ---- Small dense matrix helpers (arrays of arrays) ----

type Matrix = number[][];

function transpose(m: Matrix): Matrix {
  const rows = m.length;
  const cols = m[0].length;
  const out: Matrix = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) out[j][i] = m[i][j];
  }
  return out;
}

function multiply(a: Matrix, b: Matrix): Matrix {
  const rows = a.length;
  const inner = b.length;
  const cols = b[0].length;
  const out: Matrix = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let k = 0; k < inner; k++) {
      const aik = a[i][k];
      if (aik === 0) continue;
      for (let j = 0; j < cols; j++) {
        out[i][j] += aik * b[k][j];
      }
    }
  }
  return out;
}

/** Gauss-Jordan inversion with partial pivoting. Throws if singular. */
function invert(matrix: Matrix): Matrix {
  const n = matrix.length;
  const aug: Matrix = matrix.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let maxVal = Math.abs(aug[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > maxVal) {
        maxVal = Math.abs(aug[r][col]);
        pivotRow = r;
      }
    }
    if (maxVal < 1e-10) {
      throw new Error(
        "Design matrix is singular or near-singular (predictors may be collinear or the sample too small)."
      );
    }
    if (pivotRow !== col) {
      [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];
    }
    const pivot = aug[col][col];
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = aug[r][col];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * n; j++) aug[r][j] -= factor * aug[col][j];
    }
  }

  return aug.map((row) => row.slice(n));
}

export interface RegressionPredictor {
  name: string;
  coefficient: number;
  standardError: number;
  tStat: number;
  pValue: number;
  significant: boolean;
}

export interface RegressionResult {
  n: number;
  k: number; // number of predictors, excluding intercept
  df: number;
  intercept: RegressionPredictor;
  predictors: RegressionPredictor[];
  rSquared: number;
  adjustedRSquared: number;
  fStat: number;
  fPValue: number;
}

/**
 * Ordinary least squares multiple linear regression.
 * `predictors` maps predictor name -> array of values (same length as `y`).
 */
export function multipleLinearRegression(
  y: number[],
  predictors: Record<string, number[]>
): RegressionResult {
  const n = y.length;
  const names = Object.keys(predictors);
  const k = names.length;
  const df = n - k - 1;
  if (df < 1) {
    throw new Error(
      `Not enough data for regression: need at least ${k + 2} observations, have ${n}.`
    );
  }

  // Design matrix X: n x (k+1), first column is the intercept.
  const X: Matrix = Array.from({ length: n }, (_, i) => [
    1,
    ...names.map((name) => predictors[name][i]),
  ]);
  const Y: Matrix = y.map((v) => [v]);

  const Xt = transpose(X);
  const XtX = multiply(Xt, X);
  const XtXInv = invert(XtX);
  const XtY = multiply(Xt, Y);
  const betaMatrix = multiply(XtXInv, XtY);
  const beta = betaMatrix.map((row) => row[0]);

  const fitted = multiply(X, betaMatrix).map((row) => row[0]);
  const residuals = y.map((yi, i) => yi - fitted[i]);
  const sse = residuals.reduce((s, r) => s + r * r, 0);
  const yMean = mean(y);
  const sst = y.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
  const rSquared = sst === 0 ? 0 : 1 - sse / sst;
  const adjustedRSquared =
    n - k - 1 > 0 ? 1 - (1 - rSquared) * (n - 1) / (n - k - 1) : rSquared;

  const mse = sse / df;
  const coeffVar = XtXInv.map((row, i) => row[i] * mse);
  const standardErrors = coeffVar.map((v) => Math.sqrt(Math.max(v, 0)));

  const toPredictor = (name: string, idx: number): RegressionPredictor => {
    const se = standardErrors[idx];
    const t = se === 0 ? 0 : beta[idx] / se;
    const p = se === 0 ? NaN : tTestTwoTailedPValue(t, df);
    return {
      name,
      coefficient: beta[idx],
      standardError: se,
      tStat: t,
      pValue: p,
      significant: !isNaN(p) && p < 0.05,
    };
  };

  const intercept = toPredictor("Intercept", 0);
  const predictorResults = names.map((name, idx) => toPredictor(name, idx + 1));

  const msr = k > 0 ? (sst - sse) / k : 0;
  const fStat = mse === 0 ? 0 : msr / mse;
  // F-distribution upper-tail p-value P(F > fStat), via the incomplete beta
  // relationship to F: if x = k*F/(k*F+df), then P(F <= fStat) = I_x(k/2, df/2),
  // so the (upper-tail) p-value is its complement, 1 - I_x(k/2, df/2).
  const fPValue =
    k > 0 && df > 0
      ? 1 -
        regularizedIncompleteBeta(
          (k * fStat) / (k * fStat + df),
          k / 2,
          df / 2
        )
      : NaN;

  return {
    n,
    k,
    df,
    intercept,
    predictors: predictorResults,
    rSquared,
    adjustedRSquared,
    fStat,
    fPValue,
  };
}
