import { inject, Injectable, resource } from "@angular/core";
import { Occurrence } from "../occurrence.model";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class UserOccurrencesService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.scoutUrl}/user/occurrences`;

  readonly resource = resource({
    loader: () => this.fetchUserOccurrences(),
  });

  private async fetchUserOccurrences(): Promise<Occurrence[]> {
    try {
      return await firstValueFrom(
        this.http.get<Occurrence[]>(this.apiUrl, { withCredentials: true }),
      );
    } catch (error) {
      console.error("Error fetching user occurrences: ", error);
      return [];
    }
  }
}
