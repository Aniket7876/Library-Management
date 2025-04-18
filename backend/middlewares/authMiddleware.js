import jwt from 'jsonwebtoken';
import { catchAsyncErrors } from './catchAsyncError.js';
import { User } from '../models/userModel.js';
import ErrorHandler from './errorMiddleware.js';

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler('User is not logged in.', 400));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded._id);
  next();
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`, 403)
      );
    }
    next();
  };
};
