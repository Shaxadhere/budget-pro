import User from "../models/user.model.js";
import { create, deleteOne, getAll, getOne, updateOne } from "../generics/crud.generics.js"

//get all users, use aggregate paginate, use size and page query params, use sort query param, use search query param
export function getUsers(req, res) {
    return getAll(User, req, res);
}

//get a single user by id
export function getUser(req, res) {
    return getOne(User, req, res);
}

//create a new user
export function createUser(req, res) {
    return create(User, req, res);
}

//update a user by id and return the updated user
export function updateUser(req, res) {
    return updateOne(User, req, res);
}

//delete a user by id
export function deleteUser(req, res) {
    return deleteOne(User, req, res);
}