import { Component, computed, inject, signal } from '@angular/core';
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
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalService } from '../../services/modal/modal.service';

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
    ModalComponent,
  ],
})
export class ProfileComponent {
  private readonly userProfileService = inject(UserProfileService);

  private readonly permissionsService = inject(PermissionsService);

  private readonly themeService = inject(UiThemeService);

  private readonly modalService = inject(ModalService);

  protected readonly deleteModalId = 'delete-account';

  readonly isDeleting = signal(false);

  readonly hasDeleteFailed = signal(false);

  readonly deleteWord = $localize`:@@profileDeleteWord:DELETE`;

  readonly typedDeleteWord = signal('');

  readonly isDeleteWordTyped = computed(
    () => this.typedDeleteWord().trim().toUpperCase() === this.deleteWord,
  );

  readonly hasProfileError = computed(
    () => this.userProfileService.profileResource.status() === 'error',
  );

  readonly profile = computed(() =>
    this.hasProfileError()
      ? null
      : this.userProfileService.profileResource.value(),
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

  constructor() {
    this.reloadProfile();
  }

  reloadProfile() {
    this.userProfileService.profileResource.reload();
  }

  async logoutUser() {
    await this.userProfileService.logout();
  }

  openDeleteConfirmation() {
    this.modalService.open(this.deleteModalId, 'compact');
  }

  cancelDelete() {
    if (this.isDeleting()) return;
    this.closeDeleteConfirmation();
  }

  private closeDeleteConfirmation() {
    this.modalService.close(this.deleteModalId);
    this.typedDeleteWord.set('');
    this.hasDeleteFailed.set(false);
  }

  async deleteAccount() {
    if (this.isDeleting()) return;
    this.isDeleting.set(true);
    this.hasDeleteFailed.set(false);
    try {
      await this.userProfileService.deleteAccount();
      this.closeDeleteConfirmation();
    } catch {
      this.hasDeleteFailed.set(true);
    } finally {
      this.isDeleting.set(false);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
