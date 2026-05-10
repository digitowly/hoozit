import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import {
  CreateSpeciesResourceParams,
  SpeciesResourceService,
} from './service/species-resource.service';
import { firstValueFrom } from 'rxjs';
import { AutosuggestComponent } from '../../components/autosuggest/autosuggest.component';
import { AutoSuggestEntry } from '../../components/autosuggest/autosuggest.model';
import { SpeciesAutosuggestService } from '../../services/forms/species-autosuggest/species-autosuggest.service';
import { ContentContainerComponent } from '../../components/content-container/content-container.component';
import { FieldContainerComponent } from '../../components/forms/field-container/field-container.component';
import { FormContainerComponent } from '../../components/forms/form-container/form-container.component';
import { SubmissionState } from './species-resource.model';

@Component({
  selector: 'occurrence-resource',
  imports: [
    FormField,
    AutosuggestComponent,
    ContentContainerComponent,
    FieldContainerComponent,
    FormContainerComponent,
  ],
  templateUrl: './species-resource.component.html',
  styleUrl: './species-resource.component.scss',
})
export class SpeciesResourceComponent {
  private readonly speciesResourceService = inject(SpeciesResourceService);

  private readonly speciesAutosuggestService = inject(
    SpeciesAutosuggestService,
  );

  readonly speciesEntries = computed(() =>
    this.speciesAutosuggestService.speciesEntries(),
  );

  private readonly selectedBinomialName = signal('');

  readonly formModel = signal({ url: '', type: 'image' });
  readonly speciesResourceForm = form(this.formModel, {});
  readonly submissionState = signal<SubmissionState>(SubmissionState.INITIAL);

  readonly isSubmittable = computed(() => {
    if (this.submissionState() === SubmissionState.LOADING) return false;
    return (
      this.selectedBinomialName() !== '' &&
      this.speciesResourceForm.url().value().length > 0
    );
  });

  onAutoSuggestChange(input: string) {
    this.speciesAutosuggestService.onChange(input);
    const entry = this.speciesAutosuggestService.selectedEntry();
    if (entry) {
      this.selectedBinomialName.set(entry.value ?? '');
    } else {
      this.selectedBinomialName.set('');
    }
  }

  onAutoSuggestSelect(entry: AutoSuggestEntry) {
    this.selectedBinomialName.set(entry.value ?? '');
  }

  async onSubmit() {
    if (!this.isSubmittable()) {
      this.submissionState.set(SubmissionState.ERROR);
      return;
    }
    const params: CreateSpeciesResourceParams = {
      binomial_name: this.selectedBinomialName(),
      url: this.speciesResourceForm.url().value(),
      description: 'test',
      type: 'image',
    };

    this.submissionState.set(SubmissionState.LOADING);
    try {
      await firstValueFrom(
        this.speciesResourceService.createOccurrenceResource(params),
      );
      this.submissionState.set(SubmissionState.SUCCESS);
    } catch (e) {
      console.error(e);
      this.submissionState.set(SubmissionState.ERROR);
    } finally {
      this.speciesResourceForm.url().value.set('');
    }
  }

  protected readonly SubmissionState = SubmissionState;
}
