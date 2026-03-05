/**
 * Orbit — Unit Tests
 * Tests the two pure-logic modules: tax engine and intent detector.
 * Run with: npm test
 */

const { calcNigerianTax, formatTaxResult, parseCurrency } = require('../src/logic/taxEngine');
const { detectIntent, INTENTS } = require('../src/engine/intentDetector');

// ── Tax Engine ───────────────────────────────────────────────────────────────

describe('parseCurrency', () => {
  test('parses "350k" → 350000',    () => expect(parseCurrency('350k')).toBe(350000));
  test('parses "1.2m" → 1200000',   () => expect(parseCurrency('1.2m')).toBe(1200000));
  test('parses "₦200,000" → 200000', () => expect(parseCurrency('₦200,000')).toBe(200000));
  test('parses "77000" → 77000',    () => expect(parseCurrency('77000')).toBe(77000));
  test('returns null for empty',    () => expect(parseCurrency('')).toBeNull());
  test('returns null for "abc"',    () => expect(parseCurrency('abc')).toBeNull());
});

describe('calcNigerianTax', () => {
  test('NYSC corper is exempt', () => {
    const result = calcNigerianTax(77000 * 12, 'corper');
    expect(result.exempt).toBe(true);
    expect(result.tax).toBe(0);
  });

  test('zero income returns zero tax', () => {
    const result = calcNigerianTax(0, 'salary');
    expect(result.tax).toBe(0);
  });

  test('salary earner has pension and NHF deductions', () => {
    const result = calcNigerianTax(1_200_000, 'salary');
    expect(result.pension).toBeGreaterThan(0);
    expect(result.nhf).toBeGreaterThan(0);
    expect(result.cra).toBeGreaterThan(0);
  });

  test('freelancer has no pension or NHF', () => {
    const result = calcNigerianTax(1_200_000, 'freelancer');
    expect(result.pension).toBe(0);
    expect(result.nhf).toBe(0);
  });

  test('CRA is computed correctly for ₦1,200,000 annual', () => {
    const gross = 1_200_000;
    const expected = Math.max(200_000, gross * 0.01) + gross * 0.20;
    const result = calcNigerianTax(gross, 'salary');
    expect(result.cra).toBeCloseTo(expected, 0);
  });

  test('minimum tax applied when computed tax < 1% of gross', () => {
    // Very low income — computed tax will be below 1% of gross
    const result = calcNigerianTax(100_000, 'salary');
    const minTax = 100_000 * 0.01;
    expect(result.tax).toBeGreaterThanOrEqual(minTax);
  });

  test('effective rate is a percentage between 0 and 100', () => {
    const result = calcNigerianTax(3_600_000, 'salary');
    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeLessThan(100);
  });

  test('net monthly is less than gross monthly', () => {
    const gross = 300_000;
    const result = calcNigerianTax(gross * 12, 'salary');
    expect(result.netMonthly).toBeLessThan(gross);
    expect(result.netMonthly).toBeGreaterThan(0);
  });

  test('breakdown contains statute references', () => {
    const result = calcNigerianTax(5_000_000, 'salary');
    expect(result.breakdown.length).toBeGreaterThan(0);
    result.breakdown.forEach((b) => {
      expect(b.statute).toMatch(/PITA S\.37/);
    });
  });

  test('all 6 bands populated for high income (₦5m annual)', () => {
    const result = calcNigerianTax(5_000_000, 'salary');
    expect(result.breakdown.length).toBe(6);
  });
});

describe('formatTaxResult', () => {
  test('formats exempt result without breakdown', () => {
    const result = calcNigerianTax(77_000 * 12, 'corper');
    const formatted = formatTaxResult(result, 77_000);
    expect(formatted).toContain('Tax Exempt');
    expect(formatted).toContain('NYSC');
  });

  test('formatted output contains monthly tax figure', () => {
    const gross = 350_000;
    const result = calcNigerianTax(gross * 12, 'salary');
    const formatted = formatTaxResult(result, gross);
    expect(formatted).toContain('Monthly tax');
    expect(formatted).toContain('₦');
  });
});

// ── Intent Detector ──────────────────────────────────────────────────────────

describe('detectIntent', () => {
  const cases = [
    ['calculate tax',        INTENTS.CALCULATE_TAX],
    ['what is my paye',      INTENTS.CALCULATE_TAX],
    ['my tax breakdown',     INTENTS.CALCULATE_TAX],
    ['link account',         INTENTS.ACCOUNT_LINK],
    ['ORBIT-A1B2C3',         INTENTS.ACCOUNT_LINK],
    ['check in',             INTENTS.RING_CHECKIN],
    ['show my rings',        INTENTS.RING_CHECKIN],
    ['how am i doing',       INTENTS.RING_CHECKIN],
    ['leaderboard',          INTENTS.LEADERBOARD],
    ['show rankings',        INTENTS.LEADERBOARD],
    ['who is winning',       INTENTS.LEADERBOARD],
    ['help',                 INTENTS.HELP],
    ['cancel',               INTENTS.CANCEL],
    ['stop',                 INTENTS.CANCEL],
    ['random gibberish xyz', INTENTS.UNKNOWN],
    ['',                     INTENTS.UNKNOWN],
  ];

  cases.forEach(([input, expected]) => {
    test(`"${input}" → ${expected}`, () => {
      const { intent } = detectIntent(input);
      expect(intent).toBe(expected);
    });
  });

  test('high confidence for known intents', () => {
    expect(detectIntent('tax').confidence).toBe('high');
  });

  test('low confidence for unknown input', () => {
    expect(detectIntent('xyzzy').confidence).toBe('low');
  });
});
