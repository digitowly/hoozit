export function handleHttpError(
  err: { status: number },
  onError?: (message: string) => void,
) {
  if (err.status === 0) {
    console.error('Network error:', err);
    onError && onError('Network error: Please check your connection');
    return null;
  }

  if (err.status >= 400 && err.status < 500) {
    console.error('Client error:', err);
    onError && onError('Client error: Invalid request');
    return null;
  }

  if (err.status >= 500) {
    console.error('Server error:', err);
    onError && onError('Server error: Please try again later');
    return null;
  }

  console.error('Error: ', err);
  onError && onError('Services is currently unavailable');
  return null;
}
