import { Component, inject } from '@angular/core';
import { OccurrenceSearchComponent } from '../search/components/occurrence-search/occurrence-search.component';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'navigation',
  imports: [OccurrenceSearchComponent, RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  public readonly router = inject(Router);
}
