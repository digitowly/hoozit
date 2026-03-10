export interface PermissionsResponse {
  permissions: string[];
}

export enum Permission {
  RESOURCE_SUBMIT = 'resource:submit',
}
