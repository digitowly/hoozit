import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { UserProfileResponse } from './user-profile.model';
import { HttpClient } from '@angular/common/http';
import { HttpErrorService } from '../../../../services/http-error/http-error.service';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly apiUrl = `${environment.rangoUrl}/user`;

  data = signal<UserProfileResponse | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private httpErrorService: HttpErrorService,
  ) {}

  get(): UserProfileResponse | null {
    this.isLoading.set(true);
    this.http
      .get<UserProfileResponse>(this.apiUrl, { withCredentials: true })
      .pipe(
        catchError((err) => {
          this.httpErrorService.handleError(err, (message) =>
            this.error.set(message),
          );
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((profile) => {
        console.log(profile);
        this.data.set(profile);
      });
    return this.data();
  }

  logout(): void {
    this.http
      .get(`${this.apiUrl}/logout`, { withCredentials: true })
      .subscribe();
    this.data.set(null);
  }
}
