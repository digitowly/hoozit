import { Component, computed, inject } from '@angular/core';
import { ToggleButtonComponent } from '../../components/toggle-button/toggle-button.component';
import { UiThemeService } from '../../services/ui-theme/ui-theme.service';
import { UserDataService } from '../../services/user/user-data/user-data.service';
import { environment } from '../../../environments/environment';
import { ContentContainerComponent } from '../../components/content-container/content-container.component';
import { PermissionsService } from '../../services/permissions/permissions.service';
import { Permission } from '../../services/permissions/permissions.model';

import { IconComponent } from '../../components/icon/icon.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  imports: [ToggleButtonComponent, ContentContainerComponent, IconComponent],
})
export class UserComponent {
  private readonly userDataService = inject(UserDataService);

  private readonly permissionsService = inject(PermissionsService);

  private readonly themeService = inject(UiThemeService);

  readonly user = computed(() => this.userDataService.userResource.value());

  readonly isUserLoading = computed(() =>
    this.userDataService.userResource.isLoading(),
  );

  readonly isThemeToggleChecked = computed(
    () => this.themeService.theme() === 'dark',
  );

  readonly hasSpeciesResourcePermission = toSignal(
    this.permissionsService.hasUserPermissions([Permission.RESOURCE_SUBMIT]),
    { initialValue: false },
  );

  get googleLoginUrl(): string {
    return `${environment.rangoUrl}/user/login/google`;
  }

  async logoutUser() {
    await this.userDataService.logout();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
