import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('../app/features/user/user.component').then(
        (m) => m.UserComponent,
      ),
    data: { reuse: true },
  },
  {
    path: 'map',
    loadComponent: () =>
      import('../app/features/map-view/map-view.component').then(
        (m) => m.MapViewComponent,
      ),
    data: { reuse: true },
  },
  {
    path: 'user',
    loadComponent: () =>
      import('../app/features/user/user.component').then(
        (m) => m.UserComponent,
      ),
    data: { reuse: true },
  },
];
