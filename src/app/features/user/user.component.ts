import { Component } from '@angular/core';
import { UserProfileService } from './services/user-profile/user-profile.service';
import { ToggleButtonComponent } from '../../components/toggle-button/toggle-button.component';
import { UiThemeService } from '../../services/ui-theme/ui-theme.service';

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  imports: [ToggleButtonComponent],
})
export class UserComponent {
  constructor(
    public user: UserProfileService,
    public theme: UiThemeService,
  ) {
    user.get();
  }

  toggleTheme(isDark: boolean) {
    this.theme.toggleTheme();
  }
}
