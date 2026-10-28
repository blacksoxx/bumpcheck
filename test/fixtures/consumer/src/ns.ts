import * as lib from 'demo-lib';

export const one = lib.stable(1);
export const version: string = lib.VERSION;

function takesWholeModule(m: unknown): void {
  void m;
}
takesWholeModule(lib);
