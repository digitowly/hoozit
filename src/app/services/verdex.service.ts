import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OccurrenceResponse } from '../model/occurrence';

@Injectable({
  providedIn: 'root',
})
export class VerdexService {
  constructor(private http: HttpClient) {}
  private apiUrl = 'http://localhost:8082/api';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Api-Key': 'secret',
    }),
  };

  findOccurrences(name: string) {
    const url = `${this.apiUrl}/animals/search?q=${name}&lang=de`;
    return this.http.get<OccurrenceResponse>(url, this.httpOptions);
  }
}
