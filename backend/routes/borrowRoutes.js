import express from 'express';
import {
  borrowedBooks,
  recordBorrowedBook,
  getBorrrowedBooksByAdmin,
  returnBook,
} from '../controllers/borrowControllers.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
  '/record-borrow-book/:id',
  isAuthenticated,
  authorizeRoles('Admin'),
  recordBorrowedBook
);

router.get(
  '/borrowed-books-by-users',
  isAuthenticated,
  authorizeRoles('Admin'),
  getBorrrowedBooksByAdmin
);

router.get('/my-borrowed-books', isAuthenticated, borrowedBooks);

router.put('/return-book/:id', isAuthenticated, authorizeRoles('Admin'), returnBook);

export default router;
