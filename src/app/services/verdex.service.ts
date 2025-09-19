import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { OccurrenceResponse } from '../model/occurrence';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerdexService {
  private readonly apiUrl = 'http://localhost:8082/api';

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Api-Key': 'secret',
    }),
  };

  isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  findOccurrences(name: string) {
    this.isLoading.set(true);
    const url = `${this.apiUrl}/animals/search?q=${name}&lang=de`;
    return this.http
      .get<OccurrenceResponse>(url, this.httpOptions)
      .pipe(finalize(() => this.isLoading.set(false)));
  }
}
