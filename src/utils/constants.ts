export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export type UserRole = `${Role}`;

export enum Condition {
    NEW = 'NEW',
    THRIFTED = 'THRIFTED'
}

export type ProductCondition = `${Condition}`;

export enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED'
}

export type OrderStatusType = `${OrderStatus}`;

export interface ErrorObject<T> {
    errors: T;
    isValid: boolean;
};