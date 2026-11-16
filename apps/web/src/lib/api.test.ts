import { describe, it, expect } from 'vitest';
import { apiErrorMessage } from './api';

describe('apiErrorMessage', () => {
  it('returns the message from a plain Error', () => {
    expect(apiErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back when the value is not an error', () => {
    expect(apiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(apiErrorMessage(undefined, 'fallback')).toBe('fallback');
  });

  it('reads a nested API error message shape', () => {
    const err = {
      isAxiosError: true,
      response: { data: { error: { message: 'Note not found' } } },
    };
    expect(apiErrorMessage(err)).toBe('Note not found');
  });
});
