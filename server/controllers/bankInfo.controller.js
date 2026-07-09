import BankInfo from "../models/bankInfo.model.js";
import { create, deleteOne, getAll, getOne, updateOne } from "../generics/crud.generics.js";

//get all bank infos
export function getBankInfos(req, res) {
    return getAll(BankInfo, req, res, {}, [
        'bankName',
        'accountTitle',
        'accountNumber'
    ]);
}

//get a single bank info by id
export function getBankInfo(req, res) {
    return getOne(BankInfo, req, res);
}

//create a new bank info
export function createBankInfo(req, res) {
    return create(BankInfo, req, res);
}

//update a bank info by id and return the updated bank info
export function updateBankInfo(req, res) {
    return updateOne(BankInfo, req, res);
}

//delete a bank info by id
export function deleteBankInfo(req, res) {
    return deleteOne(BankInfo, req, res);
}
