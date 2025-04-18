import { isAuthenticated, authorizeRoles } from '../middlewares/authMiddleware.js';
import { addBook, deleteBook, getAllBooks } from '../controllers/bookController.js';
import express from 'express';

const router = express.Router();

router.post('/admin/add', isAuthenticated, authorizeRoles('Admin'), addBook);
router.get('/all', isAuthenticated, getAllBooks);
router.delete('/delete/:id', isAuthenticated, authorizeRoles('Admin'), deleteBook);

export default router;
