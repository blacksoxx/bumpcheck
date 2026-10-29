declare module 'demo-ambient' {
  export function connect(uri: string, options: { timeout: number }): Promise<void>;
  export const version: string;
}
