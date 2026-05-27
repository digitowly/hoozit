import { inject, Injectable, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ProfileResponse } from './user-data.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.scoutUrl}/users/me/profile`;

  readonly profileResource = resource({ loader: () => this.fetchProfile() });

  async logout() {
    await fetch(`${environment.scoutUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    this.profileResource.reload();
  }

  private async fetchProfile(): Promise<ProfileResponse | null> {
    try {
      return await firstValueFrom(
        this.http.get<ProfileResponse>(this.apiUrl, { withCredentials: true }),
      );
    } catch {
      return null;
    }
  }
}
