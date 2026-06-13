import { computeMsmeCategory, parseRangeUpperCr } from './range-parser';

describe('parseRangeUpperCr', () => {
  it('parses lakh values', () => expect(parseRangeUpperCr('< 40 Lakh')).toBeCloseTo(0.4));
  it('parses crore range upper bound', () => expect(parseRangeUpperCr('1-10Cr')).toBe(10));
  it('parses single crore value', () => expect(parseRangeUpperCr('5Cr')).toBe(5));
  it('returns null for empty string', () => expect(parseRangeUpperCr('')).toBeNull());
});

describe('computeMsmeCategory', () => {
  it('returns MICRO for small investment and turnover', () =>
    expect(computeMsmeCategory('< 40 Lakh', '< 1 Cr')).toBe('MICRO'));

  it('returns SMALL for medium investment', () =>
    expect(computeMsmeCategory('40L-5Cr', '1-10Cr')).toBe('SMALL'));

  it('returns MEDIUM for larger values', () =>
    expect(computeMsmeCategory('5-50Cr', '10-50Cr')).toBe('MEDIUM'));

  it('returns null when values exceed MEDIUM thresholds', () =>
    expect(computeMsmeCategory('100-500Cr', '50-200Cr')).toBeNull());
});
