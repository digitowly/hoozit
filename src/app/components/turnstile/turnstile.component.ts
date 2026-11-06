import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { UiThemeService } from '../../services/ui-theme/ui-theme.service';

const SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render(element: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptLoad: Promise<void> | undefined;

function loadTurnstileScript(): Promise<void> {
  scriptLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoad = undefined;
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(script);
  });
  return scriptLoad;
}

@Component({
  selector: 'app-turnstile',
  template: '<div #container></div>',
})
export class TurnstileComponent implements AfterViewInit, OnDestroy {
  private readonly uiTheme = inject(UiThemeService);

  readonly tokenChange = output<string | null>();
  readonly failed = output<void>();

  private readonly container =
    viewChild.required<ElementRef<HTMLElement>>('container');
  private widgetId?: string;
  private isDestroyed = false;

  async ngAfterViewInit(): Promise<void> {
    try {
      await loadTurnstileScript();
    } catch {
      this.failed.emit();
      return;
    }
    if (this.isDestroyed || !window.turnstile) return;

    this.widgetId = window.turnstile.render(this.container().nativeElement, {
      sitekey: environment.turnstileSiteKey,
      size: 'flexible',
      theme: this.uiTheme.theme(),
      'refresh-expired': 'auto',
      callback: (token: string) => this.tokenChange.emit(token),
      'expired-callback': () => this.tokenChange.emit(null),
      'timeout-callback': () => this.tokenChange.emit(null),
      'error-callback': () => {
        this.tokenChange.emit(null);
        this.failed.emit();
      },
    });
  }

  /** Tokens work once, so every submit needs a new challenge. */
  reset(): void {
    this.tokenChange.emit(null);
    if (this.widgetId) window.turnstile?.reset(this.widgetId);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.widgetId) window.turnstile?.remove(this.widgetId);
  }
}
