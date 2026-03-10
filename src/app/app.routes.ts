import { Routes } from '@angular/router';
import { authSpeciesResourceGuard } from './guards/auth-species-resource-guard/auth-species-resource.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('../app/features/home/home.component').then(
        ({ HomeComponent }) => HomeComponent,
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
    path: 'species-resources',
    loadComponent: () =>
      import('./features/species-resource/species-resource.component').then(
        ({ SpeciesResourceComponent }) => SpeciesResourceComponent,
      ),
    canActivate: [authSpeciesResourceGuard],
  },
];
