export interface Options {
  retries?: number;
  baseUrl?: string;
}
/** Now required. */
export declare function configure(opts: Options): void;
/**
 * Stable since 0.1.
 * Doc comment changed only; this must read as unchanged.
 */
export declare function stable(n: number): number;
export declare function fetchThing(id: string): Promise<{ id: string; title: string }>;
export declare function greet(name: string, options?: { greeting: string }): string;
export declare class Client {
  private token;
  constructor(opts?: Options);
  get(url: string): Promise<{ body: string }>;
}
export declare const VERSION: string;
export declare function newFn(): void;
export default Client;
export declare namespace helpers {
  function a(): void;
  function b(): void;
}
