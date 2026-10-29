// Outside tsconfig's include; neither tsc nor bumpcheck checks it, and the report must say so.
import { oldFn } from 'demo-lib';

console.log(oldFn('x'));
