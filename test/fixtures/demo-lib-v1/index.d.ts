export interface Options {
  retries?: number;
  baseUrl?: string;
}
export declare function configure(opts?: Options): void;
export declare function oldFn(x: string): string;
/** Stable since 0.1. */
export declare function stable(n: number): number;
export declare function fetchThing(id: string): Promise<{ id: string; name: string }>;
export declare function greet(name: string, greeting?: string): string;
export declare class Client {
  private token;
  constructor(opts?: Options);
  get(url: string): Promise<string>;
}
export declare const VERSION: string;
export default Client;
export declare namespace helpers {
  function a(): void;
}
