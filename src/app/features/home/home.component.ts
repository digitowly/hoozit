import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserProfileService } from '../../services/user/user-data/user-profile.service';
import { ContentContainerComponent } from '../../components/content-container/content-container.component';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [ContentContainerComponent, RouterLink, IconComponent],
})
export class HomeComponent {
  private readonly userProfileService = inject(UserProfileService);

  readonly profile = computed(() =>
    this.userProfileService.profileResource.value(),
  );
  readonly isUserLoading = computed(() =>
    this.userProfileService.profileResource.isLoading(),
  );
}
