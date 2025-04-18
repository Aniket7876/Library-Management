import React, { useEffect, useState } from 'react';
import { BookA, NotebookPen } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleAddBookPopup, toggleReadBookPopup, toggleRecordBookPopup } from '../store/slices/popUpSlice';
import { toast } from 'react-toastify';
import { fetchAllBooks, resetBookSlice } from '../store/slices/bookSlice';
import { fetchAllBorrowBooks, resetBorrowBookSlice } from '../store/slices/borrowSlice';
import Header from '../layout/Header';
import AddBookPopup from '../popups/AddBookPopup';
import ReadBookPopup from '../popups/ReadBookPopup';
import RecordBookPopup from '../popups/RecordBookPopup';

const BookManagement = () => {
  const dispatch = useDispatch();
  const { loading, error, message, books } = useSelector((state) => state.book);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { addBookPopup, readBookPopup, recordBookPopup } = useSelector((state) => state.popup);
  const { loading: borrowLoading, error: borrowError, message: borrowMessage } = useSelector((state) => state.borrow);

  const [readBook, setReadBook] = useState({});
  const openReadBookPopup = (id) => {
    const book = books.find((book) => book._id === id);

    setReadBook(book);
    dispatch(toggleReadBookPopup());
  };

  const [borrowBookId, setBorrowBookId] = useState('');
  const openRecordBookPopup = (bookId) => {
    setBorrowBookId(bookId);
    dispatch(toggleRecordBookPopup());
  };

  useEffect(() => {
    if (message || borrowMessage) {
      toast.success(message || borrowMessage);
      dispatch(fetchAllBooks());
      dispatch(fetchAllBorrowBooks());
      dispatch(resetBorrowBookSlice());
      dispatch(resetBookSlice());
    }
    if (error || borrowError) {
      toast.error(error || borrowError);
      dispatch(resetBorrowBookSlice());
      dispatch(resetBookSlice());
    }
  }, [dispatch, message, error, loading, borrowMessage, borrowError, borrowLoading]);

  const [searchedKeyWord, setSearchedKeyWord] = useState('');
  const handleSearch = (e) => {
    setSearchedKeyWord(e.target.value.toLowerCase());
  };

  const searchBooks = books.filter((book) => book.title.toLowerCase().includes(searchedKeyWord));

  return (
    <>
      <main className="relative flex-1 p-6 pt-28">
        <Header />
        <header className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          <h2 className="text-xl font-medium md:text-2xl md:font-semibold">
            {user && user.role === 'Admin' ? 'Book Management' : 'Books'}
          </h2>
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            {isAuthenticated && user?.role === 'Admin' && (
              <button
                onClick={() => dispatch(toggleAddBookPopup())}
                className="relative pl-14 w-full sm:w-52 flex gap-4 jsutify-center items-center py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800">
                <span className="bg-white flex justify-center items-center overflow-hidden rounded-full text-black w-[25px] h-[25px] text-[27px] absolute left-5">
                  +
                </span>
                Add Book
              </button>
            )}
            <input
              type="text"
              placeholder="Search Books"
              className="w-full sm:w-52 border p-2 border-gray-300 rounded-md"
              value={searchedKeyWord}
              onChange={handleSearch}
            />
          </div>
        </header>
        {/* Table */}

        {books && books.length > 0 ? (
          <div className="mt-6 overflow-auto bg-white rounded-md shadow-lg">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Author</th>
                  {isAuthenticated && user?.role === 'Admin' && <th className="px-4 py-2 text-left">Quantity</th>}
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Availability</th>
                  {isAuthenticated && user?.role === 'Admin' && <th className="px-4 py-2 text-left">Record Book</th>}
                </tr>
              </thead>
              <tbody>
                {searchBooks.map((book, index) => (
                  <tr key={book._id} className={(index + 1) % 2 === 0 ? 'bg-gray-100' : ''}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{book.title}</td>
                    <td className="px-4 py-2">{book.author}</td>
                    {isAuthenticated && user?.role === 'Admin' && <td className="px-4 py-2">{book.quantity}</td>}
                    <td className="px-4 py-2 text-left">Rs. {book.price}</td>
                    <td className="px-4 py-2">{book.availability ? 'Available' : 'Not Available'}</td>
                    {isAuthenticated && user?.role === 'Admin' && (
                      <td className="px-4 py-2 flex space-x-2 my-3 justify-center">
                        <BookA onClick={() => openReadBookPopup(book._id)} />
                        <NotebookPen onClick={() => openRecordBookPopup(book._id)} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <h3 className="text-3xl mt-5 font-medium">No Books found</h3>
        )}
      </main>
      {addBookPopup && <AddBookPopup />}
      {readBookPopup && <ReadBookPopup book={readBook} />}
      {recordBookPopup && <RecordBookPopup bookId={borrowBookId} />}
    </>
  );
};

export default BookManagement;
