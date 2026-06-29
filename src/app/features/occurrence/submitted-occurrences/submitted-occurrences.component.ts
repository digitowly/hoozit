import { Component, computed, inject } from '@angular/core';
import { UserOccurrencesService } from '../../../services/occurrence/user-occurrences/user-occurrences.service';
import { Occurrence } from '../../../services/occurrence/occurrence.model';
import { IconComponent } from '../../../components/icon/icon.component';
import { TooltipDirective } from '../../../components/tooltip/tooltip.directive';

@Component({
  selector: 'submitted-occurrences',
  imports: [IconComponent, TooltipDirective],
  templateUrl: './submitted-occurrences.component.html',
  styleUrl: './submitted-occurrences.component.scss',
})
export class SubmittedOccurrencesComponent {
  private readonly userOccurrencesService = inject(UserOccurrencesService);

  protected readonly occurrences = computed<Occurrence[]>(
    () => this.userOccurrencesService.resource.value() || [],
  );
}
