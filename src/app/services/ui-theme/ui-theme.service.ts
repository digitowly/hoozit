import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class UiThemeService {
  theme = signal<Theme>('dark');

  constructor() {
    const storedTheme = this.getThemeCookie();
    if (storedTheme) {
      this.theme.set(storedTheme);
      this.updateDom();
    }
  }

  toggleTheme() {
    const newTheme = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(newTheme);
    this.setThemeCookie(newTheme);
    this.updateDom();
  }

  private updateDom() {
    document.documentElement.setAttribute('data-theme', this.theme());
  }

  private setThemeCookie(theme: Theme) {
    document.cookie = `theme=${theme}; path=/`;
  }

  private getThemeCookie(): Theme | null {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === 'theme') {
        return value as Theme;
      }
    }
    return null;
  }
}
