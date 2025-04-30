import { __DO_NOT_USE__ActionTypes, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toggleRecordBookPopup } from './popUpSlice';

const borrowSlice = createSlice({
  name: 'borrow',
  initialState: {
    loading: false,
    userBorrowedBooks: [],
    allBorrowedBooks: [],
    error: null,
    message: null,
  },

  reducers: {
    fetchUserBorrowedBooksRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchUserBorrowedBooksSuccess(state, action) {
      state.loading = false;
      state.userBorrowedBooks = action.payload;
    },
    fetchUserBorrowedBooksFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    recordBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    recordBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    recordBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    fetchAllBorrowedBooksRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchAllBorrowedBooksSuccess(state, action) {
      state.loading = false;
      state.allBorrowedBooks = action.payload;
    },
    fetchAllBorrowedBooksFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    returnBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    returnBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    returnBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    resetBorrowBookSlice(state) {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
});

export const fetchUserBorrowBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.fetchUserBorrowedBooksRequest());
  await axios
    .get('http://3.110.158.74:4000/api/v1/borrow/my-borrowed-books', { withCredentials: true })
    .then((res) => {
      dispatch(borrowSlice.actions.fetchUserBorrowedBooksSuccess(res.data.borrowedBooks));
    })
    .catch((err) => {
      dispatch(borrowSlice.actions.fetchUserBorrowedBooksFailed(err.response.data.message));
    });
};

export const fetchAllBorrowBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.fetchAllBorrowedBooksRequest());
  await axios
    .get('http://3.110.158.74:4000/api/v1/borrow/borrowed-books-by-users', { withCredentials: true })
    .then((res) => {
      dispatch(borrowSlice.actions.fetchAllBorrowedBooksSuccess(res.data.borrowedBooks));
    })
    .catch((err) => {
      dispatch(borrowSlice.actions.fetchAllBorrowedBooksFailed(err.response.data.message));
    });
};

export const recordBorrowBook = (id, email) => async (dispatch) => {
  dispatch(borrowSlice.actions.recordBookRequest());
  await axios
    .post(
      `http://3.110.158.74:4000/api/v1/borrow/record-borrow-book/${id}`,
      { email },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    .then((res) => {
      dispatch(borrowSlice.actions.recordBookSuccess(res.data.message));
      dispatch(toggleRecordBookPopup());
    })
    .catch((err) => {
      dispatch(borrowSlice.actions.recordBookFailed(err.response.data.message));
    });
};

export const returnBook = (id, email) => async (dispatch) => {
  dispatch(borrowSlice.actions.returnBookRequest());
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid book ID');
    }

    const response = await axios.put(
      `http://3.110.158.74:4000/api/v1/borrow/return-book/${id}`,
      { email },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    // Ensure we're getting the message from the response
    const successMessage = response.data.message;

    // Dispatch success with the message
    dispatch(borrowSlice.actions.returnBookSuccess(successMessage));

    // Don't refresh the list here - it will be handled by the component
    return successMessage;
  } catch (err) {
    console.error('Return book error:', err);
    const errorMessage = err.response?.data?.message || 'Failed to return book';
    dispatch(borrowSlice.actions.returnBookFailed(errorMessage));
    throw err;
  }
};

export const resetBorrowBookSlice = () => (dispatch) => {
  dispatch(borrowSlice.actions.resetBorrowBookSlice());
};

export default borrowSlice.reducer;
