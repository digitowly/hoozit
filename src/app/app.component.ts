import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationComponent } from './features/navigation/navigation.component';
import { RouterOutlet } from '@angular/router';
import { IconRegistryService } from './services/icon-registry/icon-registry.service';
import { registerIcons } from './icons';
import { BannerComponent } from './components/banner/banner.component';
import { GlobalBannerService } from './services/banner/global-banner.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, NavigationComponent, RouterOutlet, BannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(
    iconRegistry: IconRegistryService,
    private readonly globalBannerService: GlobalBannerService,
  ) {
    registerIcons(iconRegistry);
  }

  get globalBannerMessage() {
    return this.globalBannerService.message;
  }

  get globalBannerVariant() {
    return this.globalBannerService.variant;
  }
}
