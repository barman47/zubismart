import { post, controller } from './decorators';
import { Request, Response } from 'express';
// import crypto from 'crypto';
// import Validator from 'validator';

import { 
    // LoginData, 
    // validateChangePassword, 
    // validateLoginUser, 
    // validateUpdateUser,
    validateRegisterUser,
    // validateResetPassword,
    // ChangePasswordData,
    // ResetData 
} from '../utils/validation/auth';
import UserModel, { User } from '../models/User';
import { ErrorObject } from '../utils/constants';
import { returnError } from '../utils/returnError';
import { sendTokenResponse } from '../utils/sendTokenResponse';
// import { protect } from '../utils/auth';
// import { sendEmail } from '../utils/sendEmail';

@controller('/auth')
export class AuthController {
    // Register new user
    @post('/register')
    async register(req: Request, res: Response) {
        try {
            const { isValid, errors }: ErrorObject<User> = validateRegisterUser(req.body);
            
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    errors: { msg: 'Invalid user data', ...errors }
                });
            }
            
            const user = await UserModel.findOne({ email: req.body.email.toLowerCase() });
            if (user) {
                return res.status(400).json({
                    success: false,
                    errors: { msg: 'User already exists!' }
                });
            }
            
            const newUser = await UserModel.create(req.body);
            newUser.password = '';
            sendTokenResponse(newUser, 201, `${newUser.role} created successfully`, res);

        } catch (err) {
            return returnError(err, res, 500, 'Unable to register user');
        }
    }
}