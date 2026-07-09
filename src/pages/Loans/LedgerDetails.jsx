import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLoans, updateLoan } from "../../api/loans";
import { 
  ArrowLeft, Loader2, ArrowUpRight, ArrowDownRight, User, Plus
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import moment from "moment";
import toast from "react-hot-toast";

export default function LedgerDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [transactionModal, setTransactionModal] = useState({ isOpen: false, type: null }); // 'gave' or 'received'
  const [form, setForm] = useState({ amount: "", paymentDate: moment().format("YYYY-MM-DD"), note: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["loans"], // Because loan API returns all loans, we filter client side for now based on Loans.jsx pattern
    queryFn: () => getLoans({ size: 1000 })
  });

  const ledger = data?.data?.docs?.find(l => l._id === id);

  useEffect(() => { 
    if (ledger) document.title = `Ledger: ${ledger.lenderOrBorrowerName} | InvoicingPro`; 
  }, [ledger]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["loans"]);
      setTransactionModal({ isOpen: false, type: null });
      toast.success("Transaction logged");
    },
    onError: () => toast.error("Failed to log transaction")
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="font-semibold">Ledger not found</p>
        <Link to="/loans" className="text-indigo-600 hover:underline mt-2 inline-block">Go Back</Link>
      </div>
    );
  }

  // Calculate Running Balance
  // Positive means they owe you. Negative means you owe them.
  // Starting balance: amount (positive if taken=they owe? wait.
  // Actually, if amount > 0, it means starting balance. If type="ledger", let's just use payments to calculate it, 
  // and treat amount as starting balance if we set one, but we'll add that in creation.
  
  let balance = ledger.amount || 0; 
  // amount is initial balance. Positive = they owe you. Negative = you owe them.

  const sortedPayments = [...(ledger.payments || [])].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

  // Recalculate full balance
  const currentBalance = ledger.payments.reduce((acc, p) => {
    if (p.transactionType === 'gave') return acc + p.amount;
    if (p.transactionType === 'received') return acc - p.amount;
    return acc;
  }, balance);

  const isOwedToMe = currentBalance > 0;
  const iOweThem = currentBalance < 0;
  const settled = currentBalance === 0;

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    
    const newPayment = {
      amount,
      transactionType: transactionModal.type,
      paymentDate: moment(form.paymentDate).toDate(),
      note: form.note
    };

    updateMutation.mutate({
      id: ledger._id,
      data: { payments: [...ledger.payments, newPayment] }
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <Link to="/loans" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2">
        <ArrowLeft className="h-4 w-4" /> Back to Loans
      </Link>

      {/* Header Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 shrink-0">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{ledger.lenderOrBorrowerName}</h1>
            <p className="text-slate-500 text-sm">Give & Take Ledger</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Balance</p>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-black ${isOwedToMe ? 'text-green-600' : iOweThem ? 'text-red-600' : 'text-slate-600'}`}>
              PKR {Math.abs(currentBalance).toLocaleString()}
            </span>
          </div>
          <div className={`text-xs font-bold px-2.5 py-1 rounded-full mt-2 ${
            isOwedToMe ? "bg-green-100 text-green-700" :
            iOweThem ? "bg-red-100 text-red-700" :
            "bg-slate-100 text-slate-700"
          }`}>
            {isOwedToMe ? "They owe you" : iOweThem ? "You owe them" : "Settled Up"}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            setForm({ amount: "", paymentDate: moment().format("YYYY-MM-DD"), note: "" });
            setTransactionModal({ isOpen: true, type: 'gave' });
          }}
          className="bg-white border-2 border-green-100 hover:border-green-300 hover:bg-green-50 p-6 rounded-2xl transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="bg-green-100 text-green-600 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-green-900 text-lg">I Gave Money</h3>
          <p className="text-xs font-medium text-green-600/70 mt-1">Increases their debt to you</p>
        </button>

        <button
          onClick={() => {
            setForm({ amount: "", paymentDate: moment().format("YYYY-MM-DD"), note: "" });
            setTransactionModal({ isOpen: true, type: 'received' });
          }}
          className="bg-white border-2 border-red-100 hover:border-red-300 hover:bg-red-50 p-6 rounded-2xl transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="bg-red-100 text-red-600 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <ArrowDownRight className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-red-900 text-lg">I Received Money</h3>
          <p className="text-xs font-medium text-red-600/70 mt-1">Decreases their debt to you</p>
        </button>
      </div>

      {/* History */}
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-4">Transaction History</h3>
        
        {sortedPayments.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
            <p className="text-slate-500 font-medium">No transactions yet. Start by logging what you gave or received.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 font-semibold text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Note</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPayments.map((p, i) => (
                  <tr key={p._id || i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {moment(p.paymentDate).format("MMM DD, YYYY")}
                    </td>
                    <td className="px-6 py-4">
                      {p.transactionType === 'gave' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                          <ArrowUpRight className="h-3.5 w-3.5" /> You Gave
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                          <ArrowDownRight className="h-3.5 w-3.5" /> You Received
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      PKR {p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {p.note || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="text-red-400 hover:text-red-600 font-semibold text-xs"
                        onClick={() => {
                          if (window.confirm("Delete this transaction?")) {
                            const newPayments = ledger.payments.filter(pay => pay._id !== p._id);
                            updateMutation.mutate({ id: ledger._id, data: { payments: newPayments } });
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {transactionModal.isOpen && (
        <Modal
          isOpen={transactionModal.isOpen}
          onClose={() => setTransactionModal({ isOpen: false, type: null })}
          title={transactionModal.type === 'gave' ? "Log: You Gave Money" : "Log: You Received Money"}
        >
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (PKR)</label>
              <Input
                required
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <Input
                required
                type="date"
                value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Note (Optional)</label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="e.g. For dinner"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setTransactionModal({ isOpen: false, type: null })}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>Save</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
