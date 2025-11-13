import { Component, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'toggle-button',
  imports: [ReactiveFormsModule],
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.scss',
})
export class ToggleButtonComponent {
  isChecked = input(false);
  label = input('');
  disabled = input(false);

  onChange = output<boolean>();
  toggleControl = new FormControl(false);

  constructor() {
    effect(() => {
      this.toggleControl.setValue(this.isChecked(), { emitEvent: false });
    });
  }

  onToggleChange(): void {
    this.onChange.emit(this.toggleControl.value || false);
  }
}
