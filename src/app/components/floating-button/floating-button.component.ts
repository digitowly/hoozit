import { Component, output } from '@angular/core';

@Component({
  selector: 'floating-button',
  templateUrl: './floating-button.component.html',
  styleUrl: './floating-button.component.scss',
})
export class FloatingButtonComponent {
  click = output();
}
