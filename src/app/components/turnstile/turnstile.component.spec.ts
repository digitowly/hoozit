import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TurnstileComponent } from './turnstile.component';

describe('TurnstileComponent', () => {
  let fixture: ComponentFixture<TurnstileComponent>;
  let options: Record<string, (value?: string) => void>;
  const turnstile = {
    render: vi.fn(),
    reset: vi.fn(),
    remove: vi.fn(),
  };

  async function renderWidget(): Promise<void> {
    fixture = TestBed.createComponent(TurnstileComponent);
    fixture.detectChanges();
    document.head
      .querySelectorAll('script[src*="turnstile"]')
      .forEach((script) => script.dispatchEvent(new Event('load')));
    await fixture.whenStable();
    await vi.waitFor(() => expect(turnstile.render).toHaveBeenCalled());
    options = turnstile.render.mock.calls[0][1];
  }

  beforeEach(() => {
    vi.clearAllMocks();
    turnstile.render.mockReturnValue('widget-1');
    window.turnstile = turnstile;
  });

  afterEach(() => {
    delete window.turnstile;
  });

  it('passes the token on', async () => {
    await renderWidget();
    const tokens: (string | null)[] = [];
    fixture.componentInstance.tokenChange.subscribe((t) => tokens.push(t));

    options['callback']('token-1');

    expect(tokens).toEqual(['token-1']);
  });

  it('clears the token when it expires', async () => {
    await renderWidget();
    const tokens: (string | null)[] = [];
    fixture.componentInstance.tokenChange.subscribe((t) => tokens.push(t));

    options['expired-callback']();

    expect(tokens).toEqual([null]);
  });

  it('reports a failed challenge', async () => {
    await renderWidget();
    const failed = vi.fn();
    fixture.componentInstance.failed.subscribe(failed);

    options['error-callback']();

    expect(failed).toHaveBeenCalled();
  });

  it('clears the token and loads a new challenge on reset', async () => {
    await renderWidget();
    const tokens: (string | null)[] = [];
    fixture.componentInstance.tokenChange.subscribe((t) => tokens.push(t));

    fixture.componentInstance.reset();

    expect(tokens).toEqual([null]);
    expect(turnstile.reset).toHaveBeenCalledWith('widget-1');
  });

  it('removes the widget when destroyed', async () => {
    await renderWidget();

    fixture.destroy();

    expect(turnstile.remove).toHaveBeenCalledWith('widget-1');
  });
});
