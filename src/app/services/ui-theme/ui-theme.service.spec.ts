import { UiThemeService } from './ui-theme.service';

function clearThemeCookie() {
  // Expire the cookie to clear it for the test environment
  document.cookie = 'theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

describe('UiThemeService', () => {
  beforeEach(() => {
    clearThemeCookie();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should default to dark theme and not touch DOM when no cookie is present', () => {
    const service = new UiThemeService();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('should initialize theme from cookie and update DOM', () => {
    document.cookie = 'theme=light; path=/';

    const service = new UiThemeService();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should toggle theme, update cookie and DOM', () => {
    const service = new UiThemeService();

    // Initial
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();

    // First toggle -> light
    service.toggleTheme();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.cookie).toContain('theme=light');

    // Second toggle -> dark
    service.toggleTheme();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.cookie).toContain('theme=dark');
  });
});
