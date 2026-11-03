import { Component } from '@angular/core';
import { ContentContainerComponent } from '../../components/content-container/content-container.component';

export const PRIVACY_CONTACT_EMAIL = 'privacy@skauz.com';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss',
  imports: [ContentContainerComponent],
})
export class PrivacyComponent {
  readonly contactEmail = PRIVACY_CONTACT_EMAIL;
}
