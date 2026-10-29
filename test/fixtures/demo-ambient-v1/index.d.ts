declare module 'demo-ambient' {
  export function connect(uri: string): Promise<void>;
  export const version: string;
}
