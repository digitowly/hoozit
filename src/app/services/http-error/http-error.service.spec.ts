import { HttpErrorService } from './http-error.service';

describe('HttpErrorService', () => {
  let service: HttpErrorService;
  let onErrorSpy: jasmine.Spy;

  beforeEach(() => {
    service = new HttpErrorService();
    onErrorSpy = jasmine.createSpy('onError');
  });

  it('should handle network error (status 0)', () => {
    service.handleError({ status: 0 }, onErrorSpy);
    expect(onErrorSpy).toHaveBeenCalledWith(
      'Network error: Please check your connection'
    );
  });

  it('should handle client error (status 400)', () => {
    service.handleError({ status: 400 }, onErrorSpy);
    expect(onErrorSpy).toHaveBeenCalledWith('Client error: Invalid request');
  });

  it('should handle client error (status 404)', () => {
    service.handleError({ status: 404 }, onErrorSpy);
    expect(onErrorSpy).toHaveBeenCalledWith('Client error: Invalid request');
  });

  it('should handle server error (status 500)', () => {
    service.handleError({ status: 500 }, onErrorSpy);
    expect(onErrorSpy).toHaveBeenCalledWith(
      'Server error: Please try again later'
    );
  });

  it('should handle unknown error', () => {
    service.handleError({ status: 123 }, onErrorSpy);
    expect(onErrorSpy).toHaveBeenCalledWith(
      'Services is currently unavailable'
    );
  });
});
