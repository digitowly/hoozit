import { Component, computed, effect, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import {
  CreateSpeciesResourceParams,
  SpeciesResourceService,
} from './service/species-resource.service';
import { firstValueFrom } from 'rxjs';
import { AutosuggestComponent } from '../../components/autosuggest/autosuggest.component';
import { AnimalSearchService } from '../../services/animal-search/animal-search.service';
import { AutoSuggestEntry } from '../../components/autosuggest/autosuggest.model';
import { AnimalSearchResult } from '../../services/animal-search/animal-search.model';
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

  readonly formModel = signal({
    binomialName: '',
    url: '',
    type: 'image',
  });

  onAutoSuggestChange(input: string) {
    this.speciesAutosuggestService.onChange(input);
  }

  readonly submissionState = signal<
    'initial' | 'loading' | 'success' | 'error'
  >('initial');

  readonly isSubmittable = computed(() => {
    if (this.submissionState() === 'loading') return false;
    return (
      this.formModel().binomialName !== '' && this.formModel().url.length > 0
    );
  });

  speciesResourceForm = form(this.formModel, {});

  autoSuggestEffect = effect(() => {
    this.speciesResourceForm.binomialName().value.update(() => {
      return this.speciesAutosuggestService.selectedEntry()?.value || '';
    });
  });

  async onSubmit() {
    if (!this.isSubmittable()) {
      this.submissionState.set('error');
      return;
    }
    const formData = this.formModel();
    console.log({ formData });

    const params: CreateSpeciesResourceParams = {
      binomial_name: formData.binomialName,
      url: formData.url,
      description: 'test',
      type: 'image',
    };

    console.log({ params });

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
