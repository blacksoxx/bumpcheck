// Never imports demo-lib, but a type from it flows in through main.ts.
import { pending } from './main.js';

export async function label(): Promise<string> {
  const thing = await pending;
  return thing.name;
}
