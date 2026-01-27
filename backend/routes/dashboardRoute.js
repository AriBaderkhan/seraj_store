import express from 'express';
const router = express.Router();

import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

import dashboardController from '../controllers/dashboardController.js'

router.use(authMiddleware)




router.get(
    '/',
    roleMiddleware('manager', 'staff', 'admin'),
    dashboardController.getDashboardData
)





export default router
