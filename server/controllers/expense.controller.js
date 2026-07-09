import Expense from "../models/expense.model.js";
import { create, deleteOne, getAll, getOne, updateOne } from "../generics/crud.generics.js";

export function getExpenses(req, res) {
    return getAll(Expense, req, res, {}, [
        'title',
        'category',
        'notes'
    ]);
}

export function getExpense(req, res) {
    return getOne(Expense, req, res);
}

export function createExpense(req, res) {
    return create(Expense, req, res);
}

export function updateExpense(req, res) {
    return updateOne(Expense, req, res);
}

export function deleteExpense(req, res) {
    return deleteOne(Expense, req, res);
}
