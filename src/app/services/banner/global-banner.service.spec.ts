import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { GlobalBannerService } from './global-banner.service';

describe('GlobalBannerService', () => {
  let originalGlobalBannerMessage: string;

  beforeEach(() => {
    originalGlobalBannerMessage = environment.globalBannerMessage;
  });

  afterEach(() => {
    environment.globalBannerMessage = originalGlobalBannerMessage;
  });

  const createService = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    return TestBed.inject(GlobalBannerService);
  };

  it('should be created', () => {
    const service = createService();
    expect(service).toBeTruthy();
  });

  it('returns empty message and info variant when config is empty', () => {
    environment.globalBannerMessage = '   ';

    const service = createService();

    expect(service.message).toBe('');
    expect(service.variant).toBe('info');
  });

  it('returns trimmed message and info variant for plain text config', () => {
    environment.globalBannerMessage = '  Scheduled maintenance tonight  ';

    const service = createService();

    expect(service.message).toBe('Scheduled maintenance tonight');
    expect(service.variant).toBe('info');
  });

  it('parses warning prefix and extracts message', () => {
    environment.globalBannerMessage = '[warning] API degraded';

    const service = createService();

    expect(service.message).toBe('API degraded');
    expect(service.variant).toBe('warning');
  });

  it('parses info prefix case-insensitively and extracts message', () => {
    environment.globalBannerMessage = '[InFo] New feature enabled';

    const service = createService();

    expect(service.message).toBe('New feature enabled');
    expect(service.variant).toBe('info');
  });
});
