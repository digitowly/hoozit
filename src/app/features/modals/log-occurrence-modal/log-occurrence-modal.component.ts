import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { form, FormField } from "@angular/forms/signals";
import { firstValueFrom } from "rxjs";
import { ModalComponent } from "../../../components/modal/modal.component";
import { FieldContainerComponent } from "../../../components/forms/field-container/field-container.component";
import { AutosuggestComponent } from "../../../components/autosuggest/autosuggest.component";
import { AutoSuggestEntry } from "../../../components/autosuggest/autosuggest.model";
import { LoginButtonComponent } from "../../../components/login-button/login-button.component";
import { SpeciesAutosuggestService } from "../../../services/forms/species-autosuggest/species-autosuggest.service";
import { UserLocationService } from "../../../services/user/user-location/user-location.service";
import { UserProfileService } from "../../../services/user/user-data/user-profile.service";
import { ModalService } from "../../../services/modal/modal.service";
import { OccurrenceService } from "../../../services/occurrence/occurrence.service";
import { UserOccurrencesService } from "../../../services/occurrence/user-occurrences/user-occurrences.service";
import { UserOccurrenceRequest } from "../../../services/occurrence/occurrence.model";
import { SubmissionState } from "../../species-resource/species-resource.model";
import { LoginComponent } from "../../login/login.component";

@Component({
  selector: "log-occurrence-modal",
  imports: [
    ModalComponent,
    FieldContainerComponent,
    AutosuggestComponent,
    FormField,
    LoginComponent,
  ],
  templateUrl: "./log-occurrence-modal.component.html",
  styleUrl: "./log-occurrence-modal.component.scss",
})
export class LogOccurrenceModalComponent {
  private static readonly EVIDENCE_NONE = "none" as const;

  readonly detectionTypeOptions = [
    { label: "Visual", value: "visual" },
    { label: "Auditory", value: "auditory" },
    { label: "Camera trap", value: "camera_trap" },
    { label: "Acoustic sensor", value: "acoustic_sensor" },
    { label: "eDNA", value: "edna" },
  ] as const;

  readonly evidenceTypeOptions = [
    { label: "None", value: LogOccurrenceModalComponent.EVIDENCE_NONE },
    { label: "Track", value: "track" },
    { label: "Scat", value: "scat" },
    { label: "Nest", value: "nest" },
    { label: "Pellet", value: "pellet" },
    { label: "Feather", value: "feather" },
    { label: "Carcass", value: "carcass" },
    { label: "Food remains", value: "food_remains" },
    { label: "Burrow", value: "burrow" },
  ] as const;

  readonly modalId = input.required<string>();

  readonly handleClose = output();

  private readonly occurrenceService = inject(OccurrenceService);

  private readonly userLocation = inject(UserLocationService);

  private readonly userDataService = inject(UserProfileService);

  private readonly userOccurrencesService = inject(UserOccurrencesService);

  private readonly speciesAutosuggestService = inject(
    SpeciesAutosuggestService,
  );

  private readonly modalService = inject(ModalService);

  readonly speciesEntries = computed(() =>
    this.speciesAutosuggestService.speciesEntries(),
  );

  readonly formModel = signal({ name: "", description: "" });

  readonly occurrenceForm = form(this.formModel, {});

  readonly confidence = signal(0.5);

  readonly detectionType =
    signal<(typeof this.detectionTypeOptions)[number]["value"]>("visual");

  readonly evidenceType =
    signal<(typeof this.evidenceTypeOptions)[number]["value"]>("track");

  readonly observationDate = signal(this.todayStr());

  readonly timeStart = signal(this.nowTimeStr());

  readonly timeEnd = signal(this.nowPlusStr(15));

  readonly isOpen = computed(() => this.modalService.isOpen(this.modalId()));

  readonly isLoggedIn = computed(
    () => !!this.userDataService.profileResource.value(),
  );
  readonly submissionState = this.occurrenceService.submissionState;

  readonly locationLabel = computed(() => {
    const c = this.userLocation.coordinate();
    return `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`;
  });

  readonly confidenceLabel = computed(
    () => Math.round(this.confidence() * 100) + "%",
  );

  readonly isSubmittable = computed(() => {
    const state = this.submissionState();
    return (
      this.isLoggedIn() &&
      state !== SubmissionState.LOADING &&
      state !== SubmissionState.SUCCESS &&
      this.occurrenceForm.name().value() !== "" &&
      this.occurrenceForm.description().value() !== ""
    );
  });

  setConfidence(event: Event) {
    this.confidence.set(+(event.target as HTMLInputElement).value);
  }

  setDetectionType(event: Event) {
    const detectionType = (event.target as HTMLSelectElement)
      .value as (typeof this.detectionTypeOptions)[number]["value"];
    this.detectionType.set(detectionType);

    if (detectionType !== "visual") {
      this.evidenceType.set(LogOccurrenceModalComponent.EVIDENCE_NONE);
    }
  }

  setEvidenceType(event: Event) {
    this.evidenceType.set(
      (event.target as HTMLSelectElement)
        .value as (typeof this.evidenceTypeOptions)[number]["value"],
    );
  }

  setDate(event: Event) {
    this.observationDate.set((event.target as HTMLInputElement).value);
  }

  setTimeStart(event: Event) {
    this.timeStart.set((event.target as HTMLInputElement).value);
  }

  setTimeEnd(event: Event) {
    this.timeEnd.set((event.target as HTMLInputElement).value);
  }

  onAutoSuggestChange(input: string) {
    this.speciesAutosuggestService.onChange(input);
    this.occurrenceForm.name().value.set(input);
  }

  onAutoSuggestSelect(entry: AutoSuggestEntry) {
    this.occurrenceForm.name().value.set(entry.label);
  }

  async onSubmit() {
    if (!this.isSubmittable()) return;

    const coord = this.userLocation.coordinate();

    const observed_at = this.buildIsoDate(
      this.observationDate(),
      this.timeStart(),
    );

    const timeStartNaive = `${this.timeStart()}:00`;
    const timeEndNaive = `${this.timeEnd()}:00`;

    const payload: UserOccurrenceRequest = {
      name: this.occurrenceForm.name().value(),
      description: this.occurrenceForm.description().value(),
      behavior: undefined,
      detection_method: this.detectionType(),
      evidence_type:
        this.detectionType() === "visual"
          ? this.evidenceType()
          : LogOccurrenceModalComponent.EVIDENCE_NONE,
      is_captive: false,
      life_stage: "adult",
      observed_at: observed_at,
      quantity_estimate: "single",
      sex: "unknown",
      confidence: this.confidence(),
      coordinates: { latitude: coord.latitude, longitude: coord.longitude },
      time_start: timeStartNaive,
      time_end: timeEndNaive,
    };

    try {
      await firstValueFrom(this.occurrenceService.submit(payload));
      this.userDataService.profileResource.reload();
      this.userOccurrencesService.resource.reload();
      setTimeout(() => this.close(), 1500);
    } catch {
      // error state is set in OccurrenceService
    }
  }

  close() {
    this.modalService.close(this.modalId());
    this.handleClose.emit();
    this.occurrenceService.reset();
    this.occurrenceForm.name().value.set("");
    this.occurrenceForm.description().value.set("");
    this.confidence.set(0.5);
    this.detectionType.set("visual");
    this.evidenceType.set("track");
    this.observationDate.set(this.todayStr());
    this.timeStart.set(this.nowTimeStr());
    this.timeEnd.set(this.nowPlusStr(15));
  }

  private buildIsoDate(date: string, time: string): string {
    return new Date(`${date}T${time}:00`).toISOString();
  }

  private todayStr(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private nowTimeStr(): string {
    const date = new Date();
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  private nowPlusStr(minutes: number): string {
    const date = new Date(Date.now() + minutes * 60_000);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  protected readonly SubmissionState = SubmissionState;
}
