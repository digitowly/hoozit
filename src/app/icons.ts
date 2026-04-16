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
    <svg stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M9 19L3.78974 20.7368C3.40122 20.8663 3 20.5771 3 20.1675L3 5.43246C3 5.1742 3.16526 4.94491 3.41026 4.86325L9 3M9 19L15 21M9 19L9 3M15 21L20.5897 19.1368C20.8347 19.0551 21 18.8258 21 18.5675L21 3.83246C21 3.42292 20.5988 3.13374 20.2103 3.26325L15 5M15 21L15 5M15 5L9 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
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
    <svg stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4.271 18.3457C4.271 18.3457 6.50002 15.5 12 15.5C17.5 15.5 19.7291 18.3457 19.7291 18.3457" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'home',
    `
    <svg stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M17 21H7C4.79086 21 3 19.2091 3 17V10.7076C3 9.30887 3.73061 8.01175 4.92679 7.28679L9.92679 4.25649C11.2011 3.48421 12.7989 3.48421 14.0732 4.25649L19.0732 7.28679C20.2694 8.01175 21 9.30887 21 10.7076V17C21 19.2091 19.2091 21 17 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 17H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
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
  iconRegistry.registerIcon(
    'arrow-link',
    `
    <svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M6.00005 19L19 5.99996M19 5.99996V18.48M19 5.99996H6.52005" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'logout',
    `
    <svg stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M12 12H19M19 12L16 15M19 12L16 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M19 6V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'google',
    `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" ><path d="M12.19,10.642V13.9h5.388A5.13,5.13,0,0,1,12.19,18,6,6,0,0,1,12.19,6a5.346,5.346,0,0,1,3.788,1.464l2.576-2.485A9.116,9.116,0,0,0,12.19,2.5a9.5,9.5,0,0,0,0,19c5.483,0,9.12-3.855,9.12-9.283a8.6,8.6,0,0,0-.15-1.575Z"/></svg>
    `,
  );
  iconRegistry.registerIcon(
    'apple',
    `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.49,22.582a4.921,4.921,0,0,1-1.139-1.054A13.94,13.94,0,0,1,5.376,20.2a12.867,12.867,0,0,1-1.631-3.331,12.525,12.525,0,0,1-.681-3.982,7.4,7.4,0,0,1,.918-3.747,5.29,5.29,0,0,1,1.924-2,5.134,5.134,0,0,1,2.6-.77,4.272,4.272,0,0,1,1.035.138c.266.073.587.192.981.339.5.192.778.311.87.339a2.162,2.162,0,0,0,.733.155,2.211,2.211,0,0,0,.591-.119c.133-.046.384-.128.742-.284.353-.128.634-.238.856-.32a7.652,7.652,0,0,1,.962-.239,4.513,4.513,0,0,1,1.052-.045,6.229,6.229,0,0,1,1.777.384,4.791,4.791,0,0,1,2.251,1.8,4.533,4.533,0,0,0-.664.5,5.6,5.6,0,0,0-1.127,1.379,4.673,4.673,0,0,0-.59,2.308,4.727,4.727,0,0,0,.77,2.62,4.881,4.881,0,0,0,1.405,1.408,3.6,3.6,0,0,0,.77.412c-.11.343-.231.678-.371,1.008a13.024,13.024,0,0,1-1.146,2.116c-.395.577-.707,1.008-.943,1.292a5.142,5.142,0,0,1-1.081,1,2.408,2.408,0,0,1-1.33.4,2.941,2.941,0,0,1-.948-.116c-.265-.087-.527-.185-.784-.3a6.41,6.41,0,0,0-.829-.312,4.159,4.159,0,0,0-1.066-.134,4.276,4.276,0,0,0-1.063.132,6.689,6.689,0,0,0-.831.3c-.385.161-.637.266-.783.312a4.081,4.081,0,0,1-.907.16,2.519,2.519,0,0,1-1.362-.412ZM13.769,5.67a3.4,3.4,0,0,1-1.807.4A3.673,3.673,0,0,1,12.209,4.2a5.048,5.048,0,0,1,.916-1.539A4.97,4.97,0,0,1,14.619,1.51a4.227,4.227,0,0,1,1.731-.5,4.166,4.166,0,0,1-.229,1.9,5.438,5.438,0,0,1-.916,1.613,4.629,4.629,0,0,1-1.453,1.154Z"/></svg>`,
  );
  iconRegistry.registerIcon(
    'plus',
    `
    <svg stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M6 12H12M18 12H12M12 12V6M12 12V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
  );
}
