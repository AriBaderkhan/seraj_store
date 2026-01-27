import express from 'express';
const router = express.Router();

import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import reportController from '../controllers/reportController.js';

router.use(authMiddleware)
router.get(
    '/monthly_pdf',
    roleMiddleware('admin', 'manager'),
    reportController.getMonthlyPDF
)



export default router;