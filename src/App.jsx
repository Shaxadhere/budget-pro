import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import VerifyOtp from "./pages/Auth/VerifyOtp";
import ResetPassword from "./pages/Auth/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import CreateInvoice from "./pages/Invoices/CreateInvoice";
import ViewInvoice from "./pages/Invoices/ViewInvoice";
import CustomersList from "./pages/Customers/CustomersList";
import BankInfoList from "./pages/Settings/BankInfoList";
import CompaniesList from "./pages/Settings/CompaniesList";
import InvoicesList from "./pages/Invoices/InvoicesList";
import Loans from "./pages/Loans/Loans";
import LedgerDetails from "./pages/Loans/LedgerDetails";
import Expenses from "./pages/Expenses/Expenses";
import IncomesList from "./pages/Incomes/IncomesList";
import IncomeLogs from "./pages/Incomes/IncomeLogs";
import ExpenseLogs from "./pages/Expenses/ExpenseLogs";
import CreditCardsList from "./pages/CreditCards/CreditCardsList";
import CreditCardLogs from "./pages/CreditCards/CreditCardLogs";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<InvoicesList />} />
            <Route path="/invoices/create" element={<CreateInvoice />} />
            <Route path="/invoices/:id" element={<ViewInvoice />} />
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/loans/ledger/:id" element={<LedgerDetails />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/:id" element={<ExpenseLogs />} />
            <Route path="/incomes" element={<IncomesList />} />
            <Route path="/incomes/:id" element={<IncomeLogs />} />
            <Route path="/credit-cards" element={<CreditCardsList />} />
            <Route path="/credit-cards/:id" element={<CreditCardLogs />} />
            <Route path="/settings/bank-info" element={<BankInfoList />} />
            <Route path="/settings/companies" element={<CompaniesList />} />
            {/* Redirect unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
