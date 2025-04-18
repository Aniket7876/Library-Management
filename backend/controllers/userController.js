import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';

export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ accountVerified: true });
  res.status(200).json({
    success: true,
    users,
  });
});

export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler('Admin avatar is required', 400));
  }
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler('All fields are required', 400));
  }
  const isRegistered = await User.findOne({ email, accountVerified: true });
  if (isRegistered) {
    return next(new ErrorHandler('User already registered', 400));
  }

  if (password.length < 8 || password.length > 16) {
    return next(new ErrorHandler('Password must be between 8 and 16 characters', 400));
  }

  const { avatar } = req.files;
  const allowedFormates = ['image/png', 'image/jpeg', 'image/webp'];

  if (!allowedFormates.includes(avatar.mimetype)) {
    return next(new ErrorHandler('Avatar must be in png, jpeg or webp format', 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  let cloudinaryResponse;
  try {
    cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath, {
      folder: 'Library_Management_System_Admin_Avatar',
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return next(new ErrorHandler('Failed to upload avatar to Cloudinary', 400));
  }

  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'Admin',
    accountVerified: true,
    avatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Admin registered successfully',
    admin,
  });
});
