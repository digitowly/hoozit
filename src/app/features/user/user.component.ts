import { Component } from '@angular/core';
import { UserProfileService } from './services/user-profile/user-profile.service';

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  constructor(public user: UserProfileService) {
    user.get();
  }
}
