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

@Component({
  selector: 'occurrence-resource',
  imports: [
    FormField,
    AutosuggestComponent,
    ContentContainerComponent,
    FieldContainerComponent,
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

  readonly isSubmitting = signal(false);

  occurrenceResourceForm = form(this.formModel, {});

  autoSuggestEffect = effect(() => {
    this.occurrenceResourceForm.binomialName().value.update(() => {
      return this.speciesAutosuggestService.selectedEntry()?.value || '';
    });
  });

  async onSubmit() {
    const formData = this.formModel();
    console.log({ formData });

    const params: CreateSpeciesResourceParams = {
      binomial_name: formData.binomialName,
      url: formData.url,
      description: 'test',
      type: 'image',
    };

    console.log({ params });

    this.isSubmitting.set(true);
    try {
      await firstValueFrom(
        this.speciesResourceService.createOccurrenceResource(params),
      );
    } catch (e) {
      console.error(e);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
