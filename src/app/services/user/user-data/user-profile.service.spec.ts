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

  it('should return null when profile loading is unauthorized', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);

    TestBed.tick();
    httpTesting
      .expectOne((req) => req.url.includes('/user'))
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    expect(service.profileResource.value()).toBe(null);
  });

  it('should preserve the error state when profile loading fails', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);

    TestBed.tick();
    httpTesting
      .expectOne((req) => req.url.includes('/user'))
      .flush('Error', { status: 500, statusText: 'Server Error' });
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    expect(service.profileResource.error()).toBeTruthy();
  });

  it('should logout the user', async () => {
    const reload = vi.spyOn(service.profileResource, 'reload');
    (fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await service.logout();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/logout'),
      expect.any(Object),
    );
    expect(reload).toHaveBeenCalledOnce();
  });

  it('should reload the user profile when logout returns unauthorized', async () => {
    const reload = vi.spyOn(service.profileResource, 'reload');
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);

    await service.logout();

    expect(reload).toHaveBeenCalledOnce();
  });

  it('should not reload the user profile when logout fails', async () => {
    const reload = vi.spyOn(service.profileResource, 'reload');
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(service.logout()).rejects.toThrow('Logout failed');

    expect(reload).not.toHaveBeenCalled();
  });
});
