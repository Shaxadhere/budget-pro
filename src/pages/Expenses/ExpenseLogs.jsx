import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpense, updateExpense } from "../../api/expenses";
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

export default function ExpenseLogs() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [year, setYear] = useState(moment().year());

  const [logModal, setLogModal] = useState({ isOpen: false, monthNum: null, existingLog: null });
  const [logForm, setLogForm] = useState({
    paymentDate: "",
    actualAmount: "",
    notes: ""
  });

  const { data, isLoading } = useQuery({
    queryKey: ["expense", id],
    queryFn: () => getExpense(id),
  });
  
  const expense = data?.data;

  useEffect(() => { 
    if (expense) document.title = `${expense.title} Logs | InvoicingPro`; 
  }, [expense]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateExpense(id, data),
    onSuccess: () => { 
      queryClient.invalidateQueries(["expense", id]); 
      setLogModal({ isOpen: false, monthNum: null, existingLog: null });
      toast.success("Expense log saved successfully"); 
    },
    onError: () => toast.error("Failed to save log"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-semibold">Loading calendar...</p>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-20 text-slate-500">
        <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="font-semibold text-slate-700">Expense Not Found</p>
        <Link to="/expenses" className="text-indigo-600 hover:underline mt-2 inline-block">Go Back</Link>
      </div>
    );
  }

  const sym = "PKR";
  const estimatedAmount = expense.isVariableAmount ? expense.estimatedAmount : expense.amount;

  // Build 12 month array
  const monthsData = MONTH_NAMES.map((monthName, i) => {
    const monthNum = i + 1;
    const log = expense.monthlyActuals?.find(l => l.month === monthNum && l.year === year);
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
         paymentDate: m.log.paymentDate ? moment(m.log.paymentDate).format("YYYY-MM-DD") : defaultDate,
         actualAmount: m.log.actualAmount ?? "",
         notes: m.log.notes || ""
       });
    } else {
       setLogForm({
         paymentDate: defaultDate,
         actualAmount: estimatedAmount,
         notes: ""
       });
    }
    setLogModal({ isOpen: true, monthNum: m.monthNum, existingLog: m.log });
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!logModal.monthNum) return;

    const paymentDate = moment(logForm.paymentDate);
    const amount = Number(logForm.actualAmount);

    const newLog = {
      ...(logModal.existingLog || {}),
      paymentDate: paymentDate.toDate(),
      month: logModal.monthNum,
      year: year,
      actualAmount: amount,
      notes: logForm.notes,
      status: "paid"
    };

    let updatedLogs = [...(expense.monthlyActuals || [])];
    if (logModal.existingLog) {
       const idx = updatedLogs.findIndex(l => l.month === logModal.monthNum && l.year === year);
       if (idx !== -1) updatedLogs[idx] = newLog;
    } else {
       updatedLogs.push(newLog);
    }

    updateMutation.mutate({ id: expense._id, data: { monthlyActuals: updatedLogs } });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/expenses" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Expenses
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-indigo-600" />
            Payment Calendar: {expense.title}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tracking actual payments for {year} against {expense.isVariableAmount ? `estimated ${sym} ${estimatedAmount.toLocaleString()}/mo.` : `fixed ${sym} ${estimatedAmount.toLocaleString()}/mo.`}
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
          else if (hasLog && log.status === "paid") boxClasses += " bg-green-50/50 border-green-200";
          else if (hasLog && log.status === "unpaid") boxClasses += " bg-red-50/50 border-red-200";
          else if (!m.isFuture) boxClasses += " bg-slate-50 border-slate-200 opacity-80"; // past unpaid
          
          return (
            <div 
              key={m.monthNum} 
              className={`p-4 rounded-2xl border shadow-sm flex flex-col h-40 transition-all ${boxClasses}`}
              onClick={() => handleBoxClick(m)}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`font-bold text-lg ${m.isCurrent ? "text-indigo-900" : "text-slate-700"}`}>
                  {m.monthName}
                </span>
                {hasLog && (
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    log.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {log.status}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {hasLog ? (
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-slate-900">
                      {sym} {log.actualAmount.toLocaleString()}
                    </p>
                    {log.paymentDate && (
                      <p className="text-xs text-slate-500 font-medium">
                        Paid: {moment(log.paymentDate).format("MMM DD, YYYY")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-400">Click to log payment</p>
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
          title={`${logModal.existingLog ? 'Edit' : 'Log'} Payment: ${MONTH_NAMES[logModal.monthNum - 1]} ${year}`}
        >
          <form onSubmit={handleLogSubmit} className="space-y-4">
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount Paid ({sym})
              </label>
              <Input
                required
                type="number"
                value={logForm.actualAmount}
                onChange={(e) => setLogForm({ ...logForm, actualAmount: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
              <Input
                value={logForm.notes}
                onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                placeholder="e.g. Paid online"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setLogModal({ isOpen: false, monthNum: null, existingLog: null })}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>Save Log</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
