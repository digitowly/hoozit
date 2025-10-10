import { IconRegistryService } from './icon-registry.service';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

describe('IconRegistryService', () => {
  let service: IconRegistryService;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    service = TestBed.inject(IconRegistryService);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register an icon', () => {
    const svg = `
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor"/><line x1="20.4" y1="20.5" x2="15.5" y2="15.7" fill="none" stroke="currentColor"/></svg>
    `;
    service.registerIcon('search', svg);
    const result = service.getIcon('search');

    expect(result).toBeDefined();
    const unwrapped = sanitizer.sanitize(1, result);
    expect(unwrapped?.trim()).toBe(svg.trim());
  });
});
