import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "../../api/invoices";
import { getCompanies } from "../../api/companies";
import { getExpenses } from "../../api/expenses";
import { getIncomes } from "../../api/incomes";
import { getLoans } from "../../api/loans";
import {
  Plus,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Loader2,
  Wallet,
  Briefcase,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import StatsCard from "../../components/dashboard/StatsCard";
import RevenueChart from "../../components/dashboard/RevenueChart";
import moment from "moment";

export default function Dashboard() {
  const [chartView, setChartView] = useState("monthly"); // weekly, monthly, yearly
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");
  const [activeTab, setActiveTab] = useState("invoices"); // invoices, incomes, expenses, monthly_report
  const [reportMonth, setReportMonth] = useState(moment().format("YYYY-MM"));

  // Queries
  const { data: invoicesData, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ["invoices", "dashboard"],
    queryFn: () => getInvoices({ size: 1000 })
  });

  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompanies()
  });

  const { data: expensesData, isLoading: isExpensesLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => getExpenses({ size: 1000 })
  });

  const { data: incomesData, isLoading: isIncomesLoading } = useQuery({
    queryKey: ["incomes"],
    queryFn: () => getIncomes({ size: 1000 })
  });

  const { data: loansData, isLoading: isLoansLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => getLoans({ size: 1000 })
  });

  const invoices = invoicesData?.data?.docs || [];
  const companies = companiesData?.data?.docs || [];
  const expenses = expensesData?.data?.docs || [];
  const incomes = incomesData?.data?.docs || [];
  const loans = loansData?.data?.docs || [];

  const companyOptions = [
    { label: "All Companies", value: "all" },
    ...companies.map((c) => ({
      label: c.companyName,
      value: c.companyName
    }))
  ];

  const filteredInvoices = useMemo(() => {
    if (selectedCompanyId === "all") return invoices;
    return invoices.filter((inv) => inv.companyName === selectedCompanyId);
  }, [invoices, selectedCompanyId]);

  // Combined Financial Overview Calculations
  const financialStats = useMemo(() => {
    // 1. Invoices metrics
    const totalInvoiceRevenue = filteredInvoices.reduce(
      (acc, inv) => acc + (inv.totalAmount || 0),
      0
    );
    const paidInvoicesCount = filteredInvoices.filter(
      (inv) => inv.invoiceStatus === "Paid"
    ).length;
    const pendingInvoicesCount = filteredInvoices.filter(
      (inv) => inv.invoiceStatus === "Pending"
    ).length;

    // 2. Income stream yields this month
    const monthlyIncomeProj = incomes.reduce((acc, inc) => {
      if (inc.status !== "active") return acc;
      if (inc.type === "permanent" || inc.type === "retainer") {
        return acc + (inc.amount || 0);
      }
      if (inc.type === "contract") {
        const isCurrent = inc.endDate ? moment().isBefore(moment(inc.endDate)) : true;
        return isCurrent ? acc + (inc.amount || 0) : acc;
      }
      if (inc.type === "freelance_installments") {
        const thisMonthInstallments = (inc.installments || []).reduce((instAcc, inst) => {
          const isThisMonth = moment(inst.dueDate).isSame(moment(), "month");
          return instAcc + (isThisMonth ? inst.amount : 0);
        }, 0);
        return acc + thisMonthInstallments;
      }
      if (inc.type === "freelance_one_time") {
        const isThisMonth = moment(inc.startDate).isSame(moment(), "month");
        return acc + (isThisMonth ? inc.amount : 0);
      }
      return acc;
    }, 0);

    // 3. Unpaid expenses due this month
    const monthlyExpenseProj = expenses.reduce((acc, exp) => {
      if (exp.status === "paid") return acc;
      const isDueThisMonth = moment(exp.dueDate).isSame(moment(), "month");
      if (exp.isRecurring && exp.recurringPeriod === "monthly") {
        return acc + (exp.amount || 0);
      }
      if (isDueThisMonth) {
        return acc + (exp.amount || 0);
      }
      return acc;
    }, 0);

    // 4. Loan EMI commitments
    const monthlyEMICommitment = loans.reduce((acc, loan) => {
      if (loan.status === "active" && loan.emiAmount) {
        return acc + (loan.type === "taken" ? loan.emiAmount : -loan.emiAmount);
      }
      return acc;
    }, 0);

    const netCashFlow = monthlyIncomeProj - monthlyExpenseProj - (monthlyEMICommitment > 0 ? monthlyEMICommitment : 0);

    // 5. Invoices Chart data mapping
    let chartData = [];
    if (chartView === "weekly") {
      const startOfWeek = moment().startOf("isoWeek");
      const endOfWeek = moment().endOf("isoWeek");
      const daysMap = {};
      for (let i = 0; i <= 6; i++) {
        daysMap[moment(startOfWeek).add(i, "days").format("ddd")] = 0;
      }
      filteredInvoices.forEach((inv) => {
        const invDate = moment(inv.invoiceDate);
        if (invDate.isBetween(startOfWeek, endOfWeek, "day", "[]")) {
          const day = invDate.format("ddd");
          daysMap[day] += inv.totalAmount;
        }
      });
      chartData = Object.keys(daysMap).map((name) => ({
        name,
        amount: daysMap[name]
      }));
    } else if (chartView === "monthly") {
      const startOfYear = moment().startOf("year");
      const endOfYear = moment().endOf("year");
      const monthsMap = {};
      for (let i = 0; i < 12; i++) {
        monthsMap[moment(startOfYear).add(i, "months").format("MMM")] = 0;
      }
      filteredInvoices.forEach((inv) => {
        const invDate = moment(inv.invoiceDate);
        if (invDate.isBetween(startOfYear, endOfYear, "day", "[]")) {
          const month = invDate.format("MMM");
          monthsMap[month] += inv.totalAmount;
        }
      });
      chartData = Object.keys(monthsMap).map((name) => ({
        name,
        amount: monthsMap[name]
      }));
    } else if (chartView === "yearly") {
      const yearsMap = {};
      const currentYear = moment().year();
      for (let i = 4; i >= 0; i--) {
        yearsMap[currentYear - i] = 0;
      }
      filteredInvoices.forEach((inv) => {
        const invYear = moment(inv.invoiceDate).year();
        if (yearsMap.hasOwnProperty(invYear)) {
          yearsMap[invYear] += inv.totalAmount;
        }
      });
      chartData = Object.keys(yearsMap).map((name) => ({
        name,
        amount: yearsMap[name]
      }));
    }

    return {
      totalInvoiceRevenue,
      paidInvoicesCount,
      pendingInvoicesCount,
      monthlyIncomeProj,
      monthlyExpenseProj,
      monthlyEMICommitment,
      netCashFlow,
      chartData
    };
  }, [filteredInvoices, chartView, incomes, expenses, loans]);

  // Group expenses by category for breakdown card
  const expenseBreakdown = useMemo(() => {
    const breakdown = {};
    expenses.forEach((exp) => {
      const amt = exp.amount || 0;
      breakdown[exp.category] = (breakdown[exp.category] || 0) + amt;
    });
    return Object.keys(breakdown).map((cat) => ({
      category: cat,
      amount: breakdown[cat]
    })).sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // Monthly Report Calculations
  const monthlyReportData = useMemo(() => {
    if (!reportMonth) return { totalIncome: 0, totalExpense: 0, totalLoansPaid: 0, transactions: [] };

    const year = parseInt(reportMonth.split("-")[0]);
    const month = parseInt(reportMonth.split("-")[1]); // 1-12

    let totalIncome = 0;
    let totalExpense = 0;
    let totalLoansPaid = 0;
    const transactions = [];

    incomes.forEach((inc) => {
      inc.monthlyLogs?.forEach((log) => {
        if (log.year === year && log.month === month && log.actualAmount > 0) {
          totalIncome += log.actualAmount;
          transactions.push({
            id: `inc-${inc._id}-${log.month}`,
            type: "Income",
            source: inc.source,
            amount: log.actualAmount,
            isPositive: true,
          });
        }
      });
    });

    expenses.forEach((exp) => {
      exp.monthlyActuals?.forEach((log) => {
        if (log.year === year && log.month === month && log.actualAmount > 0) {
          totalExpense += log.actualAmount;
          transactions.push({
            id: `exp-${exp._id}-${log.month}`,
            type: "Expense",
            source: exp.title,
            amount: log.actualAmount,
            isPositive: false,
          });
        }
      });
    });

    loans.forEach((loan) => {
      loan.payments?.forEach((pay) => {
        const payMoment = moment(pay.paymentDate);
        if (payMoment.year() === year && payMoment.month() + 1 === month) {
          if (loan.type === "ledger") {
            if (pay.transactionType === "gave") {
              totalLoansPaid += pay.amount;
              transactions.push({
                id: pay._id || Math.random().toString(),
                type: "Ledger (Gave)",
                source: loan.lenderOrBorrowerName,
                amount: pay.amount,
                isPositive: false,
              });
            } else if (pay.transactionType === "received") {
              totalIncome += pay.amount;
              transactions.push({
                id: pay._id || Math.random().toString(),
                type: "Ledger (Received)",
                source: loan.lenderOrBorrowerName,
                amount: pay.amount,
                isPositive: true,
              });
            }
          } else if (loan.type === "taken") {
            totalLoansPaid += pay.amount;
            transactions.push({
              id: pay._id || Math.random().toString(),
              type: "Loan Repayment",
              source: loan.lenderOrBorrowerName,
              amount: pay.amount,
              isPositive: false,
            });
          } else if (loan.type === "given") {
            totalIncome += pay.amount;
            transactions.push({
              id: pay._id || Math.random().toString(),
              type: "Loan Recovered",
              source: loan.lenderOrBorrowerName,
              amount: pay.amount,
              isPositive: true,
            });
          }
        }
      });
    });

    return { totalIncome, totalExpense, totalLoansPaid, transactions };
  }, [reportMonth, incomes, expenses, loans]);

  const isLoading = isInvoicesLoading || isIncomesLoading || isExpensesLoading || isLoansLoading;

  return (
    <div className="space-y-8 pb-10">
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome to your workspace financial overview</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="w-full md:w-64">
            <Select
              options={companyOptions}
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              placeholder="Filter by Company"
            />
          </div>
          <Link to="/invoices/create" className="shrink-0">
            <Button className="gap-2 shadow-lg shadow-indigo-200">
              <Plus className="h-4 w-4" /> Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Level Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Invoiced Revenue"
          value={isLoading ? "..." : `PKR ${financialStats.totalInvoiceRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="indigo"
        />
        <StatsCard
          title="Projected Income (This Month)"
          value={isLoading ? "..." : `PKR ${financialStats.monthlyIncomeProj.toLocaleString()}`}
          icon={Briefcase}
          color="green"
        />
        <StatsCard
          title="Due Bills & Expenses"
          value={isLoading ? "..." : `PKR ${financialStats.monthlyExpenseProj.toLocaleString()}`}
          icon={Calendar}
          color="rose"
        />
        <StatsCard
          title="Net Cashflow Forecast"
          value={isLoading ? "..." : `PKR ${financialStats.netCashFlow.toLocaleString()}`}
          icon={Wallet}
          color="amber"
        />
      </div>

      {/* Tab Selectors for Tabbed Overview */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {[
            { id: "invoices", label: "Invoices & Revenue" },
            { id: "incomes", label: "Income Stream Summary" },
            { id: "expenses", label: "Expenses & Bill Log" },
            { id: "monthly_report", label: "Monthly Report" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Views */}
      <div className="space-y-6">
        {/* TAB 1: INVOICES & REVENUE */}
        {activeTab === "invoices" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
                  <span className="text-xs font-medium text-slate-500">
                    {chartView === "weekly" ? "This Week" : chartView === "monthly" ? "This Year" : "Last 5 Years"}
                  </span>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                  {["weekly", "monthly", "yearly"].map((view) => (
                    <button
                      key={view}
                      onClick={() => setChartView(view)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                        chartView === view
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  <Loader2 className="animate-spin text-indigo-600 h-8 w-8" />
                </div>
              ) : financialStats.chartData.length > 0 ? (
                <RevenueChart data={financialStats.chartData} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 flex-col gap-2">
                  <TrendingUp className="h-8 w-8 opacity-50" />
                  <span>No revenue data for this period</span>
                </div>
              )}
            </div>

            {/* Recent Invoices List */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
              <div className="flex-1 overflow-auto space-y-4 pr-1">
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-indigo-600 h-6 w-6" />
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="text-center text-slate-500 py-10 flex flex-col items-center">
                    <FileText className="h-10 w-10 mb-2 opacity-20" />
                    No recent activity found
                  </div>
                ) : (
                  filteredInvoices.slice(0, 5).map((invoice) => (
                    <Link to={`/invoices/${invoice._id}`} key={invoice._id}>
                      <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{invoice.clientName}</p>
                            <p className="text-xs text-slate-500">
                              #{invoice.invoiceNumber} • {invoice.companyName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">
                            {invoice.currency} {invoice.totalAmount}
                          </p>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              invoice.invoiceStatus === "Paid"
                                ? "bg-green-100 text-green-700"
                                : invoice.invoiceStatus === "Pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {invoice.invoiceStatus}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <Link
                to="/invoices"
                className="mt-4 pt-4 border-t border-slate-100 text-center text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                View All Invoices
              </Link>
            </div>
          </div>
        )}

        {/* TAB 2: INCOME STREAM SUMMARY */}
        {activeTab === "incomes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Active Income List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Active Inflows This Month</h3>
                <Link to="/incomes">
                  <Button size="sm" variant="outline">Manage Incomes</Button>
                </Link>
              </div>

              {incomes.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  No income sources registered.
                </div>
              ) : (
                <div className="space-y-4">
                  {incomes.slice(0, 5).map((inc) => (
                    <div key={inc._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                      <div>
                        <p className="font-bold text-slate-900">{inc.source}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          Type: {inc.type.replace("_", " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-950">PKR {inc.amount.toLocaleString()}</p>
                        <span className="text-[10px] text-slate-400 font-medium capitalize">{inc.frequency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Income breakdown panel */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Yield Overview</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-700">Projected Income</p>
                    <p className="text-2xl font-black mt-1">PKR {financialStats.monthlyIncomeProj.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Permanent Salaries</span>
                      <span className="font-bold text-slate-800">
                        PKR {incomes.filter(i => i.type === "permanent" && i.status === "active").reduce((a, b) => a + b.amount, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Monthly Retainers</span>
                      <span className="font-bold text-slate-800">
                        PKR {incomes.filter(i => i.type === "retainer" && i.status === "active").reduce((a, b) => a + b.amount, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Client Contracts</span>
                      <span className="font-bold text-slate-800">
                        PKR {incomes.filter(i => i.type === "contract" && i.status === "active").reduce((a, b) => a + b.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Link to="/incomes" className="mt-4 pt-4 border-t border-slate-100 text-center text-sm text-indigo-600 font-semibold hover:text-indigo-700">
                Configure Streams
              </Link>
            </div>
          </div>
        )}

        {/* TAB 3: EXPENSES & BILL LOG */}
        {activeTab === "expenses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Upcoming Unpaid Bills */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Pending Outstandings</h3>
                <Link to="/expenses">
                  <Button size="sm" variant="outline">Manage Expenses</Button>
                </Link>
              </div>

              {expenses.filter(e => e.status !== "paid").length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
                  All bills cleared this cycle!
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.filter(e => e.status !== "paid").slice(0, 5).map((exp) => (
                    <div key={exp._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">{exp.title}</p>
                        <p className="text-xs text-slate-500">
                          Due: {moment(exp.dueDate).format("MMM DD, YYYY")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-rose-600">PKR {exp.amount.toLocaleString()}</p>
                        <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-full font-bold">Unpaid</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Category Allocations</h3>
                {expenseBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-400">No expense logs logged yet.</p>
                ) : (
                  <div className="space-y-3.5">
                    {expenseBreakdown.slice(0, 5).map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{cat.category}</span>
                          <span>PKR {cat.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full"
                            style={{
                              width: `${(cat.amount / expenses.reduce((a, b) => a + b.amount, 0)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/expenses" className="mt-4 pt-4 border-t border-slate-100 text-center text-sm text-indigo-600 font-semibold hover:text-indigo-700">
                Add Expense Category
              </Link>
            </div>
          </div>
        )}

        {/* TAB 4: MONTHLY REPORT */}
        {activeTab === "monthly_report" && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Comprehensive Monthly Report</h3>
                <p className="text-sm text-slate-500">Track exactly where your money went and came from.</p>
              </div>
              <div>
                <input
                  type="month"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-5 rounded-2xl bg-green-50 border border-green-100">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Money In (Incomes)</p>
                <p className="text-3xl font-black text-green-700 mt-2">PKR {monthlyReportData.totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Money Out (Expenses)</p>
                <p className="text-3xl font-black text-rose-700 mt-2">PKR {monthlyReportData.totalExpense.toLocaleString()}</p>
              </div>
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Loans & Ledgers Paid</p>
                <p className="text-3xl font-black text-amber-700 mt-2">PKR {monthlyReportData.totalLoansPaid.toLocaleString()}</p>
              </div>
            </div>

            <h4 className="text-md font-bold text-slate-900 mb-4">Transaction Details</h4>
            {monthlyReportData.transactions.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                No logs found for this month. Go to Incomes, Expenses or Loans to log activity.
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 font-semibold text-slate-900 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Source / Title</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyReportData.transactions.map((t, i) => (
                      <tr key={t.id || i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {t.source}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            t.type === "Income" ? "bg-green-100 text-green-700" :
                            t.type === "Expense" ? "bg-rose-100 text-rose-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-black ${t.isPositive ? 'text-green-600' : 'text-rose-600'}`}>
                          {t.isPositive ? "+" : "-"} PKR {t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {/* Net Total Row */}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td colSpan={2} className="px-6 py-4 text-right">NET REMAINING THIS MONTH</td>
                      <td className="px-6 py-4 text-right">
                        PKR {(monthlyReportData.totalIncome - monthlyReportData.totalExpense - monthlyReportData.totalLoansPaid).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
