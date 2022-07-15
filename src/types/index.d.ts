import { User } from '../models/User';

// declare namespace Express {
//     export interface Request {
//         user: User;
//     }
//     export interface Response {
//         user: User;
//     }
// }

export {};

declare global {
    namespace Express {
        export interface Request {
            user: User;
        }
        export interface Response {
            user: User;
        }
    }
}