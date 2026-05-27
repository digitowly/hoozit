import { Component, computed, inject } from '@angular/core';
import { ToggleButtonComponent } from '../../components/toggle-button/toggle-button.component';
import { UiThemeService } from '../../services/ui-theme/ui-theme.service';
import { UserProfileService } from '../../services/user/user-data/user-profile.service';
import { ContentContainerComponent } from '../../components/content-container/content-container.component';
import { PermissionsService } from '../../services/permissions/permissions.service';
import { Permission } from '../../services/permissions/permissions.model';
import { IconComponent } from '../../components/icon/icon.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'user',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  imports: [
    ToggleButtonComponent,
    ContentContainerComponent,
    IconComponent,
    RouterLink,
    LoginComponent,
  ],
})
export class ProfileComponent {
  private readonly userProfileService = inject(UserProfileService);

  private readonly permissionsService = inject(PermissionsService);

  private readonly themeService = inject(UiThemeService);

  readonly profile = computed(() =>
    this.userProfileService.profileResource.value(),
  );

  readonly isProfileLoading = computed(() =>
    this.userProfileService.profileResource.isLoading(),
  );

  readonly isThemeToggleChecked = computed(
    () => this.themeService.theme() === 'dark',
  );

  readonly hasSpeciesResourcePermission = toSignal(
    this.permissionsService.hasUserPermissions([Permission.RESOURCE_SUBMIT]),
    { initialValue: false },
  );

  async logoutUser() {
    await this.userProfileService.logout();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
