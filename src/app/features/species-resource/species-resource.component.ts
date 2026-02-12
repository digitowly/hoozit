import { Component, computed, inject, signal } from '@angular/core';
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

@Component({
  selector: 'occurrence-resource',
  imports: [FormField, AutosuggestComponent],
  templateUrl: './species-resource.component.html',
  styleUrl: './species-resource.component.scss',
})
export class SpeciesResourceComponent {
  private readonly animalSearchService = inject(AnimalSearchService);

  readonly speciesEntries = computed(
    () =>
      this.animalSearchService.resource
        .value()
        ?.data?.map(this.mapToAutoSuggestEntry) || [],
  );

  private readonly speciesResourceService = inject(SpeciesResourceService);

  formModel = signal({
    binomialName: '',
    url: '',
    type: 'image',
  });

  onAutoSuggestChange(input: string) {
    console.log(input);
    this.animalSearchService.searchAnimals(input);
    const entry = this.speciesEntries().find(
      (e) => e.label.toLowerCase() === input.toLowerCase(),
    );
    if (entry) {
      this.formModel.update((o) => ({ ...o, binomialName: entry.value }));
    }
  }

  private mapToAutoSuggestEntry(species: AnimalSearchResult): AutoSuggestEntry {
    return {
      label: species.name,
      value: species.binomial_name,
      icon: species.thumbnail,
    };
  }

  readonly isSubmitting = signal(false);

  occurrenceResourceForm = form(this.formModel);

  async onSubmit() {
    const formData = this.formModel();
    console.log({ formData });

    const params: CreateSpeciesResourceParams = {
      binomialName: formData.binomialName,
      url: formData.url,
      description: 'test',
      type: 'image',
    };

    console.log({ params });

    //
    // this.isSubmitting.set(true);
    // try {
    //   await firstValueFrom(
    //     this.speciesResourceService.createOccurrenceResource(params),
    //   );
    // } catch (e) {
    //   // error
    // } finally {
    //   this.isSubmitting.set(false);
    // }
  }
}
