/**
 * Tax / PAYE Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Called by the flow engine after all questions are answered.
 * Runs the pure tax calculation and returns a formatted result.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { calcNigerianTax, formatTaxResult } = require('../logic/taxEngine');
const R = require('../engine/responseBuilder');

/**
 * @param {object} data
 * @param {number} data.monthlyGross     - Parsed monthly salary
 * @param {string} data.employmentType   - Employment category
 * @param {string} data.userId
 * @returns {OrbitResponse}
 */
async function run({ monthlyGross, employmentType, userId }) {
  const annualGross = monthlyGross * 12;
  const taxResult = calcNigerianTax(annualGross, employmentType);
  const message = formatTaxResult(taxResult, monthlyGross);

  return R.result(message, {
    type: 'tax',
    monthlyGross,
    annualGross,
    employmentType,
    ...taxResult,
  });
}

module.exports = { run };
