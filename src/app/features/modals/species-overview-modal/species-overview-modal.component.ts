import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { SourceLinkComponent } from '../../../components/source-link/source-link.component';
import { SpeciesIntroduction } from '../../../services/species-content/species-content.model';
import { ImageSource } from '../../../model/image';

@Component({
  selector: 'species-overview-modal',
  imports: [ModalComponent, SourceLinkComponent],
  templateUrl: './species-overview-modal.component.html',
  styleUrl: './species-overview-modal.component.scss',
})
export class SpeciesOverviewModalComponent {
  isOpen = input(false);

  isLoading = input(false);

  title = input('');

  introduction = input<SpeciesIntroduction | null>(null);

  handleClose = output();

  get heroImage(): ImageSource | null {
    if (!this.introduction()) return null;
    return {
      url: this.introduction()?.image?.url || '',
      alt: this.introduction()?.image?.description || '',
      origin: this.introduction()?.image?.origin || '',
      photographer: this.introduction()?.image?.photographer || '',
      photographer_url: this.introduction()?.image?.photographer_url || '',
    };
  }
}
