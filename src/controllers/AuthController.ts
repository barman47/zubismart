import { get, post, controller, patch, use } from './decorators';
import { Request, Response } from 'express';
import crypto from 'crypto';
import Validator from 'validator';

import { 
    LoginData, 
    validateChangePassword, 
    validateLoginUser, 
    validateUpdateUser,
    validateRegisterUser,
    validateResetPassword,
    ChangePasswordData,
    ResetData 
} from '../utils/validation/auth';
import UserModel, { User } from '../models/User';
import { ErrorObject, Role, UserRole, UserStatus } from '../utils/constants';
import { returnError } from '../utils/returnError';
import { sendTokenResponse } from '../utils/sendTokenResponse';
import { protect } from '../utils/auth';
// import { sendEmail } from '../utils/sendEmail';

@controller('/auth')
export class AuthController {
    // Login existing user
    @post('/login')
    async login(req: Request, res: Response) {
        try {
            const { errors, isValid }: ErrorObject<LoginData> = validateLoginUser(req.body);
            const email = req.body.email.toLowerCase();
    
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    errors: { msg: 'Invalid login details', ...errors }
                });
            }
    
            let user = await UserModel.findOne({ email }).select('+password');
    
            if (!user) {
                return res.status(401).json({
                    success: false,
                    errors: {
                        msg: 'Invalid Login Credentials!'
                    }
                });
            }
    
            // Check if password matches
            const isMatch = await user.matchPassword(req.body.password);
    
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    errors: {
                        msg: 'Invalid Login Credentials'
                    }
                });
            }
    
            user.password = ''; // Remove password from user before sending response

            if (user.disabled) {
                return res.status(403).json({
                    success: false,
                    errors: {
                        msg: `Account disabled. Please contact support.`
                    }
                });
            }
    
            const data = { user };
            return sendTokenResponse(data, 200, 'Login successful', res);
        } catch (err) {
            return returnError(err, res, 500, 'Login failed');
        }
    }

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

    // Update user by ID: This will work for every single user
    @patch('/updateUser/:id')
    @use(protect)
    async updateUser(req: Request, res: Response) {
        try {
            const { isValid, errors }: ErrorObject<User> = validateUpdateUser(req.body);
            
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    errors: { msg: 'Invalid user data', ...errors }
                });
            }

            const user = await UserModel.findByIdAndUpdate(req.body._id, { $set: { ...req.body, status: UserStatus.PRESENT } }, { new: true, runValidators: true });

            return res.status(200).json({
                success: true,
                msg: 'User updated successfully',
                data: user
            });
        } catch(err) {
            return returnError(err, res, 500, 'Password could not be changed');
        }
    }

    // Assign role to user
    @patch('/assignRole/:id')
    @use(protect)
    async assignRole(req: Request, res: Response) {
        try {    
            if (!(req.body.role.toUpperCase() in Role)) {
                return res.status(400).json({
                    success: false,
                    errors: { msg: 'Invalid user role!' as UserRole}
                });
            }
            const user = await UserModel.findByIdAndUpdate(req.params.id, { $set: { role: req.body.role } }, { new: true });

            return res.status(200).json({
                success: true,
                msg: 'Role updated successfully',
                data: user
            });
        } catch(err) {
            return returnError(err, res, 500, 'Password could not be changed');
        }
    }

    // Change user password
    @patch('/changePassword')
    @use(protect)
    async changePassword(req: Request, res: Response) {
        try {
            const { currentPassword, newPassword }: ChangePasswordData = req.body;
            const { errors, isValid }: ErrorObject<ChangePasswordData> = validateChangePassword(req.body);
    
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    errors
                });
            }
    
            const user = await UserModel.findById(req.user.id).select('+password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    errors: {
                        msg: 'User does not exist!'
                    }
                });
            }
    
            if (!(await user.matchPassword(currentPassword))) {
                return res.status(401).json({
                    success: false,
                    errors: {
                        msg: 'Password incorrect!',
                        password: 'Password incorrect!'
                    }
                });
            }
    
            if (await user.matchPassword(newPassword)) {
                return res.status(401).json({
                    success: false,
                    errors: {
                        msg: 'New password cannot be same with old password',
                        password: 'New password cannot be same with old password'
                    }
                });
            }
    
            user.password = newPassword;
            await user.save();
            // Send password change email
            sendTokenResponse({ user }, 200, 'Password changed successfully', res);
        } catch(err) {
            return returnError(err, res, 500, 'Password could not be changed');
        }
    }

    // Send password reset email
    @post('/forgotPassword')
    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!Validator.isEmail(email)) {
                return res.status(400).json({
                    success: false,
                    errors: {
                        email: 'Invalid email address!',
                        msg: 'Invalid email address!'
                    }
                });
            }

            const user = await UserModel.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    errors: {
                        msg: 'User does not exist!',
                        email: 'User does not exist!'
                    }
                });
            }

            if (user.disabled) {
                return res.status(403).json({
                    success: false,
                    errors: {
                        msg: `Account disabled. Please contact support.`
                    }
                });
            }
            // Get reset token
            const resetToken = user.getResetPasswordToken();
    
            await user.save({ validateBeforeSave: false });
    
            // Create reset url
            const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
            const host = req.headers['host'];
            const resetUrl = `${protocol}://${host}/api/auth/resetPassword/${resetToken}`;
            // const message = `
            //     <p>You are receiving this email because you (or someone else) has requested the reset of a password. Please click the <a href=${resetUrl} target="_blank">link</a> to reset your password</p>
            // `;
    
            // await sendEmail(email, 'Password Reset Link', message);
            console.log('email sent: ', resetUrl);
    
            return res.status(200).json({
                success: true,
                data: { msg: `Reset link sent to ${email}` }
            });
    

        } catch (err) {
            return returnError(err, res, 500, 'Unable to send password reset email');
        }
    }

    @patch('/resetPassword/:resetToken')
    async resetPassword(req: Request, res: Response) {
        try {
            const { errors, isValid }: ErrorObject<ResetData> = validateResetPassword(req.body);

            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    errors
                });
            }

            const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
            const user = await UserModel.findOne({
                resetPasswordToken,
                resetPasswordExpire:  { $gt: new Date() }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    errors: { msg: 'Invalid token' }
                });
            }

            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();
            // Send password reset email
            sendTokenResponse({ user }, 200, 'Password reset successfully', res);
        } catch (err) {
            return returnError(err, res, 500, 'Unable to reset password');
        }
    }

    @use(protect)
    @get('/')
    async getCurrentUser(req: Request, res: Response) {
        try {
            const user = await UserModel.findOne({ _id: req.user.id });
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (err) {
            return returnError(err, res, 500, 'Unable to get current user');
        }
    }

    @get('/logout')
    async logout(_req: Request, res: Response) {
        res.cookie('seminaryCookie', 'none', {
            expires: new Date(Date.now() - 10 * 1000),
            httpOnly: true
        });
        res.status(200).json({
            success: true,
            data: {}
        });
    }
}