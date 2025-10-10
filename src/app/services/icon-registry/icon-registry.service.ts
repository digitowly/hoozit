import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconName } from './icon-registry.model';

@Injectable({ providedIn: 'root' })
export class IconRegistryService {
  private icons = new Map<IconName, SafeHtml>();

  constructor(private sanitizer: DomSanitizer) {}

  registerIcon(name: IconName, svg: string) {
    const safeSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
    this.icons.set(name, safeSvg);
  }

  getIcon(name: IconName | null): SafeHtml | null {
    if (!name) return null;
    return this.icons.get(name) || null;
  }
}
