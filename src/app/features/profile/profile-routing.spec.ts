import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { routes } from '../../app.routes';
import { authInterceptor } from '../../interceptors/auth.interceptor';
import { CustomRouteReuseStrategy } from '../../route-reuse-strategy';
import { UserProfileService } from '../../services/user/user-data/user-profile.service';
import { environment } from '../../../environments/environment';

@Component({ template: '' })
class OtherView {}

describe('Profile navigation', () => {
  const profileUrl = `${environment.scoutUrl}/users/me/profile`;
  const permissionsUrl = `${environment.scoutUrl}/user/permissions`;
  const refreshUrl = `${environment.scoutUrl}/auth/refresh/web`;
  const profile = {
    user: {
      id: 'scout-1',
      nickname: 'Scout',
      email: 'scout@example.com',
      role: 'user',
      account_tier: 'free',
    },
    occurrences_count: 2,
  };
  let requests: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'other', component: OtherView, data: { reuse: true } },
          ...routes,
        ]),
        { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
      ],
    });
    requests = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create('/other');
    TestBed.inject(UserProfileService);
    TestBed.tick();
  });

  afterEach(() => requests.verify());

  async function settle() {
    await TestBed.inject(ApplicationRef).whenStable();
    harness.detectChanges();
  }

  it('recovers from an earlier unauthorized profile and reloads on every visit', async () => {
    requests
      .expectOne(profileUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    requests
      .expectOne(refreshUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    await settle();

    await harness.navigateByUrl('/user');
    TestBed.tick();
    requests.expectOne(profileUrl).flush(profile);
    requests.expectOne(permissionsUrl).flush({ permissions: [] });
    await settle();
    expect(harness.routeNativeElement?.textContent).toContain('Scout');
    expect(harness.routeNativeElement?.querySelector('login')).toBeNull();

    await harness.navigateByUrl('/other');
    await harness.navigateByUrl('/user');
    TestBed.tick();
    requests.expectOne(profileUrl).flush({
      ...profile,
      user: { ...profile.user, nickname: 'Updated Scout' },
    });
    requests.expectOne(permissionsUrl).flush({ permissions: [] });
    await settle();
    expect(harness.routeNativeElement?.textContent).toContain('Updated Scout');
  });

  it('shows a retry instead of login when session refresh is unavailable', async () => {
    requests.expectOne(profileUrl).flush(profile);
    await settle();
    await harness.navigateByUrl('/user');
    TestBed.tick();
    requests.expectOne(permissionsUrl).flush({ permissions: [] });
    requests
      .expectOne(profileUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    requests
      .expectOne(refreshUrl)
      .flush(null, { status: 503, statusText: 'Unavailable' });
    await settle();
    expect(harness.routeNativeElement?.querySelector('login')).toBeNull();
    expect(harness.routeNativeElement?.textContent).toContain(
      "Couldn't load your profile",
    );

    harness.routeNativeElement
      ?.querySelector<HTMLButtonElement>('[role="alert"] button')
      ?.click();
    TestBed.tick();
    requests.expectOne(profileUrl).flush(profile);
    await settle();
    expect(harness.routeNativeElement?.textContent).toContain('Scout');
  });
});
