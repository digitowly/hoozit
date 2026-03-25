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

  readonly submissionState = signal<'initial' | 'loading' | 'success' | 'error'>('initial');

  readonly isSubmittable = computed(() => {
    if (this.submissionState() === 'loading') return false;
    return (
      this.selectedBinomialName() !== '' &&
      this.speciesResourceForm.url().value().length > 0
    );
  });

  onAutoSuggestChange(input: string) {
    this.speciesAutosuggestService.onChange(input);
  }

  onAutoSuggestSelect(entry: AutoSuggestEntry) {
    this.selectedBinomialName.set(entry.value ?? '');
  }

  async onSubmit() {
    if (!this.isSubmittable()) {
      this.submissionState.set('error');
      return;
    }
    const params: CreateSpeciesResourceParams = {
      binomial_name: this.selectedBinomialName(),
      url: this.speciesResourceForm.url().value(),
      description: 'test',
      type: 'image',
    };

    this.submissionState.set('loading');
    try {
      await firstValueFrom(
        this.speciesResourceService.createOccurrenceResource(params),
      );
      this.submissionState.set('success');
    } catch (e) {
      console.error(e);
      this.submissionState.set('error');
    } finally {
      this.speciesResourceForm.url().value.set('');
    }
  }
}
