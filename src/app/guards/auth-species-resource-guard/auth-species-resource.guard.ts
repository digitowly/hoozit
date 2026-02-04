import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PermissionsService } from '../../services/permissions/permissions.service';
import { of, switchMap } from 'rxjs';
import { Permission } from '../../services/permissions/permissions.model';

export const authSpeciesResourceGuard: CanActivateFn = (route, state) => {
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  return permissionsService
    .hasUserPermissions([Permission.RESOURCE_SUBMIT])
    .pipe(
      switchMap((hasPermissions) =>
        hasPermissions ? of(true) : redirectToHome(router),
      ),
    );
};

const redirectToHome = (router: Router) => {
  const homePath = router.parseUrl('/home');
  return of(
    new RedirectCommand(homePath, {
      skipLocationChange: true,
    }),
  );
};
