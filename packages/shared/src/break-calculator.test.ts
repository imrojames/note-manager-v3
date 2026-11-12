import { describe, it, expect } from 'vitest';
import {
  computeReturnTime,
  formatMinutes,
  parseTimeToMinutes,
  DEFAULT_BREAK_MINUTES,
} from './break-calculator.js';

describe('computeReturnTime', () => {
  it('adds the default 1h30m break', () => {
    expect(DEFAULT_BREAK_MINUTES).toBe(90);
    expect(computeReturnTime('13:45')).toBe('15:15');
    expect(computeReturnTime('09:00')).toBe('10:30');
  });

  it('carries minute overflow into the hour', () => {
    expect(computeReturnTime('10:40')).toBe('12:10');
  });

  it('wraps past midnight (24h)', () => {
    expect(computeReturnTime('23:00')).toBe('00:30');
    expect(computeReturnTime('23:59', 1)).toBe('00:00');
  });

  it('supports a custom duration', () => {
    expect(computeReturnTime('09:15', 45)).toBe('10:00');
    expect(computeReturnTime('09:15', 0)).toBe('09:15');
  });

  it('rejects malformed times', () => {
    expect(() => computeReturnTime('25:00')).toThrow();
    expect(() => computeReturnTime('9:5')).toThrow();
    expect(() => computeReturnTime('noon')).toThrow();
  });

  it('rejects a negative duration', () => {
    expect(() => computeReturnTime('09:00', -5)).toThrow();
  });
});

describe('parseTimeToMinutes / formatMinutes', () => {
  it('round-trips a time', () => {
    expect(formatMinutes(parseTimeToMinutes('07:05'))).toBe('07:05');
  });

  it('accepts single-digit hours', () => {
    expect(parseTimeToMinutes('9:05')).toBe(9 * 60 + 5);
  });
});
