import { connect, version } from 'demo-ambient';

export const ready = connect('mongodb://localhost');
export const v: string = version;
