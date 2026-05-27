import { Component, computed, inject } from '@angular/core';
import { UserProfileService } from '../../services/user/user-data/user-profile.service';
import { ContentContainerComponent } from '../../components/content-container/content-container.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [ContentContainerComponent],
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
