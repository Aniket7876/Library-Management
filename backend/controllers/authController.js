import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { sendVerificationCode } from '../utils/sendVerifcationCode.js';
import { sendToken } from '../utils/sendToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateForgotPasswordEmailTemplate } from '../utils/emailTemplates.js';
import crypto from 'crypto';

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new ErrorHandler('Please enter all required fields', 400));
    }
    const isRegistered = await User.findOne({ email, accountVerified: true });
    if (isRegistered) {
      return next(new ErrorHandler('User already registered', 400));
    }

    const registrationAttemptsByUser = await User.find({
      email,
      accountVerified: false,
    });

    if (registrationAttemptsByUser.length >= 5) {
      return next(
        new ErrorHandler(
          'You have exceeded the number of registration attempts. Please contact support',
          400
        )
      );
    }

    if (password.length < 8 || password.length > 16) {
      return next(new ErrorHandler('Password must be between 8 and 16 characters', 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const verificationCode = await user.generateVerificationCode();

    await user.save();

    sendVerificationCode(verificationCode, email, res);

    res.status(201).json({
      success: true,
      message: 'Registration Successful. Please verify email to continue.',
    });
  } catch (error) {
    next(error);
  }
});

export const verifyUser = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new ErrorHandler('Email or otp is missing', 400));
  }
  try {
    const userAllEntries = await User.find({
      email,
      accountVerified: false,
    }).sort({ createdAt: -1 });

    if (userAllEntries.length === 0) {
      return next(new ErrorHandler('user not found', 404));
    }

    let user;
    if (userAllEntries.length > 1) {
      user = userAllEntries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        email,
        accountVerified: false,
      });
    } else {
      user = userAllEntries[0];
    }

    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler('Invalid otp', 400));
    }

    const currentTime = Date.now();
    const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();
    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler('OTP Expired', 400));
    }

    const updateResult = await User.findByIdAndUpdate(
      user._id,
      {
        accountVerified: true,
        verificationCode: null,
        verificationCodeExpire: null,
      },
      { new: true }
    );

    const updatedUser = await User.findById(user._id).select('+password');

    if (!updatedUser) {
      return next(new ErrorHandler('User not found after update', 400));
    }

    if (!updatedUser.password) {
      return next(new ErrorHandler('User password not found', 400));
    }

    sendToken(updatedUser, 200, 'Account verified successfully', res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler('Internal server error.', 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler('Please enter all required fields', 400));
  }
  const user = await User.findOne({ email, accountVerified: true }).select('+password');
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Incorrect password', 401));
  }
  sendToken(user, 200, 'Logged in successfully', res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie('token', '', {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: 'Logged out successfully',
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorHandler('Email is required', 400));
  }
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({ email: user.email, subject: 'Library Password Recovery', message });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: { $gte: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler('Password reset token is invalid or has expired', 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', 400));
  }
  if (!req.body.password || !req.body.confirmPassword) {
    return next(new ErrorHandler('Password and confirm password are required', 400));
  }
  const passwordLength = req.body.password.length;
  if (passwordLength < 8 || passwordLength > 16) {
    return next(new ErrorHandler('Password length must be between 8 and 16 characters', 400));
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, 'Password reset successfully', res);
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler('Please enter all fields', 400));
  }
  const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Current password is incorrect', 400));
  }
  if (
    newPassword.length < 8 ||
    newPassword.length > 16 ||
    confirmNewPassword.length < 8 ||
    confirmNewPassword.length > 16
  ) {
    return next(new ErrorHandler('Password length must be 8 and 16 characters', 400));
  }
  if (newPassword !== confirmNewPassword) {
    return next(new ErrorHandler('New password does not match', 400));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});
