import { Component, input } from '@angular/core';

@Component({
  selector: 'form-container',
  imports: [],
  templateUrl: './form-container.component.html',
  styleUrl: './form-container.component.scss',
})
export class FormContainerComponent {
  readonly title = input('');
}
