import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('../app/features/user/user.component').then(
        ({ UserComponent }) => UserComponent,
      ),
    data: { reuse: true },
  },
  {
    path: 'map',
    loadComponent: () =>
      import('../app/features/map-view/map-view.component').then(
        ({ MapViewComponent }) => MapViewComponent,
      ),
    data: { reuse: true },
  },
  {
    path: 'user',
    loadComponent: () =>
      import('../app/features/user/user.component').then(
        ({ UserComponent }) => UserComponent,
      ),
    data: { reuse: true },
  },
  {
    path: 'occurrence-resources',
    loadComponent: () =>
      import('../app/features/occurrence-resource/occurrence-resource.component').then(
        ({ OccurrenceResourceComponent }) => OccurrenceResourceComponent,
      ),
  },
];
