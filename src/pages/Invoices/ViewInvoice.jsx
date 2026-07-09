import { useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvoice,
  deleteInvoice,
  updateInvoiceStatus,
} from "../../api/invoices";
import { Loader2, ArrowLeft, Printer, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import BaseInvoice from "../../components/invoices/base-invoice";
import { useReactToPrint } from "react-to-print";

const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id),
  });

  const invoice = data?.data;

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice-${invoice?.invoiceNumber || id}`,
  });

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id);
        toast.success("Invoice deleted");
        navigate("/");
      } catch (error) {
        toast.error("Failed to delete invoice");
      }
    }
  };

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, invoiceStatus }) =>
      updateInvoiceStatus(id, invoiceStatus),
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice", id]);
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const handleStatusChange = (e) => {
    updateStatusMutation.mutate({ id, invoiceStatus: e.target.value });
  };

  const statusOptions = [
    { label: "Pending", value: "Pending" },
    { label: "Paid", value: "Paid" },
    { label: "Rejected", value: "Rejected" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">Error loading invoice</p>
        <Link to="/">
          <Button variant="outline">Go Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Actions Bar - Hidden in Print */}
      <div className="flex items-center justify-between no-print">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex gap-2 items-center">
          <div className="w-32">
            <select
              value={invoice.invoiceStatus}
              onChange={handleStatusChange}
              className={`w-full px-3 py-2 rounded-md text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none cursor-pointer
                    ${
                      invoice.invoiceStatus === "Paid"
                        ? "bg-green-50 text-green-700 border-green-200 focus:ring-green-500"
                        : invoice.invoiceStatus === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500"
                          : "bg-red-50 text-red-700 border-red-200 focus:ring-red-500"
                    }`}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePrint()}
            className="gap-2"
          >
            <Printer className="h-4 w-4" /> Print / Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Display Component */}
      <div className="flex justify-center bg-slate-100 p-8 rounded-xl overflow-auto">
        <BaseInvoice ref={componentRef} {...invoice} />
      </div>
    </div>
  );
};

export default ViewInvoice;
