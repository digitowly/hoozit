import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PermissionsService } from './permissions.service';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Permission } from './permissions.model';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PermissionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check user permissions', async () => {
    const hasPermissions$ = service.hasUserPermissions([
      Permission.RESOURCE_SUBMIT,
    ]);

    const resultPromise = firstValueFrom(hasPermissions$);

    const req = httpMock.expectOne((request) =>
      request.url.endsWith('user/permissions'),
    );

    expect(req.request.method).toBe('GET');

    req.flush({ permissions: ['mock:permission', 'resource:submit'] });

    expect(await resultPromise).toBeTruthy();
  });

  it('should handle errors', async () => {
    const hasPermissions$ = service.hasUserPermissions([
      Permission.RESOURCE_SUBMIT,
    ]);

    const resultPromise = firstValueFrom(hasPermissions$);

    const req = httpMock.expectOne((request) =>
      request.url.endsWith('user/permissions'),
    );

    expect(req.request.method).toBe('GET');

    req.flush(null, {
      status: 500,
      statusText: 'Server Error',
    });

    expect(await resultPromise).toBeFalsy();
  });
});
