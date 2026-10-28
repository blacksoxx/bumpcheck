import Client, { configure, oldFn, stable, fetchThing, greet, type Options } from 'demo-lib';

const preExisting: number = 'this error exists in both versions and must cancel out';

export const opts: Options = { retries: 2 };
configure();
export const shouted = oldFn('x');
export const doubled = stable(2);

export async function load(): Promise<string> {
  const thing = await fetchThing('1');
  return thing.name;
}

export const hello = greet('world', 'hi');

export async function body(): Promise<string> {
  const client = new Client(opts);
  const text: string = await client.get('/');
  return text;
}
