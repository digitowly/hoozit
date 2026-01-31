import { describe, it, expect, vi } from 'vitest';
import { handleHttpError } from './http-error';
import { Observable } from 'rxjs';

describe('handleHttpError', () => {
  const onErrorSpy = vi.fn();

  it('should handle network error (status 0)', () => {
    handleHttpError({ status: 0 }, onErrorSpy);
    expect(onErrorSpy).toHaveBeenCalledWith(
      'Network error: Please check your connection',
    );
  });

  it('should handle client error (status 400)', () => {
    handleHttpError({ status: 400 }, onErrorSpy);
    expect(onErrorSpy).toHaveBeenCalledWith('Client error: Invalid request');
  });

  it('should handle client error (status 404)', () => {
    handleHttpError({ status: 404 }, onErrorSpy);
    expect(onErrorSpy).toHaveBeenCalledWith('Client error: Invalid request');
  });

  it('should handle server error (status 500)', () => {
    handleHttpError({ status: 500 }, onErrorSpy);
    expect(onErrorSpy).toHaveBeenCalledWith(
      'Server error: Please try again later',
    );
  });

  it('should handle unknown error', () => {
    handleHttpError({ status: 123 }, onErrorSpy);
    expect(onErrorSpy).toHaveBeenCalledWith(
      'Services is currently unavailable',
    );
  });
});
