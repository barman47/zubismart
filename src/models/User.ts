import { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { Gender, Genders, Role, Classes, StudentClass, UserRole, UserStatus } from '../utils/constants';

export interface PastClass {
    session: string;
    pastClass: StudentClass;
}

export interface SubjectTaught {
    _id?: string;
    selectedClass: StudentClass;
    subject: string;
    staffId: string;
}

export interface User extends Document {
    _id?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    admissionNumber?: string;
    password?: string;
    confirmPassword?: string;
    address?: String,
    phone?: String,
    disabled?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    lastSeen?: Date;
    avatar?: string;
    avatarKey?: string;
    subjectsTaught?: SubjectTaught[];
    currentClass?: StudentClass;
    pastClasses?: PastClass[];
    classOwned?: StudentClass; 
    gender: Gender;
    role: UserRole;
    status: UserStatus;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    matchPassword(password: string): boolean;
    getResetPasswordToken(): string;
}

const UserSchema = new Schema<User>({
    email: {
        type: String,
        required: [true, 'Email address is required!'],
        lowecase: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address!'],
        trim: true
    },

    firstName: {
        type: String,
        uppercase: true,
        required: [true, 'First name is required!'],
        trim: true
    },

    lastName: {
        type: String,
        uppercase: true,
        required: [true, 'Last name is required!'],
        trim: true
    },

    middleName: {
        type: String,
        uppercase: true,
        trim: true
    },

    admissionNumber: {
        type: String,
        uppercase: true
    },

    password: {
        type: String,
        required: [true, 'Password is required!'],
        minlength: [8, 'Password must be at least 8 characters long!'],
        select: false,
        trim: true
    },

    address: {
        type: String,
        trim: true
    },

    phone: {
        type: String,
        trim: true
    },

    role: {
        type: String,
        required: true,
        enum: [Role.ADMIN, Role.STUDENT, Role.TEACHER, Role.FORM_TEACHER, Role.RECTOR],
        uppercase: true,
        trim: true
    },

    status: {
        type: String,
        required: true,
        enum: [UserStatus.PRESENT, UserStatus.TRANSFERRED, UserStatus.GRADUATED],
        default: UserStatus.PRESENT,
        uppercase: true,
        trim: true
    },

    disabled: {
        type: Boolean,
        default: false
    },

    lastSeen: {
        type: Date
    },

    avatar: {
        type: String,
    },

    avatarKey: {
        type: String,
    },

    currentClass: {
        type: String,
        enum: [Classes.JS1, Classes.JS2, Classes.JS3, Classes.SS1, Classes.SS2, Classes.SS3]
    },
        
    pastClasses: [
        {
            session: {
                type: String,
                trim: true
            },
            pastClass: {
                type: String,
                uppercase: true,
                trim: true
            }
        }
    ],

    classOwned: {
        type: String,
        enum: [Classes.JS1, Classes.JS2, Classes.JS3, Classes.SS1, Classes.SS2, Classes.SS3, ''],
        trim: true
    },

    // to show the classes and subject the teacher teaches
    subjectsTaught: [
        {
            selectedClass: {
                type: String,
                enum: [Classes.JS1, Classes.JS2, Classes.JS3, Classes.SS1, Classes.SS2, Classes.SS3],
                trim: true
            },

            subject: {
                type: Schema.Types.ObjectId
            },

            staffId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: [true, 'Staff ID is required!']
            }
        }
    ],

    gender: {
        type: String,
        required: [true, 'Gender is required!'],
        enum: [Genders.MALE, Genders.FEMALE],
        uppercase: true,
        trim: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    resetPasswordToken: String,

    resetPasswordExpire: Date
});

// Encrypt user password using brcypt
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
});

// Sig JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    // const secret: Secret = !;
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPassword token field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    return resetToken;
}

UserSchema.index({'$**': 'text'});
export default model<User>('User', UserSchema);