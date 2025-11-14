import { describe, beforeEach, it, expect, afterEach } from 'vitest';
import { UserProfileService } from './user-profile.service';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserProfileResponse } from './user-profile.model';
import { provideZonelessChangeDetection } from '@angular/core';

const mockUserResponse: UserProfileResponse = {
  email: 'mockuser@mail.com',
  nickname: 'mock',
  image: '',
  expertise_tier: 'novice',
  account_tier: 'free',
};

describe('UserProfileService', () => {
  let service: UserProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(UserProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set isLoading to true when get is called and false when complete', () => {
    expect(service.isLoading()).toBe(false);
    service.get();
    expect(service.isLoading()).toBe(true);

    const req = httpMock.expectOne('http://localhost:8000/user');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush(mockUserResponse);
    expect(service.data()).toEqual(mockUserResponse);
  });

  it('should return an error', () => {
    service.get();

    const req = httpMock.expectOne('http://localhost:8000/user');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.error(new ProgressEvent('Network error'), { status: 0 });
    expect(service.data()).toEqual(null);
    expect(service.error()).toBe('Network error: Please check your connection');
  });

  it('should logout the user', () => {
    service.logout();

    const req = httpMock.expectOne('http://localhost:8000/user/logout');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(service.data()).toEqual(null);
  });
});
