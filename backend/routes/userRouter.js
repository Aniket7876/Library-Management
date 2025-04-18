import express from 'express';
import { getAllUsers, registerNewAdmin } from '../controllers/userController.js';
import { authorizeRoles, isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/all', isAuthenticated, authorizeRoles('Admin'), getAllUsers);
router.post('/add/new-admin', isAuthenticated, authorizeRoles('Admin'), registerNewAdmin);

export default router;
