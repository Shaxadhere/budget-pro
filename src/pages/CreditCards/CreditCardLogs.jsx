import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCreditCard, updateCreditCard } from "../../api/creditCards";
import { 
  Calendar as CalendarIcon, Loader2, ArrowLeft, ChevronLeft, ChevronRight, AlertCircle
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import moment from "moment";
import toast from "react-hot-toast";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function CreditCardLogs() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [year, setYear] = useState(moment().year());

  const [logModal, setLogModal] = useState({ isOpen: false, monthNum: null, existingLog: null });
  const [logForm, setLogForm] = useState({
    statementBalance: "",
    minimumPayment: "",
    actualPaidAmount: "",
    paymentDate: "",
    notes: ""
  });

  const { data, isLoading } = useQuery({
    queryKey: ["creditCard", id],
    queryFn: () => getCreditCard(id),
  });
  
  const card = data;

  useEffect(() => { 
    if (card) document.title = `${card.cardName} | InvoicingPro`; 
  }, [card]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCreditCard(id, data),
    onSuccess: () => { 
      queryClient.invalidateQueries(["creditCard", id]); 
      setLogModal({ isOpen: false, monthNum: null, existingLog: null });
      toast.success("Bill logged successfully"); 
    },
    onError: () => toast.error("Failed to log bill"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-semibold">Loading calendar...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center py-20 text-slate-500">
        <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="font-semibold text-slate-700">Credit Card Not Found</p>
        <Link to="/credit-cards" className="text-indigo-600 hover:underline mt-2 inline-block">Go Back</Link>
      </div>
    );
  }

  const sym = card.currency || "PKR";

  // Build 12 month array
  const monthsData = MONTH_NAMES.map((monthName, i) => {
    const monthNum = i + 1;
    const log = card.monthlyBills?.find(l => l.month === monthNum && l.year === year);
    return {
      monthName,
      monthNum,
      log,
      isFuture: moment().isBefore(moment(`${year}-${monthNum}-01`), 'month'),
      isCurrent: moment().isSame(moment(`${year}-${monthNum}-01`), 'month')
    };
  });

  const handleBoxClick = (m) => {
    const isCurrentMonth = moment().isSame(moment(`${year}-${m.monthNum}-01`), 'month');
    const defaultDate = isCurrentMonth 
      ? moment().format("YYYY-MM-DD")
      : moment(`${year}-${m.monthNum}-01`).endOf('month').format("YYYY-MM-DD");

    if (m.log) {
       setLogForm({
         statementBalance: m.log.statementBalance ?? "",
         minimumPayment: m.log.minimumPayment ?? "",
         actualPaidAmount: m.log.actualPaidAmount ?? "",
         paymentDate: m.log.paymentDate ? moment(m.log.paymentDate).format("YYYY-MM-DD") : defaultDate,
         notes: m.log.notes || ""
       });
    } else {
       setLogForm({
         statementBalance: "",
         minimumPayment: "",
         actualPaidAmount: "",
         paymentDate: defaultDate,
         notes: ""
       });
    }
    setLogModal({ isOpen: true, monthNum: m.monthNum, existingLog: m.log });
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!logModal.monthNum) return;

    const sb = Number(logForm.statementBalance);
    const min = Number(logForm.minimumPayment);
    const actual = Number(logForm.actualPaidAmount);
    
    let status = 'unpaid';
    if (actual >= sb && sb > 0) status = 'fully_paid';
    else if (actual > 0) status = 'partially_paid';
    if (sb === 0 && actual === 0) status = 'fully_paid'; // zero balance

    const newLog = {
      ...(logModal.existingLog || {}),
      month: logModal.monthNum,
      year: year,
      statementBalance: sb,
      minimumPayment: min,
      actualPaidAmount: actual,
      paymentDate: moment(logForm.paymentDate).toDate(),
      status,
      notes: logForm.notes
    };

    let updatedLogs = [...(card.monthlyBills || [])];
    if (logModal.existingLog) {
       const idx = updatedLogs.findIndex(l => l.month === logModal.monthNum && l.year === year);
       if (idx !== -1) updatedLogs[idx] = newLog;
    } else {
       updatedLogs.push(newLog);
    }

    updateMutation.mutate({ id: card._id, data: { monthlyBills: updatedLogs } });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/credit-cards" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Credit Cards
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-indigo-600" />
            {card.cardName} Bills
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Limit: {sym} {card.creditLimit.toLocaleString()} | Bill Gen: {card.billingCycleDate}th | Due: {card.dueDate}th
          </p>
        </div>

        {/* Year Toggle */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <Button variant="outline" size="sm" className="px-2" onClick={() => setYear(y => y - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-bold text-slate-800 text-lg w-16 text-center">{year}</span>
          <Button variant="outline" size="sm" className="px-2" onClick={() => setYear(y => y + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {monthsData.map((m) => {
          const hasLog = !!m.log;
          const log = m.log;
          
          let boxClasses = "bg-white border-slate-200 cursor-pointer hover:shadow-md hover:ring-2 hover:ring-indigo-500/30";
          if (m.isCurrent) boxClasses += " bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20";
          else if (hasLog && log.status === "fully_paid") boxClasses += " bg-green-50/50 border-green-200";
          else if (hasLog && log.status === "partially_paid") boxClasses += " bg-orange-50/50 border-orange-200";
          else if (hasLog && log.status === "unpaid") boxClasses += " bg-red-50/50 border-red-200";
          else if (!m.isFuture) boxClasses += " bg-slate-50 border-slate-200 opacity-80";
          
          return (
            <div 
              key={m.monthNum} 
              className={`p-4 rounded-2xl border shadow-sm flex flex-col h-44 transition-all ${boxClasses}`}
              onClick={() => handleBoxClick(m)}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`font-bold text-lg ${m.isCurrent ? "text-indigo-900" : "text-slate-700"}`}>
                  {m.monthName}
                </span>
                {hasLog && (
                  <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    log.status === "fully_paid" ? "bg-green-100 text-green-700" : 
                    log.status === "partially_paid" ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {log.status.replace("_", " ")}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {hasLog ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Statement</span>
                      <span className="text-sm font-bold text-slate-800">{sym} {log.statementBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Paid</span>
                      <span className="text-sm font-black text-indigo-700">{sym} {log.actualPaidAmount.toLocaleString()}</span>
                    </div>
                    {log.paymentDate && (
                      <p className="text-[10px] text-slate-400 font-medium mt-2 pt-2 border-t border-slate-100">
                        Paid on {moment(log.paymentDate).format("MMM DD, YYYY")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-400">Click to log bill</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Payment Modal */}
      {logModal.isOpen && (
        <Modal
          isOpen={logModal.isOpen}
          onClose={() => setLogModal({ isOpen: false, monthNum: null, existingLog: null })}
          title={`${logModal.existingLog ? 'Edit' : 'Log'} Bill: ${MONTH_NAMES[logModal.monthNum - 1]} ${year}`}
        >
          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Statement Balance ({sym})</label>
              <Input
                required
                type="number"
                value={logForm.statementBalance}
                onChange={(e) => setLogForm({ ...logForm, statementBalance: e.target.value })}
                placeholder="Full amount due"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Payment Required ({sym})</label>
              <Input
                required
                type="number"
                value={logForm.minimumPayment}
                onChange={(e) => setLogForm({ ...logForm, minimumPayment: e.target.value })}
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-indigo-700 mb-1">Actual Amount Paid ({sym})</label>
              <Input
                required
                type="number"
                value={logForm.actualPaidAmount}
                onChange={(e) => setLogForm({ ...logForm, actualPaidAmount: e.target.value })}
                className="bg-indigo-50 border-indigo-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date Paid</label>
              <Input
                required
                type="date"
                value={logForm.paymentDate}
                onChange={(e) => setLogForm({ ...logForm, paymentDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
              <Input
                value={logForm.notes}
                onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setLogModal({ isOpen: false, monthNum: null, existingLog: null })}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>Save Bill</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
