import { beforeEach, describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { authSpeciesResourceGuard } from './auth-species-resource.guard';
import { PermissionsService } from '../../services/permissions/permissions.service';
import { firstValueFrom, of } from 'rxjs';
import { Permission } from '../../services/permissions/permissions.model';

describe('authSpeciesGuard', () => {
  let permissionsServiceMock: any;
  let routerMock: any;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      authSpeciesResourceGuard(...guardParameters),
    );

  beforeEach(() => {
    permissionsServiceMock = {
      hasUserPermissions: vi.fn(),
    };
    routerMock = {
      parseUrl: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PermissionsService, useValue: permissionsServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access if RESOURCE_SUBMIT permission is present', async () => {
    permissionsServiceMock.hasUserPermissions.mockReturnValue(of(true));

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
    );

    const res = await firstValueFrom(result as any);
    expect(res).toBe(true);
    expect(permissionsServiceMock.hasUserPermissions).toHaveBeenCalledWith([
      Permission.RESOURCE_SUBMIT,
    ]);
  });

  it('should redirect to /home if RESOURCE_SUBMIT permission is missing', async () => {
    permissionsServiceMock.hasUserPermissions.mockReturnValue(of(false));
    const mockUrlTree = {} as UrlTree;
    routerMock.parseUrl.mockReturnValue(mockUrlTree);

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
    );

    const res = await firstValueFrom(result as any);
    expect(res).toBeInstanceOf(RedirectCommand);
    const redirectCommand = res as RedirectCommand;
    expect(redirectCommand.redirectTo).toBe(mockUrlTree);
    expect(routerMock.parseUrl).toHaveBeenCalledWith('/home');
  });
});
