import { describe, beforeEach, it, expect, vi } from 'vitest';
import { UserDataService } from './user-data.service';
import { TestBed } from '@angular/core/testing';
import { UserDataResponse } from './user-data.model';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const mockUserResponse: UserDataResponse = {
  email: 'mockuser@mail.com',
  nickname: 'mock',
  image: '',
  role: 'novice',
  account_tier: 'free',
};

describe('UserDataService', () => {
  let service: UserDataService;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(UserDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load user data on initialization', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockUserResponse,
    } as Response);

    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    expect(service.userResource.value()).toEqual(mockUserResponse);
    expect(service.userResource.isLoading()).toBe(false);
  });

  it('should return null on error', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    expect(service.userResource.value()).toBe(null);
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
