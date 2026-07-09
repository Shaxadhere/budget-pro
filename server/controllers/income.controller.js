import Income from "../models/income.model.js";
import { create, deleteOne, getAll, getOne, updateOne } from "../generics/crud.generics.js";

export function getIncomes(req, res) {
    return getAll(Income, req, res, {}, [
        'source',
        'notes'
    ]);
}

export function getIncome(req, res) {
    return getOne(Income, req, res);
}

export function createIncome(req, res) {
    return create(Income, req, res);
}

export function updateIncome(req, res) {
    return updateOne(Income, req, res);
}

export function deleteIncome(req, res) {
    return deleteOne(Income, req, res);
}
