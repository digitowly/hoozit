import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../app/features/map/map.component').then((m) => m.MapComponent),
  },
  {
    path: 'user',
    loadComponent: () =>
      import('../app/features/user/user.component').then(
        (m) => m.UserComponent
      ),
  },
];
