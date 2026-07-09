import Invoice from "../models/invoice.model.js";
import { create, deleteOne, getAll, getFacet, getOne, updateOne, updateStatus } from "../generics/crud.generics.js"
import { ApiResponse, errorHandler } from "../utils/response.utils.js";

//get all invoices, use aggregate paginate, use size and page query params, use sort query param, use search query param
export function getInvoices(req, res) {
    return getAll(Invoice, req, res, {}, [
        'invoiceNumber',
        'clientName',
        'clientEmail'
    ]);
}

//get a single invoice by id
export function getInvoice(req, res) {
    return getOne(Invoice, req, res);
}

//create a new invoice
export function createInvoice(req, res) {
    const body = req.body
    body.totalAmount = body.invoiceItems.reduce((acc, item) => acc + item.amount, 0)
    req.body = body
    return create(Invoice, req, res);
}

//update a invoice by id and return the updated invoice
export function updateInvoice(req, res) {
    return updateOne(Invoice, req, res);
}

//for only update invoice status
export function updateInvoiceStatus(req, res) {
    return updateStatus(Invoice, req, res);
}

//bulk mark all Pending invoices as Paid for the authenticated user
export function markAllInvoicesPaid(req, res) {
    Invoice.updateMany(
        { userId: req.user._id, invoiceStatus: "Pending" },
        { $set: { invoiceStatus: "Paid" } }
    )
        .then((result) => {
            return res.status(200).json(
                ApiResponse({ data: { modifiedCount: result.modifiedCount }, message: `${result.modifiedCount} invoice(s) marked as Paid` })
            );
        })
        .catch((err) => {
            return res.status(400).json(ApiResponse({ message: errorHandler(err), status: false }));
        });
}

//delete a invoice by id
export function deleteInvoice(req, res) {
    return deleteOne(Invoice, req, res);
}

export function getInvoiceFacet(req, res) {
    return getFacet(Invoice, req, res);
}