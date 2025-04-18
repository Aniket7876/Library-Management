import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { Book } from '../models/bookModel.js';
import { Borrow } from '../models/borrowModel.js';
import { User } from '../models/userModel.js';
import { calculateFine } from '../utils/fineCalculator.js';

export const recordBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;
  if (!email) {
    return next(new ErrorHandler('Email is required', 400));
  }
  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler('Book not found', 404));
  }
  const user = await User.findOne({ email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }
  if (book.quantity === 0) {
    return next(new ErrorHandler('Book not available', 400));
  }
  const isAlreadyBorrowed = user.borrowedBooks.find(
    (b) => b.bookId.toString() === id && b.returned === false
  );

  if (isAlreadyBorrowed) {
    return next(new ErrorHandler('Book already borrowed', 400));
  }

  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();

  user.borrowedBooks.push({
    bookId: book._id,
    bookTitle: book.title,
    borrowedDate: Date.now(),
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  await user.save();
  await Borrow.create({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    book: book._id,
    price: book.price,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  res.status(201).json({
    success: true,
    message: 'Book borrowed successfully',
  });
});

export const returnBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!id || !email) {
    return next(new ErrorHandler('Book ID and email are required', 400));
  }

  try {
    const book = await Book.findById(id);
    if (!book) {
      return next(new ErrorHandler('Book not found', 404));
    }

    const user = await User.findOne({ email, accountVerified: true });
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    const borrowedBook = user.borrowedBooks.find(
      (b) => b.bookId.toString() === id && b.returned === false
    );

    if (!borrowedBook) {
      return next(new ErrorHandler('Book not borrowed', 400));
    }

    borrowedBook.returned = true;
    await user.save();

    book.quantity += 1;
    book.availability = true;
    await book.save();

    const borrow = await Borrow.findOne({
      book: id,
      'user.email': email,
      returnDate: null,
    });

    if (!borrow) {
      return next(new ErrorHandler('Borrow record not found', 404));
    }

    borrow.returnDate = new Date();
    const fine = calculateFine(borrow.dueDate);
    borrow.fine = fine;
    await borrow.save();

    res.status(200).json({
      success: true,
      message:
        fine !== 0
          ? `The book has been returned successfully with fine $ ${fine}`
          : `The book has been returned successfully with fee $${book.price}`,
    });
  } catch (error) {
    console.error('Return book error:', error);
    return next(new ErrorHandler('Error processing return book request', 500));
  }
});

export const borrowedBooks = catchAsyncErrors(async (req, res, next) => {
  const { borrowedBooks } = req.user;
  res.status(200).json({
    success: true,
    borrowedBooks,
  });
});

export const getBorrrowedBooksByAdmin = catchAsyncErrors(async (req, res, next) => {
  const borrowedBooks = await Borrow.find().populate('book').populate('user');
  res.status(200).json({
    success: true,
    borrowedBooks,
  });
});
