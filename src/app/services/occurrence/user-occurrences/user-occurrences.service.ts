import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Occurrence } from '../occurrence.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserOccurrencesService {
  readonly resource = httpResource<Occurrence[]>(() => ({
    url: `${environment.scoutUrl}/user/occurrences`,
    withCredentials: true,
  }));
}
