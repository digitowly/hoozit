import { describe, beforeEach, it, expect, vi } from 'vitest';
import { UserProfileService } from './user-profile.service';
import { TestBed } from '@angular/core/testing';
import { UserResponse } from './user-data.model';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

const mockUserResponse: UserResponse = {
  email: 'mockuser@mail.com',
  nickname: 'mock',
  image: '',
  role: 'novice',
  account_tier: 'free',
};

describe('UserDataService', () => {
  let service: UserProfileService;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(UserProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load user data on initialization', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);

    TestBed.tick();
    httpTesting
      .expectOne((req) => req.url.includes('/user'))
      .flush(mockUserResponse);
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    expect(service.profileResource.value()).toEqual(mockUserResponse);
    expect(service.profileResource.isLoading()).toBe(false);
  });

  it('should return null on error', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);

    TestBed.tick();
    httpTesting
      .expectOne((req) => req.url.includes('/user'))
      .flush('Error', { status: 500, statusText: 'Server Error' });
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    expect(service.profileResource.value()).toBe(null);
  });

  it('should logout the user', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    await service.logout();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/logout'),
      expect.any(Object),
    );
  });
});
