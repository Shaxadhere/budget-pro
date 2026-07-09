import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIncome, updateIncome } from "../../api/incomes";
import { Plus, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import moment from "moment";
import toast from "react-hot-toast";
import { CURRENCY_OPTIONS, getCurrencySymbol } from "../../constants/currencies";

const INCOME_TYPES = [
  { label: "Permanent Job (Salary)",              value: "permanent" },
  { label: "Monthly Retainer",                    value: "retainer" },
  { label: "Contractual (Fixed-Term)",             value: "contract" },
  { label: "Freelance — One-Time Payment",        value: "freelance_one_time" },
  { label: "Freelance — Installments/Milestones", value: "freelance_installments" },
];

function buildDefaultForm() {
  return {
    source: "",
    amount: "",
    currency: "PKR",
    type: "permanent",
    frequency: "monthly",
    contractDurationMonths: "",
    startDate: moment().format("YYYY-MM-DD"),
    endDate: "",
    status: "active",
    notes: "",
  };
}

export default function IncomeForm({ isOpen, onClose, income }) {
  const queryClient = useQueryClient();

  const [form, setForm]               = useState(buildDefaultForm());
  const [installments, setInstallments] = useState([
    { amount: "", dueDate: moment().add(1, "months").format("YYYY-MM-DD"), status: "unpaid" },
  ]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    if (income) {
      setForm({
        source: income.source,
        amount: income.amount,
        currency: income.currency || "PKR",
        type: income.type,
        frequency: income.frequency || "monthly",
        contractDurationMonths: income.contractDurationMonths || "",
        startDate: moment(income.startDate).format("YYYY-MM-DD"),
        endDate: income.endDate ? moment(income.endDate).format("YYYY-MM-DD") : "",
        status: income.status || "active",
        notes: income.notes || "",
      });
      setInstallments(
        income.installments?.length
          ? income.installments.map((i) => ({
              amount: i.amount,
              dueDate: moment(i.dueDate).format("YYYY-MM-DD"),
              status: i.status,
            }))
          : [{ amount: "", dueDate: moment().add(1, "months").format("YYYY-MM-DD"), status: "unpaid" }]
      );
    } else {
      setForm(buildDefaultForm());
      setInstallments([
        { amount: "", dueDate: moment().add(1, "months").format("YYYY-MM-DD"), status: "unpaid" },
      ]);
    }
  }, [income]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      income ? updateIncome(income._id, payload) : createIncome(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["incomes"]);
      toast.success(`Income stream ${income ? "updated" : "created"} successfully`);
      onClose();
    },
    onError: () => toast.error("Something went wrong"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const isInstallments = form.type === "freelance_installments";

    let endDate = form.endDate;
    if (form.type === "contract" && form.contractDurationMonths) {
      endDate = moment(form.startDate)
        .add(Number(form.contractDurationMonths), "months")
        .format("YYYY-MM-DD");
    }

    mutation.mutate({
      ...form,
      amount: Number(form.amount),
      contractDurationMonths: form.contractDurationMonths
        ? Number(form.contractDurationMonths)
        : undefined,
      endDate: endDate || undefined,
      installments: isInstallments
        ? installments.map((i) => ({ amount: Number(i.amount), dueDate: i.dueDate, status: i.status }))
        : [],
    });
  };

  // Installment helpers
  const addInstallment = () =>
    setInstallments([
      ...installments,
      { amount: "", dueDate: moment().add(installments.length + 1, "months").format("YYYY-MM-DD"), status: "unpaid" },
    ]);
  const removeInstallment = (i) => { const l = [...installments]; l.splice(i, 1); setInstallments(l); };
  const changeInstallment = (i, key, val) => { const l = [...installments]; l[i][key] = val; setInstallments(l); };

  const sym = getCurrencySymbol(form.currency);
  const isInstallments = form.type === "freelance_installments";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={income ? "Edit Income Stream" : "Add Income Stream"}
      dialogClasses={{panel:"max-w-2xl"}}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

        {/* Source */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Source / Payer</label>
          <Input
            required
            value={form.source}
            onChange={(e) => set("source", e.target.value)}
            placeholder="e.g., Acme Corp, Client XYZ"
          />
        </div>

        {/* Type + Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Income Type</label>
            <Select options={INCOME_TYPES} value={form.type} onChange={(e) => set("type", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
            <Select options={CURRENCY_OPTIONS} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
          </div>
        </div>

        {/* Estimated amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {form.type === "freelance_one_time" || isInstallments
              ? `Total Contract Sum (${form.currency})`
              : `Estimated Monthly Income (${form.currency})`}
          </label>
          <Input
            required
            type="number"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder={
              form.type === "freelance_one_time" || isInstallments
                ? "Full contract value"
                : "What you typically receive each month"
            }
          />
        </div>

        {/* Contract duration */}
        {form.type === "contract" && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Months)</label>
              <Input
                type="number"
                value={form.contractDurationMonths}
                onChange={(e) => set("contractDurationMonths", e.target.value)}
                placeholder="e.g., 3, 6, 12"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (Auto-calculated)</label>
              <div className="h-10 px-3 py-2 bg-slate-100 text-slate-600 rounded-md text-sm border border-slate-300 flex items-center">
                {form.contractDurationMonths
                  ? moment(form.startDate).add(Number(form.contractDurationMonths), "months").format("LL")
                  : "Enter duration"}
              </div>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
            <Input required type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          {form.type !== "contract" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (Optional)</label>
              <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </div>
          )}
        </div>

        {/* Freelance installments */}
        {isInstallments && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-800">Installment / Milestone Ledger</span>
              <button type="button" onClick={addInstallment} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Step
              </button>
            </div>
            {installments.map((inst, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input type="number" required placeholder={`${sym} Amount`} value={inst.amount} onChange={(e) => changeInstallment(i, "amount", e.target.value)} />
                <Input type="date" required value={inst.dueDate} onChange={(e) => changeInstallment(i, "dueDate", e.target.value)} />
                {installments.length > 1 && (
                  <button type="button" onClick={() => removeInstallment(i)} className="text-red-500 hover:text-red-700 p-1.5 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Stream Status</label>
          <Select
            options={[
              { label: "Active", value: "active" },
              { label: "Completed / Finished", value: "completed" },
              { label: "Paused / Suspended", value: "paused" },
            ]}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
          <Input
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="e.g., Project details, point of contact"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : income ? "Save Changes" : "Create Stream"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
