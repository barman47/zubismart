export enum Role {
    ADMIN = 'ADMIN',
    ADMISSION_OFFICER = 'ADMISSION_OFFICER',
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER',
    FORM_TEACHER = 'FORM_TEACHER',
    RECTOR = 'RECTOR',
}

export type UserRole = `${Role}`;

export enum Classes {
    JS1 = 'JS1',
    JS2 = 'JS2',
    JS3 = 'JS3',
    SS1 = 'SS1',
    SS2 = 'SS2',
    SS3 = 'SS3',
}

export type StudentClass = `${Classes}`;

export enum Terms {
    FIRST_TERM = 'FIRST TERM',
    SECOND_TERM = 'SECOND TERM',
    THIRD_TERM = 'THIRD TERM',
}

export type Term = `${Terms}`;

export enum UserStatus {
    PRESENT = 'PRESENT',
    TRANSFERRED = 'TRANSFERRED',
    GRADUATED = 'GRADUATED',
};

export type UserStatusType = `${UserStatus}`;

export enum ClassCategories {
    JUNIOR_CLASS = 'JUNIOR CLASS',
    SENIOR_CLASS = 'SENIOR CLASS'
}

export type Categories = `${ClassCategories}`;

export enum EntranceClass {
    JS1 = 'JS1',
    Others = 'OTHERS'
}

export type EntranceClasses = `${EntranceClass}`;

export enum SubjectCategories {
    GENERAL = 'GENERAL',
    BASIC_SCIENCE = 'BASIC SCIENCE & TECHNOLOGY',
    NIGERIAN_LANGUAGES = 'NIGERIAN LANGUAGES',
    RELIGIUOUS_VALUES = 'RELIGIOUS & NATIONAL VALUES',
    CCA = 'CULTURAL & CREATIVE ARTS',
    PREVOCATION = 'PRE-VOCATIONAL STUDIES'
}

export type SubjectCategory = `${SubjectCategories}`;

export enum ResultType {
    ANNUAL = 'ANNUAL',
    TERMLY = 'TERMLY'
}

export enum Genders {
    MALE = 'MALE',
    FEMALE = 'FEMALE'
}

export type Gender = `${Genders}`;

export type ResultTypes = `${ResultType}`;

export interface ErrorObject<T> {
    errors: T;
    isValid: boolean;
};

export interface ExamSubject {
    grade: string;
    score: number;
}

export const PIN_USAGE_COUNT = 3;

export interface TermlyResult {
    student: string;
    type: ResultType;
    session: string;
    term: Term;
    class: StudentClass;
    vacation: string;
    resumption: string;
    daysOpened: number;
    average: number; 
    total: number;
    position: string;
    numberOfSubjects: number;
    numberInClass: number;
    createdBy: string;
}