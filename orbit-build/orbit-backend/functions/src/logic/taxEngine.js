/**
 * Orbit Tax Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Statutory basis:
 *   • Personal Income Tax Act (PITA) Cap P8 LFN 2004, as amended
 *     by Finance Acts 2019 & 2020
 *   • Pension Reform Act (PRA) 2014 S.9(1)(b) — 8% employee contribution
 *   • National Housing Fund Act (NHF) Cap N45 LFN 2004 S.4 — 2.5% of basic
 *
 * This module is intentionally a pure-function mirror of the frontend tax
 * logic so results are identical whether calculated in-app or via the engine.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** PITA S.37(1)(a-f) graduated rate bands */
const TAX_BANDS = [
  { limit: 300_000,    rate: 0.07, label: 'First ₦300,000',    statute: 'PITA S.37(1)(a)' },
  { limit: 300_000,    rate: 0.11, label: 'Next ₦300,000',     statute: 'PITA S.37(1)(b)' },
  { limit: 500_000,    rate: 0.15, label: 'Next ₦500,000',     statute: 'PITA S.37(1)(c)' },
  { limit: 500_000,    rate: 0.19, label: 'Next ₦500,000',     statute: 'PITA S.37(1)(d)' },
  { limit: 1_600_000,  rate: 0.21, label: 'Next ₦1,600,000',   statute: 'PITA S.37(1)(e)' },
  { limit: Infinity,   rate: 0.24, label: 'Above ₦3,200,000',  statute: 'PITA S.37(1)(f)' },
];

/**
 * Calculates Nigerian PAYE for a given annual gross income.
 *
 * @param {number} annualGross   - Annual gross income in Naira
 * @param {string} employmentType - 'salary' | 'business' | 'corper' | 'freelancer' | 'student' | 'homemaker'
 * @returns {TaxResult}
 *
 * @typedef {Object} TaxResult
 * @property {number}   tax            - Total annual tax payable
 * @property {number}   monthly        - Monthly tax to set aside
 * @property {number}   effectiveRate  - Effective tax rate (percentage)
 * @property {Array}    breakdown      - Per-band breakdown with statute references
 * @property {number}   netAnnual      - Net annual income after tax + deductions
 * @property {number}   netMonthly     - Net monthly income
 * @property {number}   taxableIncome  - Income subject to tax after reliefs
 * @property {number}   cra            - Consolidated Relief Allowance (PITA S.33)
 * @property {number}   pension        - Pension deduction (PRA 2014 S.9)
 * @property {number}   nhf            - NHF deduction (NHF Act S.4)
 * @property {boolean}  exempt         - True if income is exempt (NYSC allawee)
 * @property {boolean}  usedMinTax     - True if minimum tax rule was applied
 */
function calcNigerianTax(annualGross, employmentType = 'salary') {
  const empty = {
    tax: 0, monthly: 0, effectiveRate: 0, breakdown: [],
    netAnnual: annualGross, netMonthly: annualGross / 12,
    taxableIncome: 0, cra: 0, pension: 0, nhf: 0,
  };

  if (!annualGross || annualGross <= 0) return empty;

  // NYSC allawee: government stipend, not employment income — FIRS position
  if (employmentType === 'corper') {
    return { ...empty, exempt: true };
  }

  // ── Reliefs ─────────────────────────────────────────────────────────────
  // CRA = max(₦200,000, 1% of gross) + 20% of gross  [PITA S.33(1)]
  const cra = Math.max(200_000, annualGross * 0.01) + annualGross * 0.20;

  // Pension: 8% for formal employment  [PRA 2014 S.9(1)(b)]
  const pension = ['salary', 'business'].includes(employmentType)
    ? annualGross * 0.08
    : 0;

  // NHF: 2.5% of basic, capped  [NHF Act Cap N45 S.4]
  const nhf = employmentType === 'salary'
    ? Math.min(annualGross * 0.025, 60_000)
    : 0;

  // ── Taxable income ────────────────────────────────────────────────────────
  const taxableIncome = Math.max(0, annualGross - cra - pension - nhf);

  // ── Apply bands ───────────────────────────────────────────────────────────
  let remaining = taxableIncome;
  let tax = 0;
  const breakdown = [];

  for (const band of TAX_BANDS) {
    if (remaining <= 0) break;
    const chunk = Math.min(remaining, band.limit);
    const t = chunk * band.rate;
    if (chunk > 0) breakdown.push({ ...band, taxable: chunk, tax: t });
    tax += t;
    remaining -= chunk;
  }

  // ── Minimum tax  [PITA S.37(2)] ──────────────────────────────────────────
  // Applied when computed tax < 1% of gross
  const minTax = annualGross * 0.01;
  const usedMinTax = tax < minTax;
  const finalTax = Math.max(tax, minTax);

  const netAnnual = annualGross - finalTax - pension - nhf;

  return {
    tax: finalTax,
    monthly: finalTax / 12,
    effectiveRate: (finalTax / annualGross) * 100,
    breakdown,
    netAnnual,
    netMonthly: netAnnual / 12,
    taxableIncome,
    cra,
    pension,
    nhf,
    usedMinTax,
    exempt: false,
  };
}

/**
 * Formats a tax result into a human-readable multi-line string
 * suitable for in-app display.
 */
function formatTaxResult(result, monthlyGross) {
  const fmt = (n) => `₦${Math.round(n).toLocaleString('en-NG')}`;

  if (result.exempt) {
    return [
      '📋 *NYSC Allawee — Tax Exempt*',
      '',
      'Your ₦77,000/month NYSC allawee is a government stipend,',
      'not employment income. It is not subject to PAYE under',
      'current FIRS guidance.',
      '',
      'Any additional income above the allawee must be declared',
      'separately for tax purposes.',
    ].join('\n');
  }

  const annualGross = monthlyGross * 12;
  const lines = [
    `📊 *PAYE Breakdown for ${fmt(monthlyGross)}/month*`,
    `Annual gross: ${fmt(annualGross)}`,
    '',
    '── Deductions (Annual) ──────────────────',
    `CRA (PITA S.33):       ${fmt(result.cra)}`,
  ];

  if (result.pension > 0) {
    lines.push(`Pension 8% (PRA 2014): ${fmt(result.pension)}`);
  }
  if (result.nhf > 0) {
    lines.push(`NHF 2.5% (NHF Act):    ${fmt(result.nhf)}`);
  }

  lines.push(
    `Taxable income:        ${fmt(result.taxableIncome)}`,
    '',
    '── Tax Bands (PITA S.37) ───────────────',
  );

  for (const b of result.breakdown) {
    lines.push(
      `${b.label.padEnd(22)} ${(b.rate * 100).toFixed(0)}% = ${fmt(b.tax)}  [${b.statute}]`,
    );
  }

  if (result.usedMinTax) {
    lines.push('', '⚠️  Minimum tax rule applied (1% of gross) — PITA S.37(2)');
  }

  lines.push(
    '',
    '── Summary ─────────────────────────────',
    `Annual tax:       ${fmt(result.tax)}`,
    `Monthly tax:      *${fmt(result.monthly)}*`,
    `Effective rate:   ${result.effectiveRate.toFixed(1)}%`,
    `Est. net monthly: *${fmt(result.netMonthly)}*`,
    '',
    '📌 Basis: PITA Cap P8 LFN 2004 (as amended, Finance Acts 2019/2020),',
    '   PRA 2014 S.9(1)(b), NHF Act Cap N45 LFN 2004 S.4.',
    '   These are estimates for planning. Consult a tax professional for filing.',
  );

  return lines.join('\n');
}

/**
 * Parses Nigerian salary strings to a number.
 * Handles: "350k", "1.2m", "₦200,000", "350000"
 */
function parseCurrency(text) {
  if (!text) return null;
  const s = text.toString().toLowerCase().replace(/[₦,\s]/g, '');
  if (s.endsWith('m')) return parseFloat(s) * 1_000_000;
  if (s.endsWith('k')) return parseFloat(s) * 1_000;
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

module.exports = { calcNigerianTax, formatTaxResult, parseCurrency, TAX_BANDS };
