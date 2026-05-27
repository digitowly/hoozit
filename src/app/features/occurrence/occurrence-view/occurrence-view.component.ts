import { Component, computed, effect, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { UserOccurrenceService } from "../../../services/occurrence/user-occurrences/user-occurrence.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { Occurrence } from "../../../services/occurrence/occurrence.model";
import { ContentContainerComponent } from "../../../components/content-container/content-container.component";

@Component({
  selector: "occurrence-view",
  imports: [ContentContainerComponent],
  templateUrl: "./occurrence-view.component.html",
  styleUrl: "./occurrence-view.component.scss",
})
export class OccurrenceViewComponent {
  private activatedRoute = inject(ActivatedRoute);

  private readonly userOccurrenceService = inject(UserOccurrenceService);

  private readonly params = toSignal(this.activatedRoute.params, {
    initialValue: { id: "" },
  });

  protected readonly occurrence = computed<Occurrence | undefined>(() =>
    this.userOccurrenceService.resource.value(),
  );

  constructor() {
    effect(() => {
      this.userOccurrenceService.id.set(this.params().id);
    });
  }
}
