import { Component, computed, inject, input, output, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { ModalComponent } from '../../../components/modal/modal.component';
import { FieldContainerComponent } from '../../../components/forms/field-container/field-container.component';
import { AutosuggestComponent } from '../../../components/autosuggest/autosuggest.component';
import { AutoSuggestEntry } from '../../../components/autosuggest/autosuggest.model';
import { LoginButtonComponent } from '../../../components/login-button/login-button.component';
import { SpeciesAutosuggestService } from '../../../services/forms/species-autosuggest/species-autosuggest.service';
import { OccurrenceService } from '../../../services/rango/occurrence/occurrence.service';
import { UserLocationService } from '../../../services/user/user-location/user-location.service';
import { UserDataService } from '../../../services/user/user-data/user-data.service';
import { ModalService } from '../../../services/modal/modal.service';
import { UserOccurrenceRequest } from '../../../services/rango/occurrence/occurrence.model';

@Component({
  selector: 'log-occurrence-modal',
  imports: [ModalComponent, FieldContainerComponent, AutosuggestComponent, FormField, LoginButtonComponent],
  templateUrl: './log-occurrence-modal.component.html',
  styleUrl: './log-occurrence-modal.component.scss',
})
export class LogOccurrenceModalComponent {
  readonly modalId = input.required<string>();
  readonly handleClose = output();

  private readonly occurrenceService = inject(OccurrenceService);
  private readonly userLocation = inject(UserLocationService);
  private readonly userDataService = inject(UserDataService);
  private readonly speciesAutosuggestService = inject(SpeciesAutosuggestService);
  private readonly modalService = inject(ModalService);

  readonly speciesEntries = computed(() => this.speciesAutosuggestService.speciesEntries());

  readonly formModel = signal({ name: '', description: '' });
  readonly occurrenceForm = form(this.formModel, {});
  readonly confidence = signal(0.5);

  readonly isOpen = computed(() => this.modalService.isOpen(this.modalId()));

  readonly isLoggedIn = computed(() => !!this.userDataService.userResource.value());
  readonly submissionState = computed(() => this.occurrenceService.submissionState());

  readonly locationLabel = computed(() => {
    const c = this.userLocation.coordinate();
    return `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`;
  });

  readonly confidenceLabel = computed(() => Math.round(this.confidence() * 100) + '%');

  readonly isSubmittable = computed(() => {
    return (
      this.isLoggedIn() &&
      this.submissionState() !== 'loading' &&
      this.occurrenceForm.name().value() !== '' &&
      this.occurrenceForm.description().value() !== ''
    );
  });

  setConfidence(event: Event) {
    this.confidence.set(+(event.target as HTMLInputElement).value);
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
    const payload: UserOccurrenceRequest = {
      name: this.occurrenceForm.name().value(),
      description: this.occurrenceForm.description().value(),
      coordinates: { latitude: coord.latitude, longitude: coord.longitude },
      confidence: this.confidence(),
    };

    try {
      await firstValueFrom(this.occurrenceService.submit(payload));
      setTimeout(() => this.close(), 1500);
    } catch {
      // error state is set in OccurrenceService
    }
  }

  close() {
    this.modalService.close(this.modalId());
    this.handleClose.emit();
    this.occurrenceService.reset();
    this.occurrenceForm.name().value.set('');
    this.occurrenceForm.description().value.set('');
    this.confidence.set(0.5);
  }
}
