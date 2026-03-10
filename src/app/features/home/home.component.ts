import { Component, computed, inject } from '@angular/core';
import { UserDataService } from '../../services/user/user-data/user-data.service';
import { ContentContainerComponent } from '../../components/content-container/content-container.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [ContentContainerComponent],
})
export class HomeComponent {
  private readonly userDataService = inject(UserDataService);

  readonly user = computed(() => this.userDataService.userResource.value());
  readonly isUserLoading = computed(() => this.userDataService.userResource.isLoading());
}
