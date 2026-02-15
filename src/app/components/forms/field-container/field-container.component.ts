import { Component, input } from '@angular/core';

@Component({
  selector: 'field-container',
  imports: [],
  templateUrl: './field-container.component.html',
  styleUrl: './field-container.component.scss',
})
export class FieldContainerComponent {
  readonly label = input('');
  readonly name = input('');
}
