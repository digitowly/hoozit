import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OccurrenceSearchComponent } from './features/search/components/occurrence-search/occurrence-search.component';

@Component({
  selector: 'app-root',
  imports: [FormsModule, OccurrenceSearchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
