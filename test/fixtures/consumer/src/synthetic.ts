// demo-lib/extra has no default export; esModuleInterop synthesizes one.
import extraModule from 'demo-lib/extra';

export const viaDefault = extraModule.extra();
