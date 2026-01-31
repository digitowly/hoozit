import { Component, computed, inject } from '@angular/core';
import { ToggleButtonComponent } from '../../components/toggle-button/toggle-button.component';
import { UiThemeService } from '../../services/ui-theme/ui-theme.service';
import { UserDataService } from '../../services/user/user-data/user-data.service';

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  imports: [ToggleButtonComponent],
})
export class UserComponent {
  private readonly userDataService = inject(UserDataService);
  private readonly themeService = inject(UiThemeService);

  user = computed(() => this.userDataService.userResource.value());
  isUserLoading = computed(() => this.userDataService.userResource.isLoading());

  isThemeToggleChecked = computed(() => this.themeService.theme() === 'dark');

  async logoutUser() {
    await this.userDataService.logout();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
