import { inject, Injectable, resource } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ProfileResponse } from './user-data.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.scoutUrl}/users/me/profile`;

  readonly profileResource = resource({ loader: () => this.fetchProfile() });

  async logout() {
    const response = await fetch(`${environment.scoutUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok && response.status !== 401) {
      throw new Error('Logout failed');
    }
    this.profileResource.reload();
  }

  private async fetchProfile(): Promise<ProfileResponse | null> {
    try {
      return await firstValueFrom(
        this.http.get<ProfileResponse>(this.apiUrl, { withCredentials: true }),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return null;
      }
      throw error;
    }
  }
}
