import { describe, expect, it } from 'vitest';
import { isFiniteNumeric } from '../is-finite-numeric';

describe('isFiniteNumeric', () => {
  it('returns true for finite numbers', () => {
    expect(isFiniteNumeric(0)).toBe(true);
    expect(isFiniteNumeric(42)).toBe(true);
    expect(isFiniteNumeric(-42)).toBe(true);
    expect(isFiniteNumeric(3.14)).toBe(true);
  });

  it('returns true for numeric strings', () => {
    expect(isFiniteNumeric('0')).toBe(true);
    expect(isFiniteNumeric('42')).toBe(true);
    expect(isFiniteNumeric('-42')).toBe(true);
    expect(isFiniteNumeric('3.14')).toBe(true);
    expect(isFiniteNumeric('1e3')).toBe(true);
    expect(isFiniteNumeric(' 15 ')).toBe(true);
  });

  it('returns false for non-finite numeric values', () => {
    expect(isFiniteNumeric('NaN')).toBe(false);
    expect(isFiniteNumeric(Number.NaN)).toBe(false);
    expect(isFiniteNumeric(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isFiniteNumeric(Number.NEGATIVE_INFINITY)).toBe(false);
    expect(isFiniteNumeric('NaN')).toBe(false);
    expect(isFiniteNumeric('Infinity')).toBe(false);
    expect(isFiniteNumeric('-Infinity')).toBe(false);
  });

  it('returns false for empty and non-numeric values', () => {
    expect(isFiniteNumeric('')).toBe(false);
    expect(isFiniteNumeric('   ')).toBe(false);
    expect(isFiniteNumeric('abc')).toBe(false);
    expect(isFiniteNumeric('123abc')).toBe(false);
    expect(isFiniteNumeric('12,3')).toBe(false);
    expect(isFiniteNumeric(null)).toBe(false);
    expect(isFiniteNumeric(undefined)).toBe(false);
    expect(isFiniteNumeric({})).toBe(false);
    expect(isFiniteNumeric([])).toBe(false);
    expect(isFiniteNumeric(true)).toBe(false);
  });
});
