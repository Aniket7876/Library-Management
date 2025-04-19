import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDb } from './database/db.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import authRouter from './routes/authRouter.js';
import bookRouter from './routes/bookRouter.js';
import borrowRouter from './routes/borrowRoutes.js';
import fileUpload from 'express-fileupload';
import userRouter from './routes/userRouter.js';
import { notifyUsers } from './services/notifyUsers.js';
import { removeUnverifiedAccount } from './services/removeUnverifiedAccount.js';
import morgan from 'morgan';

dotenv.config();

export const app = express();
app.use(morgan(':method :url :status'));

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/book', bookRouter);
app.use('/api/v1/borrow', borrowRouter);
app.use('/api/v1/user', userRouter);

connectDb();

notifyUsers();
removeUnverifiedAccount();

app.use(errorMiddleware);
