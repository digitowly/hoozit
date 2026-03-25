import { inject, Injectable, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserDataResponse } from './user-data.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.rangoUrl}/user`;

  readonly userResource = resource({ loader: () => this.fetchUser() });

  async logout() {
    await fetch(`${this.apiUrl}/logout`, { credentials: 'include' });
    this.userResource.reload();
  }

  private async fetchUser(): Promise<UserDataResponse | null> {
    try {
      return await firstValueFrom(
        this.http.get<UserDataResponse>(this.apiUrl, { withCredentials: true }),
      );
    } catch {
      return null;
    }
  }
}
