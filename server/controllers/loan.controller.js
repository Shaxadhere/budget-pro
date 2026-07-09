import Loan from "../models/loan.model.js";
import { create, deleteOne, getAll, getOne, updateOne } from "../generics/crud.generics.js";

export function getLoans(req, res) {
    return getAll(Loan, req, res, {}, [
        'lenderOrBorrowerName',
        'notes'
    ]);
}

export function getLoan(req, res) {
    return getOne(Loan, req, res);
}

export function createLoan(req, res) {
    return create(Loan, req, res);
}

export function updateLoan(req, res) {
    return updateOne(Loan, req, res);
}

export function deleteLoan(req, res) {
    return deleteOne(Loan, req, res);
}
