import { Injectable, signal, resource } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SpeciesIntroduction } from './species-content.model';

@Injectable({ providedIn: 'root' })
export class SpeciesContentService {
  private readonly speciesId = signal(0);
  private readonly language = signal('de');

  readonly introductionResource = resource({
    params: () => ({ speciesId: this.speciesId(), language: this.language() }),
    loader: ({ params }) =>
      this.fetchIntroduction(params.speciesId, params.language),
  });

  getIntroduction(speciesId: number) {
    this.speciesId.set(speciesId);
  }

  private async fetchIntroduction(
    speciesId: number,
    language: string,
  ): Promise<SpeciesIntroduction | null> {
    if (!speciesId || !language) return null;

    const url = this.getApiUrl(speciesId, language);

    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private getApiUrl(speciesId: number, language: string): string {
    return `${environment.verdexUrl}/animals/${speciesId}/content/introduction?lang=${language}`;
  }
}
