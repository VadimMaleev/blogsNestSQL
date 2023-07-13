import { UserClass } from './types';

declare global {
  declare namespace Express {
    export interface Request {
      user: UserClass | null;
    }
  }
}
