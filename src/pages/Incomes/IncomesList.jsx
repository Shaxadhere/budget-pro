import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIncomes, deleteIncome, updateIncome } from "../../api/incomes";
import {
  Plus, Trash2, Briefcase, Loader2, Search,
  ChevronDown, ChevronUp,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import IncomeForm from "./IncomeForm";
import moment from "moment";
import toast from "react-hot-toast";
import { getCurrencySymbol } from "../../constants/currencies";

const INCOME_TYPES = [
  { label: "Permanent Job (Salary)", value: "permanent" },
  { label: "Monthly Retainer", value: "retainer" },
  { label: "Contractual (Fixed-Term)", value: "contract" },
  { label: "Freelance — One-Time Payment", value: "freelance_one_time" },
  { label: "Freelance — Installments/Milestones", value: "freelance_installments" },
];

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function IncomesList() {
  useEffect(() => { document.title = "Incomes | InvoicingPro"; }, []);

  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [logModal, setLogModal] = useState({ isOpen: false, income: null });
  const [logForm, setLogForm] = useState({
    date: moment().format("YYYY-MM-DD"),
    receivedAmount: "",
    deductions: "",
    deductionNotes: "",
    notes: ""
  });

  const { data, isLoading } = useQuery({
    queryKey: ["incomes", { search }],
    queryFn: () => getIncomes({ size: 1000, search }),
  });
  const incomes = data?.data?.docs || [];

  const deleteMutation = useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => { queryClient.invalidateQueries(["incomes"]); toast.success("Income source deleted"); },
    onError: () => toast.error("Failed to delete income"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateIncome(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["incomes"]); toast.success("Updated"); },
    onError: () => toast.error("Failed to update"),
  });

  const toggleLogStatus = (inc, idx) => {
    const updated = inc.monthlyLogs.map((l, i) =>
      i === idx ? { ...l, status: l.status === "received" ? "pending" : "received" } : l
    );
    updateMutation.mutate({ id: inc._id, data: { monthlyLogs: updated } });
  };

  const toggleInstallmentStatus = (inc, idx) => {
    const updated = inc.installments.map((inst, i) =>
      i === idx
        ? { ...inst, status: inst.status === "paid" ? "unpaid" : "paid", receivedDate: inst.status === "unpaid" ? new Date() : undefined }
        : inst
    );
    const allPaid = updated.every((i) => i.status === "paid");
    updateMutation.mutate({ id: inc._id, data: { installments: updated, status: allPaid ? "completed" : inc.status } });
  };

  const handleEdit = (inc) => { setSelectedIncome(inc); setIsFormOpen(true); };
  const handleAddNew = () => { setSelectedIncome(null); setIsFormOpen(true); };

  const openLogModal = (inc) => {
    setLogModal({ isOpen: true, income: inc });
    setLogForm({
      date: moment().format("YYYY-MM-DD"),
      receivedAmount: inc.amount,
      deductions: "",
      deductionNotes: "",
      notes: ""
    });
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!logModal.income) return;

    const inc = logModal.income;
    const paymentDate = moment(logForm.date);
    const received = Number(logForm.receivedAmount);
    const deduct = Number(logForm.deductions) || 0;

    const newLog = {
      date: paymentDate.toDate(),
      month: paymentDate.month() + 1,
      year: paymentDate.year(),
      receivedAmount: received,
      deductions: deduct,
      deductionNotes: logForm.deductionNotes,
      netAmount: received - deduct,
      notes: logForm.notes,
      status: "received"
    };

    updateMutation.mutate(
      { id: inc._id, data: { monthlyLogs: [...(inc.monthlyLogs || []), newLog] } },
      { onSuccess: () => setLogModal({ isOpen: false, income: null }) }
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-indigo-600" />
            Income Streams
          </h1>
          <p className="text-slate-500 text-sm">Track salaries, retainers, contracts, and freelance income.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Income Stream
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="max-w-md">
            <Input
              placeholder="Search income sources..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-slate-500 font-semibold">Gathering income records...</p>
          </div>
        ) : incomes.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-slate-700">No Income Streams Yet</p>
            <p className="text-sm mt-1">Add your salary, retainers, contracts, and freelance payments.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {incomes.map((inc) => {
              const sym = getCurrencySymbol(inc.currency || "PKR");
              const code = inc.currency || "PKR";
              const hasLogs = inc.monthlyLogs?.length > 0;
              const logsOpen = expandedLogs[inc._id];

              // Summary stats from monthly logs
              const totalReceived = hasLogs
                ? inc.monthlyLogs.filter((l) => l.status === "received").reduce((s, l) => s + (l.netAmount ?? l.receivedAmount ?? 0), 0)
                : 0;
              const totalPending = hasLogs
                ? inc.monthlyLogs.filter((l) => l.status === "pending").reduce((s, l) => s + (l.netAmount ?? l.receivedAmount ?? 0), 0)
                : 0;

              return (
                <div key={inc._id} className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Left: details */}
                    <div className="flex-1 space-y-3">
                      {/* Title row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/incomes/${inc._id}`} className="font-bold text-slate-900 text-lg hover:text-indigo-600 transition-colors">
                          {inc.source}
                        </Link>
                        <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                          {INCOME_TYPES.find((t) => t.value === inc.type)?.label || inc.type}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold border border-slate-200">
                          {code}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${inc.status === "active"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}>
                          {inc.status}
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Started: {moment(inc.startDate).format("MMMM DD, YYYY")}</span>
                        {inc.endDate && (
                          <span className="font-medium text-indigo-600">
                            {moment().isAfter(moment(inc.endDate), 'day') ? 'Ended' : 'Ends'}: {moment(inc.endDate).format("MMMM DD, YYYY")}
                            {inc.contractDurationMonths && ` (${inc.contractDurationMonths}-month contract)`}
                          </span>
                        )}
                      </div>

                      {inc.notes && (
                        <p className="text-sm text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {inc.notes}
                        </p>
                      )}

                      {/* Freelance installments */}
                      {inc.type === "freelance_installments" && inc.installments?.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Milestones</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {inc.installments.map((inst, i) => (
                              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-2">
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{sym} {inst.amount.toLocaleString()}</p>
                                  <p className="text-[10px] text-slate-500">Due: {moment(inst.dueDate).format("MMM DD, YYYY")}</p>
                                </div>
                                <button
                                  onClick={() => toggleInstallmentStatus(inc, i)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${inst.status === "paid"
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-amber-50 border-amber-200 text-amber-700"
                                    }`}
                                >
                                  {inst.status === "paid" ? "Received" : "Pending"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Monthly logs summary */}
                      {hasLogs && (
                        <div className="space-y-2">
                          {/* Summary pills */}
                          <div className="flex gap-2 flex-wrap">
                            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-green-700">
                              Received: {sym} {totalReceived.toLocaleString()}
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-700">
                              Pending: {sym} {totalPending.toLocaleString()}
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600">
                              Est. monthly: {sym} {inc.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: amount + actions */}
                    <div className="flex flex-col justify-between items-end shrink-0 gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium">
                          {inc.type === "freelance_one_time" || inc.type === "freelance_installments"
                            ? "Contract Sum"
                            : "Est. Monthly"}
                        </p>
                        <p className="text-2xl font-black text-slate-950">
                          {sym} {inc.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/incomes/${inc._id}`}>
                          <Button size="sm" variant="outline">View Logs</Button>
                        </Link>
                        {inc.type !== "freelance_one_time" && inc.type !== "freelance_installments" && (
                          <Button size="sm" onClick={() => openLogModal(inc)}>Log Payment</Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEdit(inc)}>Edit</Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => { if (window.confirm("Delete this income source?")) deleteMutation.mutate(inc._id); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isFormOpen && (
        <IncomeForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} income={selectedIncome} />
      )}

      {logModal.isOpen && logModal.income && (
        <Modal
          isOpen={logModal.isOpen}
          onClose={() => setLogModal({ isOpen: false, income: null })}
          title={`Log Payment: ${logModal.income.source}`}
        >
          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date Received</label>
              <Input
                required
                type="date"
                value={logForm.date}
                onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received ({getCurrencySymbol(logModal.income.currency)})
                </label>
                <Input
                  required
                  type="number"
                  value={logForm.receivedAmount}
                  onChange={(e) => setLogForm({ ...logForm, receivedAmount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deductions ({getCurrencySymbol(logModal.income.currency)}) <span className="text-slate-400 font-normal">optional</span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g. Tax"
                  value={logForm.deductions}
                  onChange={(e) => setLogForm({ ...logForm, deductions: e.target.value })}
                />
              </div>
            </div>

            {logForm.deductions > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deduction Notes</label>
                <Input
                  value={logForm.deductionNotes}
                  onChange={(e) => setLogForm({ ...logForm, deductionNotes: e.target.value })}
                  placeholder="e.g. 10% tax"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
              <Input
                value={logForm.notes}
                onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                placeholder="e.g. July salary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setLogModal({ isOpen: false, income: null })}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>Save Log</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
