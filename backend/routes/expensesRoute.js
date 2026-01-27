import express from 'express';
const router = express.Router();

import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import validateIdParam from '../validates/idValidate.js';

import expensesValidate from '../validates/expensesValidate.js'
import expensesController from '../controllers/expensesController.js'

router.use(authMiddleware)


router.get(
    '/available_months',
    roleMiddleware('manager', 'staff', 'admin'),
    expensesController.getAvailableMonths
)

router.get(
    '/available_types',
    roleMiddleware('manager', 'staff', 'admin'),
    expensesController.getAvailableTypes
)

router.post(
    '/',
    roleMiddleware('manager', 'staff', 'admin'),
    expensesValidate.createExpenses,
    expensesController.createExpenses
)

router.get(
    '/',
    roleMiddleware('manager', 'staff', 'admin'),
    expensesController.findAllExpenses
)

router.get(
    '/:expenseId',
    roleMiddleware('manager', 'staff', 'admin'),
    validateIdParam('expenseId'),
    expensesController.findAExpense
)

router.put(
    '/:expenseId',
    roleMiddleware('manager', 'staff', 'admin'),
    validateIdParam('expenseId'),
    expensesValidate.updateExpenses,
    expensesController.updateExpense
)

router.delete(
    '/:expenseId',
    roleMiddleware('manager', 'staff', 'admin'),
    validateIdParam('expenseId'),
    expensesController.deleteExpense
)



export default router
