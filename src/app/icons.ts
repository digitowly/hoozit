import { IconRegistryService } from './services/icon-registry/icon-registry.service';

export function registerIcons(iconRegistry: IconRegistryService) {
  iconRegistry.registerIcon(
    'search',
    `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor"/><line x1="20.4" y1="20.5" x2="15.5" y2="15.7" stroke="currentColor"/></svg>
    `,
  );
  iconRegistry.registerIcon(
    'cross',
    `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"  stroke="currentColor" stroke-miterlimit="10"/><line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" stroke-miterlimit="10"/></svg>
    `,
  );
  iconRegistry.registerIcon(
    'map',
    `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" fill="none" stroke="currentColor" stroke-miterlimit="10"/><line x1="8" y1="2" x2="8" y2="18" stroke="currentColor" stroke-miterlimit="10"/><line x1="16" y1="6" x2="16" y2="22" stroke="currentColor" stroke-miterlimit="10"/></svg>
    `,
  );
  iconRegistry.registerIcon(
    'map-arrow',
    `
    <svg stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M4.03132 8.91684L19.508 4.58337C19.8835 4.47824 20.2294 4.82421 20.1243 5.19967L15.7908 20.6763C15.6642 21.1284 15.0407 21.1726 14.8517 20.7429L11.6034 13.3605C11.5531 13.246 11.4616 13.1546 11.3471 13.1042L3.96477 9.85598C3.53507 9.66692 3.57926 9.04342 4.03132 8.91684Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'user',
    `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="4" fill="none" stroke="currentColor"/><polyline points="4.5 21 4.5 17 7.5 14 12 15.5 16.5 14 19.5 17 19.5 21" fill="none" stroke="currentColor"/></svg>
    `,
  );
  iconRegistry.registerIcon(
    'home',
    `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1,11,12,2l11,9" fill="none" stroke="currentColor"/><path d="M20,8.5V22H4V8.5" fill="none" stroke="currentColor"/><polyline points="9.5 22 9.5 14 14.5 14 14.5 22" fill="none" stroke="currentColor"/></svg>
    `,
  );
  iconRegistry.registerIcon(
    'arrow-left',
    `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="10 5 3 12 10 19" fill="none" stroke="currentColor" stroke-miterlimit="10"/><line x1="3" y1="12" x2="22" y2="12" stroke="currentColor" stroke-miterlimit="10"/></svg>
    `,
  );
  iconRegistry.registerIcon(
    'chevron',
    `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="9 19 16 12 9 5" fill="none" stroke="currentColor" stroke-miterlimit="10"/></svg>
      `,
  );
}
