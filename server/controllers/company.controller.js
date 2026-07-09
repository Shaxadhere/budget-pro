import Company from "../models/company.model.js";
import { create, deleteOne, getAll, getOne, updateOne } from "../generics/crud.generics.js";

//get all companies
export function getCompanies(req, res) {
    return getAll(Company, req, res, {}, [
        'companyName',
        'contactEmail',
    ]);
}

//get a single company by id
export function getCompany(req, res) {
    return getOne(Company, req, res);
}

//create a new company
export function createCompany(req, res) {
    return create(Company, req, res);
}

//update a company by id
export function updateCompany(req, res) {
    return updateOne(Company, req, res);
}

//delete a company by id
export function deleteCompany(req, res) {
    return deleteOne(Company, req, res);
}
