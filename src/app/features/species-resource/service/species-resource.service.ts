import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface CreateSpeciesResourceParams {
  type: 'image' | 'text';
  binomialName: string;
  url: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class SpeciesResourceService {
  private readonly httpClient = inject(HttpClient);

  private readonly httpOptions = {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  };

  private readonly apiUrl = `${environment.rangoUrl}/user/species-resource`;

  createOccurrenceResource(params: CreateSpeciesResourceParams) {
    return this.httpClient.post(this.apiUrl, params, this.httpOptions);
  }
}
