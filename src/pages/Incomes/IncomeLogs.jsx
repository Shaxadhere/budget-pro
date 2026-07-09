import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIncome, updateIncome } from "../../api/incomes";
import { 
  Calendar as CalendarIcon, Loader2, ArrowLeft, ChevronLeft, ChevronRight, Briefcase
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import moment from "moment";
import toast from "react-hot-toast";
import { getCurrencySymbol } from "../../constants/currencies";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function IncomeLogs() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [year, setYear] = useState(moment().year());

  const [logModal, setLogModal] = useState({ isOpen: false, monthNum: null, existingLog: null });
  const [logForm, setLogForm] = useState({
    date: "",
    receivedAmount: "",
    deductions: "",
    deductionNotes: "",
    notes: ""
  });

  const { data, isLoading } = useQuery({
    queryKey: ["income", id],
    queryFn: () => getIncome(id),
  });
  
  const income = data?.data;

  useEffect(() => { 
    if (income) document.title = `${income.source} Logs | InvoicingPro`; 
  }, [income]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateIncome(id, data),
    onSuccess: () => { 
      queryClient.invalidateQueries(["income", id]); 
      setLogModal({ isOpen: false, monthNum: null, existingLog: null });
      toast.success("Income log saved successfully"); 
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

  if (!income) {
    return (
      <div className="text-center py-20 text-slate-500">
        <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="font-semibold text-slate-700">Income Stream Not Found</p>
        <Link to="/incomes" className="text-indigo-600 hover:underline mt-2 inline-block">Go Back</Link>
      </div>
    );
  }

  const sym = getCurrencySymbol(income.currency || "PKR");
  const estimatedAmount = income.amount || 0;

  // Build 12 month array
  const monthsData = MONTH_NAMES.map((monthName, i) => {
    const monthNum = i + 1;
    const log = income.monthlyLogs?.find(l => l.month === monthNum && l.year === year);
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
    // Default date to today if current month, else the last day of that month
    const defaultDate = isCurrentMonth 
      ? moment().format("YYYY-MM-DD")
      : moment(`${year}-${m.monthNum}-01`).endOf('month').format("YYYY-MM-DD");

    if (m.log) {
       setLogForm({
         date: m.log.date ? moment(m.log.date).format("YYYY-MM-DD") : defaultDate,
         receivedAmount: m.log.receivedAmount ?? "",
         deductions: m.log.deductions ?? "",
         deductionNotes: m.log.deductionNotes || "",
         notes: m.log.notes || ""
       });
    } else {
       setLogForm({
         date: defaultDate,
         receivedAmount: estimatedAmount,
         deductions: "",
         deductionNotes: "",
         notes: ""
       });
    }
    setLogModal({ isOpen: true, monthNum: m.monthNum, existingLog: m.log });
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!logModal.monthNum) return;

    const paymentDate = moment(logForm.date);
    const received = Number(logForm.receivedAmount);
    const deduct = Number(logForm.deductions) || 0;

    const newLog = {
      ...(logModal.existingLog || {}),
      date: paymentDate.toDate(),
      month: logModal.monthNum,
      year: year,
      receivedAmount: received,
      deductions: deduct,
      deductionNotes: logForm.deductionNotes,
      netAmount: received - deduct,
      notes: logForm.notes,
      status: "received"
    };

    let updatedLogs = [...(income.monthlyLogs || [])];
    if (logModal.existingLog) {
       // Update existing
       const idx = updatedLogs.findIndex(l => l.month === logModal.monthNum && l.year === year);
       if (idx !== -1) updatedLogs[idx] = newLog;
    } else {
       // Add new
       updatedLogs.push(newLog);
    }

    updateMutation.mutate({ id: income._id, data: { monthlyLogs: updatedLogs } });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/incomes" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Incomes
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-indigo-600" />
            Salary Calendar: {income.source}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tracking actual payments for {year} against your estimated {sym} {estimatedAmount.toLocaleString()}/mo.
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
          else if (hasLog && log.status === "received") boxClasses += " bg-green-50/50 border-green-200";
          else if (hasLog && log.status === "pending") boxClasses += " bg-amber-50/50 border-amber-200";
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
                    log.status === "received" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {log.status}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {hasLog ? (
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-slate-900">
                      {sym} {(log.netAmount ?? log.receivedAmount ?? 0).toLocaleString()}
                    </p>
                    {log.date && (
                      <p className="text-xs text-slate-500 font-medium">
                        Received: {moment(log.date).format("MMM DD, YYYY")}
                      </p>
                    )}
                    {log.deductions > 0 && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1">
                        -{sym} {log.deductions.toLocaleString()} deducted
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
                  Amount Received ({sym})
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
                  Deductions ({sym}) <span className="text-slate-400 font-normal">optional</span>
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
              <Button type="button" variant="outline" onClick={() => setLogModal({ isOpen: false, monthNum: null, existingLog: null })}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>Save Log</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
