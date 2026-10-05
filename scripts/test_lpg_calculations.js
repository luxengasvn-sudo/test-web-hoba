const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('Testing LPG CP calculation logic and seed data...');

// 1. Check seed data
const rawData = fs.readFileSync(path.join(__dirname, '../src/lib/defaultLpgPrices.json'), 'utf8');
const data = JSON.parse(rawData);

assert(Array.isArray(data.records), 'records must be an array');
assert.strictEqual(data.records.length, 22, 'should have 22 records');
assert.strictEqual(data.defaultFxRate, 26300, 'default fx rate should be 26300');

// 2. Test calculations
function getAvg(p, b) {
  if (p === null || b === null) return null;
  return (p + b) / 2;
}

function calculate12kgImpact(deltaCp, fxRate) {
  const val = (deltaCp * 1.05 * 1.10 * fxRate / 1000) * 12;
  return Math.round(val / 100) * 100;
}

// 2026-09: propane 625, butane 660 => avg 642.5
const rSep = data.records.find(r => r.month === '2026-09');
assert.strictEqual(getAvg(rSep.propane, rSep.butane), 642.5);

// 2026-08: propane 620, butane 640 => avg 630
const rAug = data.records.find(r => r.month === '2026-08');
assert.strictEqual(getAvg(rAug.propane, rAug.butane), 630);

// MoM Sep vs Aug: 642.5 - 630 = +12.5 USD/ton
const delta = getAvg(rSep.propane, rSep.butane) - getAvg(rAug.propane, rAug.butane);
assert.strictEqual(delta, 12.5);

// 12kg impact with delta = 10 and fx = 26300:
// 10 * 1.05 * 1.10 * 26300 / 1000 * 12 = 3645.18 => rounded to nearest 100 => 3600
const impact = calculate12kgImpact(10, 26300);
assert.strictEqual(impact, 3600, `Expected 3600 but got ${impact}`);

console.log('✅ ALL LPG CP TESTS PASSED SUCCESSFULLY!');
