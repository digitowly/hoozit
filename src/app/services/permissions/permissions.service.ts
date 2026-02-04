import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Permission, PermissionsResponse } from './permissions.model';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly httpClient = inject(HttpClient);

  private readonly apiUrl = `${environment.rangoUrl}/user/permissions`;

  private readonly httpOptions = {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  };

  hasUserPermissions(permissions: Permission[]): Observable<boolean> {
    return this.getPermissions().pipe(
      map((response) => response.permissions || []),
      map((userPermissions) =>
        userPermissions.some((p) => permissions.includes(p as Permission)),
      ),
      catchError((err) => {
        console.error('Error fetching user permissions', err);
        return of(false);
      }),
    );
  }

  private getPermissions(): Observable<PermissionsResponse> {
    return this.httpClient.get<PermissionsResponse>(
      this.apiUrl,
      this.httpOptions,
    );
  }
}
