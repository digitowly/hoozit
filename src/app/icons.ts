import { IconRegistryService } from './services/icon-registry/icon-registry.service';

export function registerIcons(iconRegistry: IconRegistryService) {
  iconRegistry.registerIcon(
    'search',
    `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor"/><line x1="20.4" y1="20.5" x2="15.5" y2="15.7" fill="none" stroke="currentColor"/></svg>
    `,
  );
  iconRegistry.registerIcon(
    'cross',
    `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19" fill="currentColor" stroke="#000" stroke-miterlimit="10"/><line x1="5" y1="5" x2="19" y2="19" fill="currentColor" stroke="#000" stroke-miterlimit="10"/></svg>
    `,
  );
}
