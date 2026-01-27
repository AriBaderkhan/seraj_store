import expensesModel from '../models/expensesModel.js';
import appError from '../utils/appError.js';

async function createExpenses(type, amount, expense_date, note, created_by) {
    const expenses = await expensesModel.create(type, amount, expense_date, note, created_by);
    if (!expenses) throw appError('FAILED_TO_CREATE_EXPENSES', 'Failed to create expenses', 400);
    return expenses;
}

async function findAllExpenses(type, month) {
    const expenses = await expensesModel.findAllExpenses(type, month);
    if (!expenses || !expenses.length) throw []
    return expenses;
}

async function findAExpense(expenseId) {
    const expense = await expensesModel.findAExpense(expenseId);
    if (!expense) throw appError('EXPENSE_NOT_FOUND', 'Expense not found', 404);
    console.log(expense.processed_by)
    return expense;
}

async function updateExpense(expenseId, fields, updated_by) {
    const expense = await expensesModel.findAExpense(expenseId);
    if (!expense) throw appError('EXPENSE_NOT_FOUND', 'Expense not found', 404);

    const expenseUpdated = await expensesModel.updateExpense(expenseId, fields, updated_by);
    if (!expenseUpdated) throw appError('FAILED_TO_UPDATE_EXPENSE', 'Failed to update expense', 400);
    return expenseUpdated;
}

async function deleteExpense(expenseId) {
    const expense = await expensesModel.findAExpense(expenseId);
    if (!expense) throw appError('EXPENSE_NOT_FOUND', 'Expense not found', 404);

    const expenseDeleted = await expensesModel.deleteExpense(expenseId);
    if (!expenseDeleted) throw appError('FAILED_TO_DELETE_EXPENSE', 'Failed to delete expense', 400);
    return expenseDeleted;
}

async function getAvailableMonths() {
    return await expensesModel.getAvailableMonths();
}

async function getAvailableTypes() {
    return await expensesModel.getAvailableTypes();
}

export default { createExpenses, findAllExpenses, findAExpense, updateExpense, deleteExpense, getAvailableMonths, getAvailableTypes }