import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorService {
  handleError(err: { status: number }, onError: (message: string) => void) {
    if (err.status === 0) {
      console.error('Network error:', err);
      return onError('Network error: Please check your connection');
    }

    if (err.status >= 400 && err.status < 500) {
      console.error('Client error:', err);
      return onError('Client error: Invalid request');
    }

    if (err.status >= 500) {
      console.error('Server error:', err);
      return onError('Server error: Please try again later');
    }

    console.error('Error: ', err);
    return onError('Services is currently unavailable');
  }
}
