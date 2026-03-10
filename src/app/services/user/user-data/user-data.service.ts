import { Injectable, resource } from '@angular/core';
import { UserDataResponse } from './user-data.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private readonly apiUrl = `${environment.rangoUrl}/user`;

  readonly userResource = resource({ loader: () => this.fetchUser() });

  async logout() {
    const url = `${this.apiUrl}/logout`;
    await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    this.userResource.reload();
  }

  private async fetchUser(): Promise<UserDataResponse | null> {
    try {
      const response = await fetch(this.apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      return await response.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
