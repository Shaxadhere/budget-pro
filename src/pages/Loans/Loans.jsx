import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLoans, createLoan, updateLoan, deleteLoan } from "../../api/loans";
import {
  Plus,
  Trash2,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Loader2,
  Users
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import moment from "moment";
import toast from "react-hot-toast";

const LOAN_TYPES = [
  { label: "Loan Taken (Money I Owe)", value: "taken" },
  { label: "Loan Given (Money Owed to Me)", value: "given" }
];

export default function Loans() {
  useEffect(() => {
    document.title = "Loans | InvoicingPro";
  }, []);

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("traditional"); // 'traditional' or 'ledgers'

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isPaymentLogModalOpen, setIsPaymentLogModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);

  const [editingLoan, setEditingLoan] = useState(null);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState(null);

  const [loanForm, setLoanForm] = useState({
    type: "taken",
    lenderOrBorrowerName: "",
    amount: "",
    interestRate: 0,
    totalAmountDue: "",
    totalAmountPaid: 0,
    startDate: moment().format("YYYY-MM-DD"),
    dueDate: "",
    emiAmount: "",
    frequency: "monthly",
    status: "active",
    notes: ""
  });

  const [ledgerForm, setLedgerForm] = useState({
    lenderOrBorrowerName: "",
    amount: "" // Starting balance (positive = they owe you, negative = you owe them)
  });

  const [paymentLogForm, setPaymentLogForm] = useState({
    amount: "",
    paymentDate: moment().format("YYYY-MM-DD"),
    note: ""
  });

  const { data: loansData, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => getLoans({ size: 1000 })
  });

  const loans = loansData?.data?.docs || [];

  const createLoanMutation = useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries(["loans"]);
      setIsLoanModalOpen(false);
      setIsLedgerModalOpen(false);
      toast.success("Successfully recorded");
    },
    onError: () => toast.error("Failed to create")
  });

  const updateLoanMutation = useMutation({
    mutationFn: ({ id, data }) => updateLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["loans"]);
      setIsLoanModalOpen(false);
      setIsPaymentLogModalOpen(false);
      toast.success("Successfully updated");
    },
    onError: () => toast.error("Failed to update")
  });

  const deleteLoanMutation = useMutation({
    mutationFn: deleteLoan,
    onSuccess: () => {
      queryClient.invalidateQueries(["loans"]);
      toast.success("Successfully deleted");
    },
    onError: () => toast.error("Failed to delete")
  });

  const handleLoanSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...loanForm,
      amount: Number(loanForm.amount),
      interestRate: Number(loanForm.interestRate),
      totalAmountDue: Number(loanForm.totalAmountDue),
      emiAmount: loanForm.emiAmount ? Number(loanForm.emiAmount) : undefined
    };

    if (editingLoan) {
      updateLoanMutation.mutate({ id: editingLoan._id, data: payload });
    } else {
      createLoanMutation.mutate(payload);
    }
  };

  const handleLedgerSubmit = (e) => {
    e.preventDefault();
    createLoanMutation.mutate({
      type: "ledger",
      lenderOrBorrowerName: ledgerForm.lenderOrBorrowerName,
      amount: ledgerForm.amount ? Number(ledgerForm.amount) : 0,
      totalAmountDue: 0,
      status: "active"
    });
  };

  const handleLogPaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedLoanForPayment) return;

    const amountPaid = Number(paymentLogForm.amount);
    const newTotalPaid = (selectedLoanForPayment.totalAmountPaid || 0) + amountPaid;
    const isPaidFully = newTotalPaid >= selectedLoanForPayment.totalAmountDue;

    const newPayment = {
      amount: amountPaid,
      paymentDate: paymentLogForm.paymentDate,
      note: paymentLogForm.note
    };

    const updatedData = {
      totalAmountPaid: newTotalPaid,
      status: isPaidFully ? "paid" : selectedLoanForPayment.status,
      payments: [...(selectedLoanForPayment.payments || []), newPayment]
    };

    updateLoanMutation.mutate({ id: selectedLoanForPayment._id, data: updatedData });
  };

  const openLoanModal = (loan = null) => {
    if (loan) {
      setEditingLoan(loan);
      setLoanForm({
        type: loan.type,
        lenderOrBorrowerName: loan.lenderOrBorrowerName,
        amount: loan.amount,
        interestRate: loan.interestRate || 0,
        totalAmountDue: loan.totalAmountDue,
        totalAmountPaid: loan.totalAmountPaid || 0,
        startDate: moment(loan.startDate).format("YYYY-MM-DD"),
        dueDate: loan.dueDate ? moment(loan.dueDate).format("YYYY-MM-DD") : "",
        emiAmount: loan.emiAmount || "",
        frequency: loan.frequency || "monthly",
        status: loan.status,
        notes: loan.notes || ""
      });
    } else {
      setEditingLoan(null);
      setLoanForm({
        type: "taken",
        lenderOrBorrowerName: "",
        amount: "",
        interestRate: 0,
        totalAmountDue: "",
        totalAmountPaid: 0,
        startDate: moment().format("YYYY-MM-DD"),
        dueDate: "",
        emiAmount: "",
        frequency: "monthly",
        status: "active",
        notes: ""
      });
    }
    setIsLoanModalOpen(true);
  };

  const openPaymentLogModal = (loan) => {
    setSelectedLoanForPayment(loan);
    setPaymentLogForm({
      amount: loan.emiAmount || "",
      paymentDate: moment().format("YYYY-MM-DD"),
      note: `Installment for ${moment().format("MMMM YYYY")}`
    });
    setIsPaymentLogModalOpen(true);
  };

  const traditionalLoans = loans.filter(l => l.type === 'taken' || l.type === 'given');
  const ledgers = loans.filter(l => l.type === 'ledger');

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <PiggyBank className="h-8 w-8 text-indigo-600" />
            Loans & Ledgers
          </h1>
          <p className="text-slate-500 text-sm">Track traditional loans or manage running tabs with friends.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'traditional' ? (
            <Button onClick={() => openLoanModal()} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" /> Record Loan
            </Button>
          ) : (
            <Button onClick={() => {
              setLedgerForm({ lenderOrBorrowerName: "", amount: "" });
              setIsLedgerModalOpen(true);
            }} className="gap-2 shrink-0 bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4" /> Add Friend
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('traditional')}
          className={`pb-3 text-sm font-bold px-1 transition-colors ${
            activeTab === 'traditional'
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Traditional Loans
        </button>
        <button
          onClick={() => setActiveTab('ledgers')}
          className={`pb-3 text-sm font-bold px-1 transition-colors ${
            activeTab === 'ledgers'
              ? "border-b-2 border-teal-600 text-teal-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Give & Take Ledgers
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-slate-500 font-semibold">Gathering records...</p>
        </div>
      ) : activeTab === 'traditional' ? (
        /* TRADITIONAL LOANS UI */
        traditionalLoans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center">
            <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <PiggyBank className="h-7 w-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">No Traditional Loans Found</h4>
            <p className="text-slate-500 text-sm max-w-md mt-2">
              Keep track of funds taken from lenders or lent to partners. Record amounts, interest rates, and EMI schedules.
            </p>
            <Button onClick={() => openLoanModal()} className="mt-6">
              Log Your First Loan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Loans Taken Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-md flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-amber-600" />
                Loans Taken (To Repay)
              </h4>
              {traditionalLoans.filter(l => l.type === "taken").length === 0 ? (
                <p className="text-sm text-slate-500 bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200">
                  No outstanding debts registered.
                </p>
              ) : (
                traditionalLoans.filter(l => l.type === "taken").map((loan) => (
                  <div key={loan._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-slate-950 text-base">{loan.lenderOrBorrowerName}</h5>
                        <p className="text-xs text-slate-500">
                          Started: {moment(loan.startDate).format("MMM DD, YYYY")}
                          {loan.dueDate && ` • Due: ${moment(loan.dueDate).format("MMM DD, YYYY")}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          loan.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {loan.status === "paid" ? "Fully Repaid" : "Active"}
                        </span>
                        {loan.interestRate > 0 && (
                          <p className="text-[10px] text-slate-400 mt-1">{loan.interestRate}% interest</p>
                        )}
                      </div>
                    </div>

                    {/* Progress Meter */}
                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>Repayment Progress</span>
                        <span>
                          PKR {loan.totalAmountPaid?.toLocaleString() || 0} / PKR {loan.totalAmountDue.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(((loan.totalAmountPaid || 0) / loan.totalAmountDue) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {loan.emiAmount && (
                      <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Monthly Installment (EMI)</span>
                        <span className="font-bold text-slate-800">PKR {loan.emiAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {loan.emiAmount && (
                      <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Remaining Amount</span>
                        <span className="font-bold text-slate-800">PKR {(loan.totalAmountDue - (loan.totalAmountPaid || 0)).toLocaleString()}</span>
                      </div>
                    )}

                    {loan.notes && <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">{loan.notes}</p>}

                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => openLoanModal(loan)}>
                        Modify
                      </Button>
                      {loan.status !== "paid" && (
                        <Button size="sm" variant="primary" onClick={() => openPaymentLogModal(loan)}>
                          Log Payment
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => {
                        if (window.confirm("Delete this loan record?")) {
                          deleteLoanMutation.mutate(loan._id);
                        }
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Loans Given Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-md flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Loans Given (To Recover)
              </h4>
              {traditionalLoans.filter(l => l.type === "given").length === 0 ? (
                <p className="text-sm text-slate-500 bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200">
                  No active loans given.
                </p>
              ) : (
                traditionalLoans.filter(l => l.type === "given").map((loan) => (
                  <div key={loan._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-slate-950 text-base">{loan.lenderOrBorrowerName}</h5>
                        <p className="text-xs text-slate-500">
                          Lent: {moment(loan.startDate).format("MMM DD, YYYY")}
                          {loan.dueDate && ` • Collect: ${moment(loan.dueDate).format("MMM DD, YYYY")}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          loan.status === "paid" ? "bg-green-100 text-green-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {loan.status === "paid" ? "Recovered" : "Active"}
                        </span>
                      </div>
                    </div>

                    {/* Progress Meter */}
                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>Recovery Progress</span>
                        <span>
                          PKR {loan.totalAmountPaid?.toLocaleString() || 0} / PKR {loan.totalAmountDue.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(((loan.totalAmountPaid || 0) / loan.totalAmountDue) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {loan.emiAmount && (
                      <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Monthly Recovery EMI</span>
                        <span className="font-bold text-slate-800">PKR {loan.emiAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {loan.notes && <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">{loan.notes}</p>}

                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => openLoanModal(loan)}>
                        Modify
                      </Button>
                      {loan.status !== "paid" && (
                        <Button size="sm" variant="primary" onClick={() => openPaymentLogModal(loan)}>
                          Log Recovery
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => {
                        if (window.confirm("Delete this loan record?")) {
                          deleteLoanMutation.mutate(loan._id);
                        }
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      ) : (
        /* LEDGER UI */
        ledgers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center">
            <div className="h-14 w-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
              <Users className="h-7 w-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">No Friend Ledgers Found</h4>
            <p className="text-slate-500 text-sm max-w-md mt-2">
              Keep a running tab with your friends. Log who gave who what, and effortlessly track the running balance.
            </p>
            <Button onClick={() => setIsLedgerModalOpen(true)} className="mt-6 bg-teal-600 hover:bg-teal-700 text-white">
              Add Friend Ledger
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ledgers.map(ledger => {
              // Calculate Balance
              let balance = ledger.amount || 0;
              const currentBalance = (ledger.payments || []).reduce((acc, p) => {
                if (p.transactionType === 'gave') return acc + p.amount;
                if (p.transactionType === 'received') return acc - p.amount;
                return acc;
              }, balance);

              const isOwedToMe = currentBalance > 0;
              const iOweThem = currentBalance < 0;

              return (
                <Link to={`/loans/ledger/${ledger._id}`} key={ledger._id} className="block group">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-teal-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-xl">{ledger.lenderOrBorrowerName}</h3>
                        <p className="text-xs text-slate-500">Friend Ledger</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Current Balance</p>
                      <div className={`text-2xl font-black ${isOwedToMe ? 'text-green-600' : iOweThem ? 'text-red-600' : 'text-slate-500'}`}>
                        PKR {Math.abs(currentBalance).toLocaleString()}
                      </div>
                      <div className="mt-1 text-xs font-medium">
                        {isOwedToMe ? (
                          <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">They owe you</span>
                        ) : iOweThem ? (
                          <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full">You owe them</span>
                        ) : (
                          <span className="text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">Settled Up</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      )}

      {/* LOAN MODAL */}
      <Modal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        title={editingLoan ? "Edit Loan Details" : "Record New Loan"}
        dialogClasses={{ panel: "max-w-lg" }}
      >
        <form onSubmit={handleLoanSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Type</label>
              <Select
                options={LOAN_TYPES}
                value={loanForm.type}
                onChange={(e) => setLoanForm({ ...loanForm, type: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {loanForm.type === "taken" ? "Lender Name" : "Borrower Name"}
              </label>
              <Input
                required
                value={loanForm.lenderOrBorrowerName}
                onChange={(e) => setLoanForm({ ...loanForm, lenderOrBorrowerName: e.target.value })}
                placeholder={loanForm.type === "taken" ? "e.g., Bank Alfalah, Friend" : "e.g., Partner Name"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Principal Amount (PKR)</label>
              <Input
                required
                type="number"
                value={loanForm.amount}
                onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value, totalAmountDue: e.target.value })}
                placeholder="Principal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Due (Principal + Interest)</label>
              <Input
                required
                type="number"
                value={loanForm.totalAmountDue}
                onChange={(e) => setLoanForm({ ...loanForm, totalAmountDue: e.target.value })}
                placeholder="Total sum to clear"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interest Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={loanForm.interestRate}
                onChange={(e) => setLoanForm({ ...loanForm, interestRate: e.target.value })}
                placeholder="Interest percentage"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly EMI Commitment (Optional)</label>
              <Input
                type="number"
                value={loanForm.emiAmount}
                onChange={(e) => setLoanForm({ ...loanForm, emiAmount: e.target.value })}
                placeholder="EMI portion"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <Input
                required
                type="date"
                value={loanForm.startDate}
                onChange={(e) => setLoanForm({ ...loanForm, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due/Term Date</label>
              <Input
                type="date"
                value={loanForm.dueDate}
                onChange={(e) => setLoanForm({ ...loanForm, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <Select
              options={[
                { label: "Active Debt", value: "active" },
                { label: "Cleared / Paid", value: "paid" },
                { label: "Overdue", value: "overdue" }
              ]}
              value={loanForm.status}
              onChange={(e) => setLoanForm({ ...loanForm, status: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Notes</label>
            <Input
              value={loanForm.notes}
              onChange={(e) => setLoanForm({ ...loanForm, notes: e.target.value })}
              placeholder="Terms, contact number or payment details"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsLoanModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLoanMutation.isPending || updateLoanMutation.isPending}>
              Save Loan
            </Button>
          </div>
        </form>
      </Modal>

      {/* LEDGER MODAL */}
      <Modal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        title="Start Friend Ledger"
      >
        <form onSubmit={handleLedgerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Friend's Name</label>
            <Input
              required
              value={ledgerForm.lenderOrBorrowerName}
              onChange={(e) => setLedgerForm({ ...ledgerForm, lenderOrBorrowerName: e.target.value })}
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Starting Balance (PKR)</label>
            <Input
              type="number"
              value={ledgerForm.amount}
              onChange={(e) => setLedgerForm({ ...ledgerForm, amount: e.target.value })}
              placeholder="Optional: Use negative if you owe them, positive if they owe you"
            />
            <p className="text-[10px] text-slate-500 mt-1">E.g., 500 = they owe you 500. -500 = you owe them 500.</p>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsLedgerModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLoanMutation.isPending} className="bg-teal-600 hover:bg-teal-700 text-white">
              Create Ledger
            </Button>
          </div>
        </form>
      </Modal>

      {/* LOG PAYMENT MODAL (Traditional) */}
      <Modal
        isOpen={isPaymentLogModalOpen}
        onClose={() => setIsPaymentLogModalOpen(false)}
        title={selectedLoanForPayment?.type === "taken" ? "Log Repayment Made" : "Log Installment Recovered"}
      >
        <form onSubmit={handleLogPaymentSubmit} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
            <p className="text-slate-500">Loan Details:</p>
            <p className="font-bold text-slate-900 mt-1">{selectedLoanForPayment?.lenderOrBorrowerName}</p>
            <div className="flex justify-between mt-2 font-medium">
              <span>Outstanding Balance:</span>
              <span className="text-indigo-600">
                PKR {selectedLoanForPayment ? (selectedLoanForPayment.totalAmountDue - (selectedLoanForPayment.totalAmountPaid || 0)).toLocaleString() : 0}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paid Amount (PKR)</label>
            <Input
              required
              type="number"
              value={paymentLogForm.amount}
              onChange={(e) => setPaymentLogForm({ ...paymentLogForm, amount: e.target.value })}
              placeholder="e.g., EMI amount or custom partial amount"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <Input
              required
              type="date"
              value={paymentLogForm.paymentDate}
              onChange={(e) => setPaymentLogForm({ ...paymentLogForm, paymentDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Memo</label>
            <Input
              value={paymentLogForm.note}
              onChange={(e) => setPaymentLogForm({ ...paymentLogForm, note: e.target.value })}
              placeholder="e.g., Cash, Bank reference"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsPaymentLogModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateLoanMutation.isPending}>
              Log Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
