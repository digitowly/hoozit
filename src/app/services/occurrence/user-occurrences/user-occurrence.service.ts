import { inject, Injectable, resource, signal } from "@angular/core";
import { Occurrence } from "../occurrence.model";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class UserOccurrenceService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.scoutUrl}/user/occurrence`;

  readonly id = signal<string>("");

  readonly resource = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => this.fetchUserOccurrence(params.id),
  });

  private async fetchUserOccurrence(
    id: string,
  ): Promise<Occurrence | undefined> {
    if (!id) return undefined;
    try {
      return await firstValueFrom(
        this.http.get<Occurrence>(`${this.apiUrl}/${id}`, {
          withCredentials: true,
        }),
      );
    } catch (error) {
      console.error("Error fetching user occurrence: ", error);
      return undefined;
    }
  }
}
