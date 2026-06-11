import { validateDateRead, prepareLogPayload } from './validationUtils';

describe('validateDateRead', () => {
  const referenceDate = new Date(2026, 5, 10); // June 10, 2026

  test('blocks future dates read', () => {
    // June 11, 2026 is tomorrow relative to June 10
    const result = validateDateRead('2026-06-11', referenceDate);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('You cannot select a date read in the future.');
  });

  test('allows today and past dates read', () => {
    const todayResult = validateDateRead('2026-06-10', referenceDate);
    expect(todayResult.isValid).toBe(true);

    const pastResult = validateDateRead('2026-05-15', referenceDate);
    expect(pastResult.isValid).toBe(true);
  });

  test('validates inputs properly', () => {
    const emptyResult = validateDateRead('', referenceDate);
    expect(emptyResult.isValid).toBe(false);

    const invalidFormat = validateDateRead('10-06-2026', referenceDate);
    expect(invalidFormat.isValid).toBe(false);

    const badDate = validateDateRead('2026-02-31', referenceDate);
    expect(badDate.isValid).toBe(false);
  });
});

describe('prepareLogPayload', () => {
  test('returns undefined ID when saveAsNew is true', () => {
    const payload = prepareLogPayload('log-123', true, { rating: 5 });
    expect(payload.id).toBeUndefined();
    expect(payload.rating).toBe(5);
  });

  test('returns initial ID when saveAsNew is false', () => {
    const payload = prepareLogPayload('log-123', false, { rating: 4 });
    expect(payload.id).toBe('log-123');
    expect(payload.rating).toBe(4);
  });
});
