import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationComponent } from './features/navigation/navigation.component';
import { RouterOutlet } from '@angular/router';
import { IconRegistryService } from './services/icon-registry/icon-registry.service';
import { registerIcons } from './icons';

@Component({
  selector: 'app-root',
  imports: [FormsModule, NavigationComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(iconRegistry: IconRegistryService) {
    registerIcons(iconRegistry);
  }
}
