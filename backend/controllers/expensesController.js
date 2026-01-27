import asynWrap from "../utils/asyncWrap.js";
import expensesService from '../services/expensesService.js';
import asyncWrap from "../utils/asyncWrap.js";

const createExpenses = asynWrap(async (req, res) => {
    const { type, amount, expense_date, note } = req.body;
    const created_by = req.user.id;

    const result = await expensesService.createExpenses(type, amount, expense_date, note, created_by);

    res.status(201).json({
        message: 'Expenses created successfully',
        data: result
    });
})

const findAllExpenses = asynWrap(async (req, res) => {
    const { type, month } = req.query;
    const result = await expensesService.findAllExpenses(type, month);
    res.status(200).json({
        message: 'Expenses found successfully',
        data: result
    });
})

const findAExpense = asyncWrap(async (req, res) => {
    const expenseId = Number(req.params.expenseId);
    const result = await expensesService.findAExpense(expenseId);
    res.status(200).json({
        message: 'Expense found successfully',
        data: result
    });
})

const updateExpense = asyncWrap(async (req, res) => {
    const expenseId = Number(req.params.expenseId);
    const fields = req.body;
    const updated_by = req.user.id;
    const result = await expensesService.updateExpense(expenseId, fields, updated_by);
    res.status(200).json({
        message: 'Expense updated successfully',
        data: result
    });
})

const deleteExpense = asyncWrap(async (req, res) => {
    const expenseId = Number(req.params.expenseId);
    const result = await expensesService.deleteExpense(expenseId);
    res.status(200).json({
        message: 'Expense deleted successfully',
        data: result
    });
})

const getAvailableMonths = asyncWrap(async (req, res) => {
    const result = await expensesService.getAvailableMonths();
    res.status(200).json({
        message: 'Available months retrieved successfully',
        data: result
    });
})

const getAvailableTypes = asyncWrap(async (req, res) => {
    const result = await expensesService.getAvailableTypes();
    res.status(200).json({
        message: 'Available types retrieved successfully',
        data: result
    });
})

export default { createExpenses, findAllExpenses, findAExpense, updateExpense, deleteExpense, getAvailableMonths, getAvailableTypes }