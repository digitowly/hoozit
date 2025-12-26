import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorService } from '../http-error/http-error.service';
import { catchError, finalize, Observable, of } from 'rxjs';
import { SpeciesIntroduction } from './species-content.model';

@Injectable({ providedIn: 'root' })
export class SpeciesContentService {
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private httpErrorService: HttpErrorService,
  ) {}

  private getApiUrl(species_id: number, language: string): string {
    return `${environment.verdexUrl}/animals/${species_id}/content/introduction?lang=${language}`;
  }

  getIntroduction(species_id: number): Observable<SpeciesIntroduction> {
    this.isLoading.set(true);
    return this.http
      .get<SpeciesIntroduction>(
        this.getApiUrl(species_id, 'de'),
        this.httpOptions,
      )
      .pipe(
        catchError((err) => {
          this.httpErrorService.handleError(err, (message) =>
            this.error.set(message),
          );
          return of();
        }),
        finalize(() => this.isLoading.set(false)),
      );
  }
}
