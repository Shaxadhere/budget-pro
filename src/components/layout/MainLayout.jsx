import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  LogOut,
  Plus,
  Users,
  Building2,
  Building,
  FileText,
  Briefcase,
  Calendar,
  PiggyBank,
  CreditCard as CreditCardIcon,
} from "lucide-react";
import Button from "../ui/Button";
import Header from "./Header";

const MainLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Invoices", path: "/invoices", icon: FileText },
    { label: "Customers", path: "/customers", icon: Users },
    { label: "Incomes", path: "/incomes", icon: Briefcase },
    { label: "Expenses", path: "/expenses", icon: Calendar },
    { label: "Credit Cards", path: "/credit-cards", icon: CreditCardIcon },
    { label: "Loans", path: "/loans", icon: PiggyBank },
    { label: "Bank Accounts", path: "/settings/bank-info", icon: Building2 },
    { label: "Companies", path: "/settings/companies", icon: Building },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-slate-200 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">InvoicingPro</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link to="/invoices/create">
            <Button className="w-full gap-2 shadow-lg shadow-indigo-200">
              <Plus className="h-4 w-4" /> New Invoice
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
