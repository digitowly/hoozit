import { Routes } from "@angular/router";
import { authSpeciesResourceGuard } from "./guards/auth-species-resource-guard/auth-species-resource.guard";

export const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  {
    path: "home",
    loadComponent: () =>
      import("../app/features/home/home.component").then(
        ({ HomeComponent }) => HomeComponent,
      ),
    data: { reuse: true },
  },
  {
    path: "map",
    loadComponent: () =>
      import("../app/features/map-view/map-view.component").then(
        ({ MapViewComponent }) => MapViewComponent,
      ),
    data: { reuse: true },
  },
  {
    path: "user",
    loadComponent: () =>
      import("./features/profile/profile.component").then(
        ({ ProfileComponent }) => ProfileComponent,
      ),
  },
  {
    path: "user/occurrence/:id",
    loadComponent: () =>
      import("../app/features/occurrence/occurrence-view/occurrence-view.component").then(
        ({ OccurrenceViewComponent }) => OccurrenceViewComponent,
      ),
  },
  {
    path: "user/occurrences",
    loadComponent: () =>
      import("../app/features/occurrence/occurrences-view/occurrences-view.component").then(
        ({ OccurrencesViewComponent }) => OccurrencesViewComponent,
      ),
  },
  {
    path: "signup",
    loadComponent: () =>
      import("./features/signup/signup.component").then(
        ({ SignupComponent }) => SignupComponent,
      ),
  },
  {
    path: "signup/check-inbox",
    loadComponent: () =>
      import("./features/signup/check-inbox/check-inbox.component").then(
        ({ CheckInboxComponent }) => CheckInboxComponent,
      ),
  },
  {
    path: "privacy",
    loadComponent: () =>
      import("./features/privacy/privacy.component").then(
        ({ PrivacyComponent }) => PrivacyComponent,
      ),
  },
  {
    path: "species-resources",
    loadComponent: () =>
      import("./features/species-resource/species-resource.component").then(
        ({ SpeciesResourceComponent }) => SpeciesResourceComponent,
      ),
    canActivate: [authSpeciesResourceGuard],
  },
];
