import express from 'express'
const router = express.Router()


import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import validateIdParam from '../validates/idValidate.js';

router.use(authMiddleware)

router.post('/')






export default router