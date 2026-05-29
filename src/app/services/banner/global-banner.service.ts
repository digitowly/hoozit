import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type BannerVariant = 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class GlobalBannerService {
  private readonly globalBanner = this.parseGlobalBanner(environment.globalBannerMessage);

  get message(): string {
    return this.globalBanner.message;
  }

  get variant(): BannerVariant {
    return this.globalBanner.variant;
  }

  private parseGlobalBanner(configuredMessage: string): {
    message: string;
    variant: BannerVariant;
  } {
    const trimmed = configuredMessage.trim();
    if (!trimmed) {
      return { message: '', variant: 'info' };
    }

    const prefixMatch = trimmed.match(/^\[(warning|info)]\s*(.*)$/i);
    if (!prefixMatch) {
      return { message: trimmed, variant: 'info' };
    }

    const variant = prefixMatch[1].toLowerCase() as BannerVariant;
    const message = prefixMatch[2].trim();
    return { message, variant };
  }
}