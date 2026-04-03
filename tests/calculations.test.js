import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDateBr,
  monthsBetween,
  maturityValueInBrl,
  parseDateInput,
  principalInBrl,
  toIsoDateString,
} from '../src/calculations.js';

describe('calculations', () => {
  it('monthsBetween counts calendar months', () => {
    assert.equal(monthsBetween('2024-01-15', '2025-01-14'), 11);
    assert.equal(monthsBetween('2024-01-15', '2025-01-15'), 12);
  });

  it('maturityValueInBrl with zero rate', () => {
    const vp = principalInBrl(100, 5);
    assert.equal(maturityValueInBrl(vp, 0, 12), 500);
  });

  it('maturityValueInBrl with annual interest', () => {
    const vp = 1000;
    const vf = maturityValueInBrl(vp, 12, 12);
    assert.ok(Math.abs(vf - 1120) < 1e-9);
  });

  it('parseDateInput accepts Brazilian dd/mm/yyyy', () => {
    const d = parseDateInput('15/03/2025');
    assert.equal(d.getFullYear(), 2025);
    assert.equal(d.getMonth(), 2);
    assert.equal(d.getDate(), 15);
  });

  it('formatDateBr and toIsoDateString round-trip', () => {
    assert.equal(formatDateBr('2025-03-15'), '15/03/2025');
    assert.equal(toIsoDateString('15/03/2025'), '2025-03-15');
  });

  it('monthsBetween works with Brazilian date strings', () => {
    assert.equal(monthsBetween('15/01/2024', '15/01/2025'), 12);
  });
});
