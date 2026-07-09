import Customer from "../models/customer.model.js";
import { create, deleteOne, getAll, getOne, updateOne } from "../generics/crud.generics.js";

//get all customers, use aggregate paginate, use size and page query params, use sort query param, use search query param
export function getCustomers(req, res) {
    return getAll(Customer, req, res, {}, [
        'name',
        'email',
        'phone'
    ]);
}

//get a single customer by id
export function getCustomer(req, res) {
    return getOne(Customer, req, res);
}

//create a new customer
export function createCustomer(req, res) {
    return create(Customer, req, res);
}

//update a customer by id and return the updated customer
export function updateCustomer(req, res) {
    return updateOne(Customer, req, res);
}

//delete a customer by id
export function deleteCustomer(req, res) {
    return deleteOne(Customer, req, res);
}
