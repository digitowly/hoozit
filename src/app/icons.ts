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
  iconRegistry.registerIcon(
    'add-pin',
    `
    <svg stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M16 9.2C16 13.1765 9 20 9 20C9 20 2 13.1765 2 9.2C2 5.22355 5.13401 2 9 2C12.866 2 16 5.22355 16 9.2Z" stroke="currentColor" stroke-width="1.5"></path><path d="M9 10C9.55228 10 10 9.55228 10 9C10 8.44772 9.55228 8 9 8C8.44772 8 8 8.44772 8 9C8 9.55228 8.44772 10 9 10Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 19H19M22 19H19M19 19V16M19 19V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'mail',
    `
    <svg stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M7 9L12 12.5L17 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 17V7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17Z" stroke="currentColor" stroke-width="1.5"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'pencil',
    `
    <svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'trash',
    `
    <svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M20 9L18.005 20.3463C17.8369 21.3026 17.0062 22 16.0353 22H7.96474C6.99379 22 6.1631 21.3026 5.99496 20.3463L4 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 6L15.375 6M3 6L8.625 6M8.625 6V4C8.625 2.89543 9.52043 2 10.625 2H13.375C14.4796 2 15.375 2.89543 15.375 4V6M8.625 6L15.375 6" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'reload',
    `
    <svg stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M21.8883 13.5C21.1645 18.3113 17.013 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C16.1006 2 19.6248 4.46819 21.1679 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 8H21.4C21.7314 8 22 7.73137 22 7.4V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'binoculars',
    `
    <svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M21.5 14L20 9C20 9 19.5 7 17.5 7C17.5 7 17.5 5 15.5 5C13.5 5 13.5 7 13.5 7H10.5C10.5 7 10.5 5 8.5 5C6.5 5 6.5 7 6.5 7C4.5 7 4 9 4 9L2.5 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6 20C8.20914 20 10 18.2091 10 16C10 13.7909 8.20914 12 6 12C3.79086 12 2 13.7909 2 16C2 18.2091 3.79086 20 6 20Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18 20C20.2091 20 22 18.2091 22 16C22 13.7909 20.2091 12 18 12C15.7909 12 14 13.7909 14 16C14 18.2091 15.7909 20 18 20Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 16C13.1046 16 14 15.1046 14 14C14 12.8954 13.1046 12 12 12C10.8954 12 10 12.8954 10 14C10 15.1046 10.8954 16 12 16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'clock',
    `
    <svg stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M12 6L12 12L18 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'eye-open',
    `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" stroke-width="1.5"><path d="M3 13C6.6 5 17.4 5 21 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 17C10.3431 17 9 15.6569 9 14C9 12.3431 10.3431 11 12 11C13.6569 11 15 12.3431 15 14C15 15.6569 13.6569 17 12 17Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
  iconRegistry.registerIcon(
    'eye-closed',
    `
    <svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M19.5 16L17.0248 12.6038" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 17.5V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4.5 16L6.96895 12.6124" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 8C6.6 16 17.4 16 21 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    `,
  );
}
