import { inject, Injectable } from '@angular/core';
import { UserDataService } from '../user/user-data/user-data.service';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userDataService = inject(UserDataService);

  hasUserRole(role: string): boolean {
    return this.userDataService.userResource.value()?.role === role;
  }
}
