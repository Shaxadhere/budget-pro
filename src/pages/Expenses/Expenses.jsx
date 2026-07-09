import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, updateExpense, deleteExpense } from "../../api/expenses";
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import moment from "moment";
import toast from "react-hot-toast";

const CATEGORIES = [
  { label: "Rent & Housing",          value: "Rent" },
  { label: "Groceries & Food",         value: "Groceries" },
  { label: "Electricity & Power",      value: "Electricity" },
  { label: "Gas & Heating",            value: "Gas" },
  { label: "Utilities & Internet",     value: "Utilities" },
  { label: "Transportation",           value: "Transportation" },
  { label: "Health & Medical",         value: "Health" },
  { label: "Insurance",                value: "Insurance" },
  { label: "Miscellaneous / Other",    value: "Misc" },
];

const RECURRING_PERIODS = [
  { label: "One-Time", value: "one-time" },
  { label: "Weekly",   value: "weekly" },
  { label: "Monthly",  value: "monthly" },
  { label: "Yearly",   value: "yearly" },
];

const currentYear = moment().year();
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
].map((label, i) => ({ label, value: i + 1 }));
const YEARS = Array.from({ length: 5 }, (_, i) => ({
  label: String(currentYear - 2 + i),
  value: currentYear - 2 + i,
}));
const MONTH_NAMES = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

function buildDefaultForm() {
  return {
    title: "",
    category: "Rent",
    amount: "",
    isVariableAmount: false,
    estimatedAmount: "",
    dueDate: moment().format("YYYY-MM-DD"),
    isRecurring: false,
    recurringPeriod: "one-time",
    status: "unpaid",
    notes: "",
  };
}

export default function Expenses() {
  useEffect(() => { document.title = "Expenses | InvoicingPro"; }, []);

  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm]     = useState(buildDefaultForm());

  const set = (key, val) => setExpenseForm((f) => ({ ...f, [key]: val }));

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => getExpenses({ size: 1000 }),
  });
  const expenses = expensesData?.data?.docs || [];

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => { queryClient.invalidateQueries(["expenses"]); setIsModalOpen(false); toast.success("Expense recorded"); },
    onError: () => toast.error("Failed to record expense"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateExpense(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["expenses"]); setIsModalOpen(false); toast.success("Expense updated"); },
    onError: () => toast.error("Failed to update expense"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => { queryClient.invalidateQueries(["expenses"]); toast.success("Expense deleted"); },
    onError: () => toast.error("Failed to delete expense"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const isVariable = expenseForm.isVariableAmount;
    const payload = {
      ...expenseForm,
      amount: isVariable
        ? Number(expenseForm.estimatedAmount)
        : Number(expenseForm.amount),
      estimatedAmount: isVariable ? Number(expenseForm.estimatedAmount) : undefined,
      isVariableAmount: isVariable,
    };
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleStatus = (exp) => {
    const newStatus  = exp.status === "paid" ? "unpaid" : "paid";
    const paymentDate = newStatus === "paid" ? new Date() : undefined;
    updateMutation.mutate({ id: exp._id, data: { status: newStatus, paymentDate } });
  };

  const openModal = (exp = null) => {
    if (exp) {
      setEditingExpense(exp);
      setExpenseForm({
        title: exp.title,
        category: exp.category,
        amount: exp.isVariableAmount ? exp.estimatedAmount : exp.amount,
        isVariableAmount: exp.isVariableAmount || false,
        estimatedAmount: exp.estimatedAmount || "",
        dueDate: moment(exp.dueDate).format("YYYY-MM-DD"),
        isRecurring: exp.isRecurring,
        recurringPeriod: exp.recurringPeriod,
        status: exp.status,
        notes: exp.notes || "",
      });
    } else {
      setEditingExpense(null);
      setExpenseForm(buildDefaultForm());
    }
    setIsModalOpen(true);
  };

  const isVariable = expenseForm.isVariableAmount;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-indigo-600" />
            Expenses & Bills
          </h1>
          <p className="text-slate-500 text-sm">
            Track groceries, rent, utilities, and variable usage-based bills.
          </p>
        </div>
        <Button onClick={() => openModal()} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Log Expense
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-slate-500 font-semibold">Gathering expenses...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center">
          <div className="h-14 w-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-7 w-7" />
          </div>
          <h4 className="font-bold text-slate-900 text-lg">No Expenses Logged</h4>
          <p className="text-slate-500 text-sm max-w-md mt-2">
            Enter recurring bills like rent, power, or groceries, as well as one-off misc expenses.
          </p>
          <Button onClick={() => openModal()} className="mt-6">Record First Expense</Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Expense</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Billing</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => {
                  const hasActuals = exp.isVariableAmount && exp.monthlyActuals?.length > 0;

                  return (
                    <>
                      <tr key={exp._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link to={`/expenses/${exp._id}`} className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                            {exp.title}
                          </Link>
                          {exp.isVariableAmount && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded mt-1">
                              <TrendingUp className="h-2.5 w-2.5" /> Variable
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                            {CATEGORIES.find(c => c.value === exp.category)?.label || exp.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {exp.isVariableAmount ? (
                            <span className="text-slate-500 font-medium text-xs">
                              ~PKR {exp.estimatedAmount?.toLocaleString() || exp.amount?.toLocaleString()}
                              <span className="block text-[10px] text-slate-400 font-normal">estimated</span>
                            </span>
                          ) : (
                            <>PKR {exp.amount.toLocaleString()}</>
                          )}
                        </td>
                        <td className="px-6 py-4">{moment(exp.dueDate).format("MMM DD, YYYY")}</td>
                        <td className="px-6 py-4">
                          {exp.isRecurring ? (
                            <span className="text-indigo-600 font-medium text-xs">
                              Recurring ({exp.recurringPeriod})
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">One-Time</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {exp.isRecurring || exp.isVariableAmount ? (
                            <div className="space-y-1">
                              <Link to={`/expenses/${exp._id}`} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                                View Calendar →
                              </Link>
                              {hasActuals && (
                                <p className="text-[10px] text-slate-500">
                                  {exp.monthlyActuals.length} payment{exp.monthlyActuals.length !== 1 ? "s" : ""} logged
                                </p>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => toggleStatus(exp)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                exp.status === "paid"
                                  ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                  : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              }`}
                            >
                              {exp.status === "paid" ? (
                                <><CheckCircle2 className="h-3.5 w-3.5" /><span>Paid</span></>
                              ) : (
                                <><Clock className="h-3.5 w-3.5" /><span>Unpaid</span></>
                              )}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => openModal(exp)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => {
                              if (window.confirm("Delete this expense record?")) deleteMutation.mutate(exp._id);
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXPENSE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? "Edit Expense Bill" : "Log New Expense"}
        dialogClasses={{ panel: "max-w-xl" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title / Item</label>
            <Input
              required
              value={expenseForm.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g., Gas Bill July, Rent Payment, Electricity"
            />
          </div>

          {/* Category + Recurring */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <Select
                options={CATEGORIES}
                value={expenseForm.category}
                onChange={(e) => set("category", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Cycle</label>
              <Select
                options={RECURRING_PERIODS}
                value={expenseForm.recurringPeriod}
                onChange={(e) => { set("recurringPeriod", e.target.value); set("isRecurring", e.target.value !== "one-time"); }}
              />
            </div>
          </div>

          {/* Variable Amount Toggle */}
          <div className={`p-3 rounded-xl border space-y-3 ${isVariable ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200"}`}>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isVariable}
                onChange={(e) => set("isVariableAmount", e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <div>
                <span>This bill has a variable amount</span>
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                  e.g., electricity, gas — usage-based bills that fluctuate each month
                </p>
              </div>
            </label>

            {isVariable ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated / Budget Amount (PKR)
                </label>
                <Input
                  required
                  type="number"
                  value={expenseForm.estimatedAmount}
                  onChange={(e) => set("estimatedAmount", e.target.value)}
                  placeholder="e.g., 20000 — your usual ballpark"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  This is your budgeted guess. Log each month's real bill amount below.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (PKR)</label>
                <Input
                  required
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  placeholder="Exact bill amount"
                />
              </div>
            )}
          </div>

          {/* Monthly actuals (variable only) removed from form */}

          {/* Due Date + Status (for fixed expenses) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isVariable ? "Next Due / Billing Date" : "Due Date"}
              </label>
              <Input
                required
                type="date"
                value={expenseForm.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </div>
            {!isVariable && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
                <Select
                  options={[{ label: "Unpaid", value: "unpaid" }, { label: "Paid", value: "paid" }]}
                  value={expenseForm.status}
                  onChange={(e) => set("status", e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Memo / Notes</label>
            <Input
              value={expenseForm.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="e.g., Landlord bank details or meter readings"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Expense"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
