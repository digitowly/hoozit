import { Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'content-container',
  imports: [],
  templateUrl: './content-container.component.html',
  styleUrl: './content-container.component.scss',
})
export class ContentContainerComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly title = input<string>('');
  readonly hideBackButton = input(false);
  readonly hasPreviousRoute =
    this.router.lastSuccessfulNavigation()?.previousNavigation != null;

  goBack(): void {
    this.location.back();
  }
}
