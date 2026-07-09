import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInvoices, markAllInvoicesPaid } from "../../api/invoices";
import { Plus, Search, Loader2, FileText, CheckCheck } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import { motion } from "framer-motion";
import moment from "moment";
import toast from "react-hot-toast";

const InvoicesList = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", { search }],
    queryFn: () => getInvoices({ search, size: 1000 }),
  });

  const invoices = data?.data?.docs || [];
  const pendingCount = invoices.filter((inv) => inv.invoiceStatus === "Pending").length;

  const markAllPaidMutation = useMutation({
    mutationFn: markAllInvoicesPaid,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["invoices"]);
      toast.success(res?.message || "All pending invoices marked as Paid");
    },
    onError: () => toast.error("Failed to update invoices"),
  });

  const handleMarkAllPaid = () => {
    if (pendingCount === 0) return;
    if (!window.confirm(`Mark all ${pendingCount} pending invoice(s) as Paid?`)) return;
    markAllPaidMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">
            Manage and track all your invoices
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Button
              variant="outline"
              className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={handleMarkAllPaid}
              disabled={markAllPaidMutation.isPending}
            >
              {markAllPaidMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Mark All Paid
              <span className="ml-1 bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            </Button>
          )}
          <Link to="/invoices/create">
            <Button className="gap-2 shadow-lg shadow-indigo-200">
              <Plus className="h-4 w-4" /> Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="w-full md:w-72">
            <Input
              placeholder="Search client or number..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading || invoices.length > 0 ? (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-semibold uppercase text-xs tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center cursor-wait">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
                        <p className="text-slate-500 font-medium">
                          Loading invoices...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <motion.tr
                      key={invoice._id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        #{invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">{invoice.clientName}</td>
                      <td className="px-6 py-4">
                        {moment(invoice.invoiceDate).format("MMM DD, YYYY")}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {invoice.currency} {invoice.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${
                                              invoice.invoiceStatus === "Paid"
                                                ? "bg-green-100 text-green-800"
                                                : invoice.invoiceStatus ===
                                                    "Pending"
                                                  ? "bg-amber-100 text-amber-800"
                                                  : "bg-slate-100 text-slate-800"
                                            }`}
                        >
                          {invoice.invoiceStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/invoices/${invoice._id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            View
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={FileText}
              title="No invoices found"
              description={
                search
                  ? "Try adjusting your search terms"
                  : "Create your first invoice to get started"
              }
              action={
                !search && (
                  <Link to="/invoices/create">
                    <Button size="sm" className="mt-4">
                      Create Invoice
                    </Button>
                  </Link>
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesList;



